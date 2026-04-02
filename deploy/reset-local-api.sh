#!/usr/bin/env bash
set -euo pipefail
# Wipe local Postgres volume, bring DB back, apply all Prisma migrations, regenerate client, build API.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Stopping compose services and removing named volumes (fresh Postgres + Redis)"
docker compose down -v

echo "==> Starting Postgres and Redis"
docker compose up -d postgres redis

echo "==> Waiting for Postgres"
for i in {1..30}; do
  if docker compose exec -T postgres pg_isready -U estio -d estio >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

export DATABASE_URL="${DATABASE_URL:-postgresql://estio:estio@localhost:5433/estio?schema=public}"

echo "==> Prisma migrate deploy + generate + Nest build"
cd "$ROOT/apps/api"
npm run db:migrate
npm run rebuild

echo "==> Done. Start API with: npm run dev:api (from repo root) or PORT=3001 npm run start:prod --workspace=api"
