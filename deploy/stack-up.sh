#!/usr/bin/env bash
# Start web + admin + API + Postgres in Docker. Run from repo root on the server.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DEFAULT_PG_PW='changeme_estio_db'
if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  export POSTGRES_PASSWORD="$DEFAULT_PG_PW"
  echo "WARNING: POSTGRES_PASSWORD unset — using default. Set a strong ASCII-only secret before production." >&2
fi

if printf %s "$POSTGRES_PASSWORD" | LC_ALL=C grep -q '[^ -~]'; then
  echo "ERROR: POSTGRES_PASSWORD must be ASCII-only (non-ASCII breaks postgresql:// in DATABASE_URL)." >&2
  exit 1
fi

docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo ""
echo "Next: bash deploy/verify-production.sh"
echo ""
echo "Manual local checks:"
echo "  curl -sI http://127.0.0.1:3000/ | head -1"
echo "  curl -sI http://127.0.0.1:3001/ | head -1"
echo "  curl -s  http://127.0.0.1:4000/ | head -c 200"
echo ""
echo "Nginx must proxy: estio/www → 3000 · admin → 3001 · api → 4000"
echo "  sudo bash install-estio-nginx-remote.sh   OR   sudo bash apply-nginx.sh"
echo "Full steps: see deploy/SERVER_RUNBOOK.txt"
