# Workstation tunnel cleanup (workstation-side hygiene only)

> **Status (server side, already done):** VM901 sshd now enforces
> `PermitListen 9000` (see `/etc/ssh/sshd_config.d/99-estio-permit-listen.conf` and
> `deploy/sshd/99-estio-permit-listen.conf` in this repo). Any `ssh -R` from the workstation that
> tries to bind anything other than `:9000` is **rejected by sshd**, so the broken `:19000`
> listener cannot come back even if the workstation supervisor keeps trying. Verified live: only
> `0.0.0.0:9000` LISTENs on VM901, `/status` reports `gpu.online: true`, and the api container
> reaches `host.docker.internal:9000/health` successfully.
>
> The remaining workstation steps below are **optional cleanup** to stop the autossh / supervisor
> from reconnecting every 1–3 s with a request that sshd will refuse anyway. The site is fully
> operational without them — this only removes log-spam on VM901's `journalctl -u ssh` and a few
> dozen wasted TCP handshakes per minute on the workstation's outbound link.

## What VM901 is observing (evidence from the server)

```
# ss -tnp | awk '/37.41.57.139/'
ESTAB ... 82.22.50.142:22 -> 37.41.57.139:48262   sshd: root           ← KEEP (holds :9000)
ESTAB ... 82.22.50.142:22 -> 37.41.57.139:42796   sshd: estio-platform ← REMOVE (the leaky one)
ESTAB ... 82.22.50.142:22 -> 37.41.57.139:<new>   sshd: estio-platform ← reconnects every 1–3s
```

Two SSH sessions originate from the workstation:

- **The keeper** logs into VM901 as `root@82.22.50.142` and successfully forwards `-R 0.0.0.0:9000:127.0.0.1:<worker-port>`. We must not touch this one.
- **The leaky one** logs into VM901 as `estio-platform@82.22.50.142` and tries to forward `-R 0.0.0.0:19000:127.0.0.1:<X>`. sshd now rejects the bind. Because the supervisor probably runs with `ExitOnForwardFailure yes`, the SSH session terminates immediately, and the supervisor (autossh or `systemd Restart=always`) reconnects within 1–3 seconds. This is the loop we want to stop.

The cleanest discriminator on the workstation is therefore the **SSH login user**:
`estio-platform@82.22.50.142` ⇒ remove. `root@82.22.50.142` ⇒ keep.

## One-shot cleanup script

There is a self-contained script in the repo: [`deploy/scripts/cleanup-workstation-tunnel.sh`](./scripts/cleanup-workstation-tunnel.sh).

From a machine that has the repo checked out (or a copy of VM901):

```bash
# 1) Copy the script to the workstation. Adjust user/host to match how you SSH in.
scp deploy/scripts/cleanup-workstation-tunnel.sh <workstation-user>@<workstation-host>:/tmp/

# 2) On the workstation, run a DRY-RUN first to see what it would change:
ssh <workstation-user>@<workstation-host>
chmod +x /tmp/cleanup-workstation-tunnel.sh
sudo /tmp/cleanup-workstation-tunnel.sh --dry-run

# 3) Review the output. If the "would stop" list looks correct, apply:
sudo /tmp/cleanup-workstation-tunnel.sh --apply
```

The script:

1. Lists every `ssh` / `autossh` / `sshpass` / wrapper process targeting `82.22.50.142`.
2. Lists every systemd unit (system-wide and `--user`) whose `ExecStart` references `82.22.50.142`
   or contains `19000`.
3. Classifies each finding as **KEEP** (logs in as `root@`, references `:9000`) or **REMOVE**
   (logs in as `estio-platform@`, or references `:19000`). Anything that cannot be classified
   confidently is shown as **REVIEW** and never touched in `--apply`.
4. With `--apply`: stops + disables the **REMOVE** units, kills any remaining **REMOVE** processes,
   and prints a final inventory showing only the **KEEP** entries left.

The script is idempotent (rerunning it after a successful cleanup is a no-op) and never writes to
disk outside of `systemctl disable`.

## If you'd rather do it by hand

Run all of the following on the **workstation** (the host that initiates `ssh -R …` to
`82.22.50.142`). No changes are required on VM900 / VM901 / VM902 to complete this fix.

