#!/usr/bin/env bash
# Start Estio in Docker from repo root on the server.
#
# Default: single-node stack (Postgres + Redis + apps) — docker-compose.prod.yml
#
# Split VM 901 (DB on VM 902): set in .env:
#   ESTIO_DEPLOY_MODE=split
# so this script uses docker-compose.prod.split.yml instead. Running the single-node
# file on VM 901 starts a *local* empty Postgres and points the API at it — the site
# looks “wiped” (no pages, no media rows, no job history) even though VM 902 data
# is untouched. See deploy/SPLIT_ARCHITECTURE.md § Troubleshooting.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE_FILE="docker-compose.prod.yml"
if [ -f .env ] && grep -E '^[[:space:]]*ESTIO_DEPLOY_MODE[[:space:]]*=[[:space:]]*split[[:space:]]*' .env >/dev/null 2>&1; then
  COMPOSE_FILE="docker-compose.prod.split.yml"
fi

if [ "$COMPOSE_FILE" = "docker-compose.prod.yml" ]; then
  DEFAULT_PG_PW='changeme_estio_db'
  if [ -z "${POSTGRES_PASSWORD:-}" ]; then
    export POSTGRES_PASSWORD="$DEFAULT_PG_PW"
    echo "WARNING: POSTGRES_PASSWORD unset — using default. Set a strong ASCII-only secret before production." >&2
  fi

  if printf %s "$POSTGRES_PASSWORD" | LC_ALL=C grep -q '[^ -~]'; then
    echo "ERROR: POSTGRES_PASSWORD must be ASCII-only (non-ASCII breaks postgresql:// in DATABASE_URL)." >&2
    exit 1
  fi
else
  echo "Using split app stack: $COMPOSE_FILE (DATABASE_URL from .env → VM 902). Postgres is not started on this host." >&2
fi

docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

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
