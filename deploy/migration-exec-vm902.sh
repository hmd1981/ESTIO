#!/usr/bin/env bash
#
# === RUN ON VM 902 ONLY (database host) ===
#
# Prerequisites:
#   - Repo cloned at ESTIO_ROOT (default: current directory or /opt/estio-platform)
#   - migration dump file available: ESTIO_PG_DUMP (custom-format .dump from pg_dump -Fc)
#   - export POSTGRES_PASSWORD='...' (must match what VM901 will use in DATABASE_URL)
#
# What this does:
#   1) Starts PostgreSQL via docker-compose.prod.postgres.yml (if not already running)
#   2) Waits until Postgres is healthy
#   3) Restores the dump into database "estio" (drops/recreates objects if --clean works)
#   4) Prints next steps for VM901 (Prisma migrate + app stack)
#
# Usage:
#   cd /path/to/estio-platform    # e.g. /opt/estio-platform or /home/estiodb/estio-platform
#   export POSTGRES_PASSWORD='your-strong-password'
#   export ESTIO_PG_DUMP=/home/estiodb/backups/estio-pre-migration.dump   # any readable path
#   export ESTIO_ROOT="$(pwd)"
#   bash deploy/migration-exec-vm902.sh
#
set -euo pipefail

ESTIO_ROOT="${ESTIO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ESTIO_ROOT"

if [ -z "${POSTGRES_PASSWORD:-}" ]; then
  echo "ERROR: export POSTGRES_PASSWORD before running (ASCII-only; matches DATABASE_URL on VM901)." >&2
  exit 1
fi

if [ -z "${ESTIO_PG_DUMP:-}" ] || [ ! -f "$ESTIO_PG_DUMP" ]; then
  echo "ERROR: set ESTIO_PG_DUMP to the full path of your pg_dump -Fc file (e.g. /home/estiodb/backups/estio-pre-migration.dump)." >&2
  exit 1
fi

if ! printf %s "$POSTGRES_PASSWORD" | LC_ALL=C grep -q '^[ -~]*$'; then
  echo "ERROR: POSTGRES_PASSWORD must be ASCII-only." >&2
  exit 1
fi

COMPOSE_DB="docker-compose.prod.postgres.yml"

echo "==> Starting Postgres stack (902) from $ESTIO_ROOT"
docker compose -f "$COMPOSE_DB" up -d

echo "==> Waiting for Postgres to accept connections..."
for i in $(seq 1 60); do
  if docker compose -f "$COMPOSE_DB" exec -T postgres pg_isready -U estio -d estio >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

if ! docker compose -f "$COMPOSE_DB" exec -T postgres pg_isready -U estio -d estio >/dev/null 2>&1; then
  echo "ERROR: Postgres did not become ready. Check: docker compose -f $COMPOSE_DB logs postgres" >&2
  exit 1
fi

CID="$(docker compose -f "$COMPOSE_DB" ps -q postgres)"
echo "==> Postgres container: $CID"

echo "==> Copying dump into container"
docker cp "$ESTIO_PG_DUMP" "$CID:/tmp/estio-restore.dump"

echo "==> Restoring database (estio)"
# Try with --clean; if DB was empty, fall back without --clean
set +e
docker compose -f "$COMPOSE_DB" exec -T postgres \
  pg_restore -U estio -d estio --clean --if-exists --no-owner --verbose /tmp/estio-restore.dump
RC=$?
set -e

if [ "$RC" -ne 0 ]; then
  echo "WARN: pg_restore with --clean exited $RC — retrying without --clean (typical for empty DB)"
  docker compose -f "$COMPOSE_DB" exec -T postgres \
    pg_restore -U estio -d estio --no-owner --verbose /tmp/estio-restore.dump
fi

docker compose -f "$COMPOSE_DB" exec -T postgres rm -f /tmp/estio-restore.dump

echo ""
echo "==> VM902 restore finished."
echo "Row counts (sanity):"
docker compose -f "$COMPOSE_DB" exec -T postgres psql -U estio -d estio -tAc \
  "SELECT 'MediaAsset', COUNT(*)::text FROM \"MediaAsset\" UNION ALL SELECT 'Page', COUNT(*)::text FROM \"Page\";" || true
docker compose -f "$COMPOSE_DB" exec -T postgres psql -U estio -d estio -tAc \
  "SELECT 'media_generation_jobs', COUNT(*)::text FROM media_generation_jobs;" 2>/dev/null || echo "(media_generation_jobs table missing or empty — OK on older dumps)"

echo ""
echo "NEXT (VM901):"
echo "  1) In .env set DATABASE_URL=postgresql://estio:POSTGRES_PASSWORD@<THIS_VM902_IP>:5432/estio?schema=public"
echo "  2) Copy uploads tarball to VM901 and run: bash deploy/migration-exec-vm901.sh"
echo "  3) Prisma migrate runs on VM901 inside the api container (migration-exec-vm901.sh does this)."
