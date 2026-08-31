#!/usr/bin/env bash
# Scan tracked and candidate source files for accidental secret material.
# Exit 0 = PASS, 1 = BLOCKED
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

BLOCKED=0

scan_paths() {
  local label="$1"
  shift
  local hits
  hits="$(grep -RInE \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=dist \
    --exclude-dir=.git \
    --exclude='*.png' --exclude='*.jpg' --exclude='*.jpeg' --exclude='*.webp' \
    --exclude='package-lock.json' \
    'BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY|sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[a-zA-Z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}' \
    "$@" 2>/dev/null || true)"

  if [[ -n "$hits" ]]; then
    echo "BLOCKED ($label):"
    echo "$hits" | sed 's/=.*/=***REDACTED***/g' | head -20
    BLOCKED=1
  fi
}

# Never allow env backups in repo tree
if git ls-files --others --exclude-standard | grep -E '\.env(\.|$)|\.bak' >/dev/null 2>&1; then
  echo "BLOCKED: untracked .env or .bak files present in working tree"
  git ls-files --others --exclude-standard | grep -E '\.env(\.|$)|\.bak' || true
  BLOCKED=1
fi

if [[ -f .env.bak.before-phase2 ]]; then
  echo "BLOCKED: .env.bak.before-phase2 must not live in repository root"
  BLOCKED=1
fi

# Scan deploy/nginx scripts (historical false positive: PEM header literals in echo)
scan_paths "deploy/nginx" deploy/nginx/

# Scan staged + modified source (exclude markdown echo examples)
scan_paths "apps" apps/

if [[ "$BLOCKED" -ne 0 ]]; then
  echo "SECRET SCAN = BLOCKED"
  exit 1
fi

echo "SECRET SCAN = PASS"
exit 0
