#!/usr/bin/env bash
# cleanup-workstation-tunnel.sh
#
# Run this ON THE WORKSTATION (the host that initiates `ssh -R …` to VM901).
# It removes the leaky `estio-platform@82.22.50.142` reverse-forward supervisor
# (which used to publish a dead :19000 listener on VM901) without touching the
# healthy `root@82.22.50.142` supervisor that publishes :9000.
#
# Usage:
#   sudo ./cleanup-workstation-tunnel.sh --dry-run   # show what would change
#   sudo ./cleanup-workstation-tunnel.sh --apply     # actually stop + disable
#
# Idempotent. Safe to re-run after a successful cleanup (it'll just print
# "nothing to do").
#
# Background:
#   - VM901 (82.22.50.142) sshd now enforces `PermitListen 9000`, so the bad
#     -R 0.0.0.0:19000:... bind is rejected at the server. The site is already
#     fully operational. This script just stops the workstation from reconnecting
#     1-3 times per second and spamming VM901's journalctl.
#
# See deploy/WORKSTATION_TUNNEL_FIX.md for the full story.

set -euo pipefail

REMOTE_HOST="82.22.50.142"
GOOD_USER="root"
BAD_USER="estio-platform"
GOOD_PORT=9000
BAD_PORT=19000

MODE=""
case "${1:-}" in
  --dry-run) MODE="dry-run" ;;
  --apply)   MODE="apply"   ;;
  *)
    echo "Usage: $0 --dry-run | --apply" >&2
    exit 64
    ;;
esac

c_red()    { printf '\033[31m%s\033[0m' "$*"; }
c_green()  { printf '\033[32m%s\033[0m' "$*"; }
c_yellow() { printf '\033[33m%s\033[0m' "$*"; }
c_dim()    { printf '\033[2m%s\033[0m' "$*"; }
hr()       { printf '%s\n' "------------------------------------------------------------"; }

if [[ "$EUID" -ne 0 ]]; then
  echo "This script needs to read all processes and stop systemd units. Re-run with: sudo $0 $MODE" >&2
  exit 77
fi

echo
echo "$(c_dim "Mode:") $MODE"
echo "$(c_dim "Target VM901:") $REMOTE_HOST"
echo "$(c_dim "KEEP login user:") ${GOOD_USER}@${REMOTE_HOST} (forward to :${GOOD_PORT})"
echo "$(c_dim "REMOVE login user:") ${BAD_USER}@${REMOTE_HOST} (forward to :${BAD_PORT})"
hr

