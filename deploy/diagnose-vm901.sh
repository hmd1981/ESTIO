#!/usr/bin/env bash
# Read-only diagnostics for VM 901 (run from repo root). Does not change Docker state.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Repo root ==="
echo "$ROOT"
echo ""

echo "=== .env deploy mode (split vs single-node stack-up) ==="
if [ -f .env ]; then
  if grep -E '^[[:space:]]*ESTIO_DEPLOY_MODE[[:space:]]*=[[:space:]]*split[[:space:]]*' .env >/dev/null 2>&1; then
    echo "ESTIO_DEPLOY_MODE=split  (stack-up.sh should use docker-compose.prod.split.yml)"
  else
    echo "ESTIO_DEPLOY_MODE not set to split — deploy/stack-up.sh uses docker-compose.prod.yml (local Postgres)."
  fi
else
  echo "No .env in repo root"
fi
echo ""

echo "=== docker compose ls ==="
docker compose ls 2>/dev/null || true
echo ""

echo "=== Volumes (estio*) ==="
docker volume ls --format '{{.Name}}' 2>/dev/null | grep -E 'estio|uploads' || echo "(none matched)"
echo ""

for f in docker-compose.prod.split.yml docker-compose.prod.yml; do
  if [ -f "$f" ]; then
    echo "=== $f ps ==="
    docker compose -f "$f" ps 2>/dev/null || echo "(not running or compose error)"
    echo ""
  fi
done

echo "=== Local postgres container (split: should be empty) ==="
if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qE 'postgres|estio.*postgres'; then
  docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | head -1
  docker ps -a --format '{{.Names}}\t{{.Image}}\t{{.Status}}' | grep -E 'postgres|estio' || true
else
  echo "No obvious postgres container name (OK for split if DB is on VM 902 only)."
fi
echo ""

echo "=== DATABASE_URL host from split stack api (if running) ==="
if docker compose -f docker-compose.prod.split.yml ps -q api 2>/dev/null | grep -q .; then
  docker compose -f docker-compose.prod.split.yml exec -T api node -e "
    const u = process.env.DATABASE_URL || '';
    try {
      const x = new URL(u.replace(/^postgresql:/,'http:'));
      console.log('host=', x.hostname, 'port=', x.port || '(default)');
    } catch { console.log('(could not parse DATABASE_URL)'); }
  " 2>/dev/null || echo "(exec failed)"
else
  echo "split api container not running — start with: docker compose -f docker-compose.prod.split.yml up -d"
fi
echo ""
echo "Done. See deploy/SPLIT_ARCHITECTURE.md § Troubleshooting if the site looks empty."