```bash
set -euo pipefail

REMOTE_HOST="82.22.50.142"   # control plane (VM901) public IP
GOOD_USER="root"             # KEEP — login user that owns the healthy :9000 forward
BAD_USER="estio-platform"    # REMOVE — login user that owns the leaky :19000 forward
GOOD_PORT=9000               # KEEP
BAD_PORT=19000               # REMOVE

echo "==> 1) Inventory every reverse-tunnel / autossh process targeting ${REMOTE_HOST}"
ps -eo pid,user,args | grep -E '[s]sh|[a]utossh' | grep -F "${REMOTE_HOST}" || echo "   (none found)"

echo
echo "==> 2) Identify the BAD process (logs in as ${BAD_USER}@ or carries :${BAD_PORT})"
ps -eo pid,user,args | grep -E '[s]sh|[a]utossh' \
  | grep -E "(${BAD_USER}@${REMOTE_HOST}|[: ]${BAD_PORT}[: ])" \
  | grep -v grep || echo "   (no BAD process currently running — supervisor may be between retries)"

echo
echo "==> 3) Identify the GOOD process (logs in as ${GOOD_USER}@ and carries :${GOOD_PORT}) — DO NOT TOUCH"
ps -eo pid,user,args | grep -E '[s]sh|[a]utossh' \
  | grep -E "${GOOD_USER}@${REMOTE_HOST}|[: ]${GOOD_PORT}[: ]" \
  | grep -v grep || echo "   (no GOOD process currently visible — make sure :9000 is still working before continuing)"

echo
echo "==> 4) Find the systemd unit(s) that supervise the BAD forward, if any"
sudo systemctl list-units --type=service --all 2>/dev/null \
  | grep -iE 'estio|tunnel|autossh|reverse' || true
systemctl --user list-units --type=service --all 2>/dev/null \
  | grep -iE 'estio|tunnel|autossh|reverse' || true

echo
echo "==> 5) Stop and disable ONLY the bad unit(s). Replace <unit> with the matching name from step 4."
echo "   sudo systemctl stop <unit>"
echo "   sudo systemctl disable <unit>"
echo "   # (optionally) sudo rm /etc/systemd/system/<unit>.service && sudo systemctl daemon-reload"

echo
echo "==> 6) Kill any remaining BAD ssh/autossh PIDs (they will not be restarted now that the unit is gone)"
echo "   sudo kill -TERM <PID>   # the PID(s) from step 2"

echo
echo "==> 7) Verify on the workstation: only the GOOD ssh remains"
ps -eo pid,user,args | grep -E '[s]sh|[a]utossh' | grep -F "${REMOTE_HOST}" | grep -v grep
```

Then verify from VM901 — these commands run on the **control plane**, not on the workstation:

```bash
ss -tlnp | grep ':19000'  || echo "OK: 19000 no longer LISTEN on VM901"
ss -tlnp | grep ':9000'    # expected: still LISTEN via sshd
curl -sS --max-time 3 http://127.0.0.1:9000/health         # expected: 200 {"status":"ok"}
curl -sS --max-time 3 https://api.estio.org/status | jq .gpu.online
# expected: true within ~10s (the API caches the worker probe with STATUS_PROBE_TTL_MS).
sudo journalctl -u ssh -n 50 --no-pager | grep -c estio-platform
# expected: 0 new lines after a minute (the leaky reconnect loop is gone).
```

And from a browser:

> Open `https://estio.org` → Studio. The "GPU services are temporarily offline" banner must be
> **absent** and the Generate / Buy credits buttons must be enabled.

## Notes for whoever runs this

- We deliberately keep the `:9000` supervisor running. It is the canonical worker tunnel and is
  verified healthy end-to-end (`curl http://host.docker.internal:9000/health` from inside the
  `api` container returns `{"status":"ok"}`).
- If a future operator needs a second forward (say, a `:9001` for a staging worker), update
  `deploy/sshd/99-estio-permit-listen.conf` on VM901 (`PermitListen 9000 9001`), reload sshd, and
  only then teach the workstation supervisor to add the new `-R`. The current refusal of every
  port except `:9000` is intentional defence-in-depth.
- If step 4 cannot find an `ssh -R 0.0.0.0:19000:...` process even though VM901 still shows
  reconnect attempts in `journalctl`, the supervisor has restarted under a different command line
  (e.g. autossh rotated the child PID). Re-run the discovery in step 1 and look for any process
  whose login user is `estio-platform@82.22.50.142` — that is the one to stop.