###############################################################################
# 1) Process inventory
###############################################################################
echo "==> 1) Inventory of ssh / autossh processes targeting ${REMOTE_HOST}"
SELF_PID="$$"
PARENT_PID="$PPID"
mapfile -t ALL_PROC < <(ps -eo pid=,user=,comm=,args= \
  | awk -v rh="$REMOTE_HOST" -v self="$SELF_PID" -v parent="$PARENT_PID" '
      {
        pid = $1
        if (pid == self || pid == parent) next
        comm = $3
        if (comm != "ssh" && comm != "autossh" && comm != "sshpass") next
        if (index($0, rh) == 0) next
        # Reprint without the comm column so downstream parsing stays simple.
        line = $1 " " $2
        for (i = 4; i <= NF; i++) line = line " " $i
        print line
      }')

if [[ ${#ALL_PROC[@]} -eq 0 ]]; then
  echo "   $(c_dim "(no matching processes — supervisor may be between retries, or already cleaned up)")"
else
  printf '   %s\n' "${ALL_PROC[@]}"
fi

KEEP_PIDS=()
REMOVE_PIDS=()
REVIEW_PIDS=()

for line in "${ALL_PROC[@]}"; do
  pid="$(awk '{print $1}' <<<"$line")"
  args="$(cut -d' ' -f3- <<<"$line")"
  if   [[ "$args" == *"${BAD_USER}@${REMOTE_HOST}"* ]]  || [[ "$args" =~ [\ :]${BAD_PORT}[\ :] ]]; then
    REMOVE_PIDS+=("$pid")
  elif [[ "$args" == *"${GOOD_USER}@${REMOTE_HOST}"* ]] || [[ "$args" =~ [\ :]${GOOD_PORT}[\ :] ]]; then
    KEEP_PIDS+=("$pid")
  else
    REVIEW_PIDS+=("$pid")
  fi
done

hr
echo "==> 2) Classification"
echo "   $(c_green "KEEP")    PIDs: ${KEEP_PIDS[*]:-<none>}"
echo "   $(c_red   "REMOVE")  PIDs: ${REMOVE_PIDS[*]:-<none>}"
echo "   $(c_yellow "REVIEW") PIDs: ${REVIEW_PIDS[*]:-<none>}"
if [[ ${#REVIEW_PIDS[@]} -gt 0 ]]; then
  echo "   $(c_yellow "WARNING:") REVIEW PIDs could not be classified — they will NOT be touched."
  echo "   $(c_dim "Inspect them by hand: ps -fp ${REVIEW_PIDS[*]}")"
fi

###############################################################################
# 3) Systemd unit inventory (system + user)
###############################################################################
hr
echo "==> 3) Systemd units whose ExecStart references ${REMOTE_HOST} or :${BAD_PORT}"

declare -A UNIT_CLASS=()   # unit -> KEEP | REMOVE | REVIEW
declare -A UNIT_SCOPE=()   # unit -> system | user
declare -A UNIT_EXEC=()    # unit -> ExecStart line

scan_units() {
  local scope="$1"; shift
  local listcmd=( "$@" )
  local units
  units="$("${listcmd[@]}" --type=service --all --no-legend --plain 2>/dev/null \
    | awk '{print $1}' | grep -v '^$' || true)"
  [[ -z "$units" ]] && return 0
  while read -r unit; do
    [[ -z "$unit" ]] && continue
    local exec_line
    if [[ "$scope" == "system" ]]; then
      exec_line="$(systemctl cat "$unit" 2>/dev/null | grep -E '^ExecStart=' | head -1 || true)"
    else
      exec_line="$(systemctl --user cat "$unit" 2>/dev/null | grep -E '^ExecStart=' | head -1 || true)"
    fi
    [[ -z "$exec_line" ]] && continue
    if   [[ "$exec_line" == *"${BAD_USER}@${REMOTE_HOST}"* ]]  || [[ "$exec_line" == *":${BAD_PORT}:"* ]] || [[ "$exec_line" == *" ${BAD_PORT}:"* ]]; then
      UNIT_CLASS["$unit"]="REMOVE"
    elif [[ "$exec_line" == *"${GOOD_USER}@${REMOTE_HOST}"* ]] || [[ "$exec_line" == *":${GOOD_PORT}:"* ]] || [[ "$exec_line" == *" ${GOOD_PORT}:"* ]]; then
      UNIT_CLASS["$unit"]="KEEP"
    elif [[ "$exec_line" == *"$REMOTE_HOST"* ]]; then
      UNIT_CLASS["$unit"]="REVIEW"
    else
      continue
    fi
    UNIT_SCOPE["$unit"]="$scope"
    UNIT_EXEC["$unit"]="$exec_line"
  done <<<"$units"
}

scan_units system systemctl list-units
# --user units: only meaningful if the workstation operator has a user manager
if loginctl show-user "$(id -un)" >/dev/null 2>&1; then
  scan_units user systemctl --user list-units || true
fi

if [[ ${#UNIT_CLASS[@]} -eq 0 ]]; then
  echo "   $(c_dim "(no systemd units reference ${REMOTE_HOST} — the supervisor is probably an autossh / shell loop)")"
else
  for unit in "${!UNIT_CLASS[@]}"; do
    cls="${UNIT_CLASS[$unit]}"
    scope="${UNIT_SCOPE[$unit]}"
    exec="${UNIT_EXEC[$unit]}"
    case "$cls" in
      KEEP)   tag="$(c_green   "KEEP")  " ;;
      REMOVE) tag="$(c_red     "REMOVE")" ;;
      *)      tag="$(c_yellow  "REVIEW")" ;;
    esac
    printf '   %s [%s] %s\n' "$tag" "$scope" "$unit"
    printf '          %s\n' "$(c_dim "$exec")"
  done
fi

###############################################################################
# 4) Apply (or just print)
###############################################################################
hr
if [[ "$MODE" == "dry-run" ]]; then
  echo "$(c_yellow "Dry-run.") Re-run with --apply to actually stop the items above."
  echo
  echo "Plan if you re-run with --apply:"
  for unit in "${!UNIT_CLASS[@]}"; do
    [[ "${UNIT_CLASS[$unit]}" == "REMOVE" ]] || continue
    if [[ "${UNIT_SCOPE[$unit]}" == "system" ]]; then
      echo "   sudo systemctl stop $unit && sudo systemctl disable $unit"
    else
      echo "   systemctl --user stop $unit && systemctl --user disable $unit"
    fi
  done
  for pid in "${REMOVE_PIDS[@]}"; do
    echo "   sudo kill -TERM $pid"
  done
  if [[ ${#UNIT_CLASS[@]} -eq 0 && ${#REMOVE_PIDS[@]} -eq 0 ]]; then
    echo "   $(c_green "Nothing to do.") No REMOVE items found."
  fi
  exit 0
fi

# --apply mode
ANY_ACTION=0

for unit in "${!UNIT_CLASS[@]}"; do
  [[ "${UNIT_CLASS[$unit]}" == "REMOVE" ]] || continue
  scope="${UNIT_SCOPE[$unit]}"
  echo "$(c_red "stop+disable") [$scope] $unit"
  if [[ "$scope" == "system" ]]; then
    systemctl stop "$unit"     2>/dev/null || true
    systemctl disable "$unit"  2>/dev/null || true
  else
    systemctl --user stop "$unit"    2>/dev/null || true
    systemctl --user disable "$unit" 2>/dev/null || true
  fi
  ANY_ACTION=1
done

# After units are disabled, anything that was respawning will now stay dead.
# Kill remaining REMOVE PIDs in case it was a bare autossh / shell loop.
sleep 1
for pid in "${REMOVE_PIDS[@]}"; do
  if kill -0 "$pid" 2>/dev/null; then
    echo "$(c_red "kill -TERM") $pid"
    kill -TERM "$pid" 2>/dev/null || true
    ANY_ACTION=1
  fi
done

# Sweep again in case autossh forked a new child while we were stopping units
sleep 2
mapfile -t LEFTOVER < <(ps -eo pid=,user=,comm=,args= \
  | awk -v rh="$REMOTE_HOST" -v bu="$BAD_USER" -v bp="$BAD_PORT" -v self="$SELF_PID" -v parent="$PARENT_PID" '
      {
        pid = $1
        if (pid == self || pid == parent) next
        comm = $3
        if (comm != "ssh" && comm != "autossh" && comm != "sshpass") next
        if (index($0, rh) == 0) next
        if (!index($0, bu"@"rh) && $0 !~ "[: ]"bp"[: ]") next
        line = $1 " " $2
        for (i = 4; i <= NF; i++) line = line " " $i
        print line
      }')
if [[ ${#LEFTOVER[@]} -gt 0 ]]; then
  echo
  echo "$(c_yellow "Leftover REMOVE processes after first pass:")"
  printf '   %s\n' "${LEFTOVER[@]}"
  for line in "${LEFTOVER[@]}"; do
    pid="$(awk '{print $1}' <<<"$line")"
    kill -TERM "$pid" 2>/dev/null || true
  done
fi

if [[ "$ANY_ACTION" -eq 0 ]]; then
  echo "$(c_green "Nothing to do.") No REMOVE items were active."
fi

hr
echo "==> Final state on this workstation"
FINAL=$(ps -eo pid=,user=,comm=,args= \
  | awk -v rh="$REMOTE_HOST" -v self="$SELF_PID" -v parent="$PARENT_PID" '
      {
        pid = $1
        if (pid == self || pid == parent) next
        comm = $3
        if (comm != "ssh" && comm != "autossh" && comm != "sshpass") next
        if (index($0, rh) == 0) next
        line = $1 "  " $2 "  "
        for (i = 4; i <= NF; i++) line = line $i " "
        print line
      }')
if [[ -n "$FINAL" ]]; then
  printf '%s\n' "$FINAL"
else
  echo "   $(c_dim "(no ssh tunnels to ${REMOTE_HOST} from this host — make sure the GOOD :${GOOD_PORT} supervisor is still running!)")"
fi

echo
echo "Now verify on VM901:"
echo "   ss -tlnp | grep -E ':${GOOD_PORT}|:${BAD_PORT}'    # expect ONLY :${GOOD_PORT}"
echo "   curl -sS --max-time 3 https://api.estio.org/status | jq .gpu.online   # expect: true"
echo "   sudo journalctl -u ssh --since '1 min ago' | grep -c ${BAD_USER}      # expect: 0"
