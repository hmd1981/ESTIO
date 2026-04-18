#!/usr/bin/env bash
#
# === RUN ON VM 901 ONLY (application host) ===
#
# Repo may live anywhere, e.g. /opt/estio-platform or /home/estiodb/estio-platform — set ESTIO_ROOT or cd into clone.
#
# Required .env (copy from deploy/env.split.example and edit):
#   ESTIO_DEPLOY_MODE=split
#   DATABASE_URL=postgresql://estio:PASSWORD@<VM902_PRIVATE_IP>:5432/estio?schema=public
#   (PASSWORD must match POSTGRES_PASSWORD used on VM902 for postgres compose)
#
# Optional env:
#   ESTIO_UPLOADS_TGZ          — path to tar.gz of uploads volume contents
#   ESTIO_UPLOADS_TAR_STRIP_COMPONENTS — if tarball has a top-level dir, e.g. 1 (passed to tar --strip-components)
#   ESTIO_PROD_COMPOSE_REL     — default: docker-compose.prod.split.yml
#   ESTIO_PRISMA_CONTAINER_CWD — default: /app/apps/api (matches Dockerfile.api WORKDIR)
#   ESTIO_MIGRATE_DOCKER_BUILD — set to 1 to add --build to compose up
#
set -euo pipefail

# Avoid accidental use of a different compose file from the shell environment.
unset COMPOSE_FILE COMPOSE_PATH 2>/dev/null || true

ESTIO_ROOT="${ESTIO_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ESTIO_ROOT"

PROD_COMPOSE="${ESTIO_PROD_COMPOSE_REL:-docker-compose.prod.split.yml}"
PRISMA_CWD="${ESTIO_PRISMA_CONTAINER_CWD:-/app/apps/api}"

if [ ! -f .env ]; then
  echo "ERROR: Missing $ESTIO_ROOT/.env — copy deploy/env.split.example to .env and set DATABASE_URL, secrets, public URLs." >&2
  exit 1
fi

if ! grep -qE '^[[:space:]]*ESTIO_DEPLOY_MODE[[:space:]]*=[[:space:]]*split' .env; then
  echo "ERROR: Add ESTIO_DEPLOY_MODE=split to .env (split stack; do not use single-node compose on 901)." >&2
  exit 1
fi

if ! grep -qE '^[[:space:]]*DATABASE_URL[[:space:]]*=' .env; then
  echo "ERROR: DATABASE_URL must be set in .env (pointing to VM902)." >&2
  exit 1
fi

echo "==> Using compose file: $PROD_COMPOSE"

echo "==> Testing TCP reachability to Postgres (from 901 host)"
DBURL_LINE="$(grep -E '^[[:space:]]*DATABASE_URL[[:space:]]*=' .env | head -1)"
if echo "$DBURL_LINE" | grep -qE '@[^:]+:[0-9]+'; then
  PGHOST_PORT="$(echo "$DBURL_LINE" | sed -n 's/.*@\([^/]*\)\/.*/\1/p')"
  PGHOST="${PGHOST_PORT%%:*}"
  PGPORT="${PGHOST_PORT##*:}"
  if command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h "$PGHOST" -p "${PGPORT:-5432}" || {
      echo "ERROR: Cannot reach Postgres at $PGHOST:${PGPORT:-5432}. Fix firewall / DATABASE_URL." >&2
      exit 1
    }
  else
    echo "WARN: pg_isready not installed; skipping host check. Install postgresql-client if desired."
  fi
fi

resolve_uploads_volume() {
  local v
  v="$(docker volume ls --format '{{.Name}}' 2>/dev/null | grep -E 'estio_uploads$' | head -1)"
  if [ -n "$v" ]; then
    echo "$v"
    return
  fi
  echo "estio-platform_estio_uploads"
}

if [ -n "${ESTIO_UPLOADS_TGZ:-}" ]; then
  if [ ! -f "$ESTIO_UPLOADS_TGZ" ]; then
    echo "ERROR: ESTIO_UPLOADS_TGZ file not found: $ESTIO_UPLOADS_TGZ" >&2
    exit 1
  fi
  echo "==> Preparing uploads volume and extracting $ESTIO_UPLOADS_TGZ"
  VOL_NAME="$(resolve_uploads_volume)"
  if ! docker volume inspect "$VOL_NAME" >/dev/null 2>&1; then
    docker volume create "$VOL_NAME"
  fi

  VOL_PATH="$(docker volume inspect "$VOL_NAME" --format '{{ .Mountpoint }}')"
  if [ -z "$VOL_PATH" ] || [ ! -d "$VOL_PATH" ]; then
    echo "ERROR: Could not resolve volume $VOL_NAME" >&2
    exit 1
  fi
  echo "    Volume: $VOL_NAME → $VOL_PATH"
  STRIP="${ESTIO_UPLOADS_TAR_STRIP_COMPONENTS:-0}"
  if [ "$STRIP" != "0" ]; then
    sudo tar xzf "$ESTIO_UPLOADS_TGZ" --strip-components="$STRIP" -C "$VOL_PATH"
  else
    sudo tar xzf "$ESTIO_UPLOADS_TGZ" -C "$VOL_PATH"
  fi
  echo "    Upload files count: $(sudo find "$VOL_PATH" -type f 2>/dev/null | wc -l)"
else
  echo "WARN: ESTIO_UPLOADS_TGZ not set — skipping uploads restore (use fresh volume or copy files manually)."
fi

echo "==> Building and starting app stack (split)"
if [ "${ESTIO_MIGRATE_DOCKER_BUILD:-1}" != "0" ]; then
  docker compose -f "$PROD_COMPOSE" up -d --build
else
  docker compose -f "$PROD_COMPOSE" up -d
fi

run_prisma_migrate() {
  # Use sh -c so we do not rely on compose "exec -w" (older compose versions).
  docker compose -f "$PROD_COMPOSE" exec -T api \
    sh -c "cd \"$PRISMA_CWD\" && npx prisma migrate deploy"
}

echo "==> Prisma migrate deploy (api container, cwd=$PRISMA_CWD)"
if run_prisma_migrate; then
  :
elif [ -d "$ESTIO_ROOT/apps/api/node_modules" ] && command -v npx >/dev/null 2>&1; then
  echo "WARN: Prisma migrate in Docker failed — trying host with apps/api (DATABASE_URL from .env)"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  (cd "$ESTIO_ROOT/apps/api" && npx prisma migrate deploy)
else
  echo "ERROR: prisma migrate deploy failed in Docker and no host fallback (install deps or fix container)." >&2
  exit 1
fi

echo "==> Smoke verification"
bash deploy/verify-production.sh || true

echo ""
echo "==> VM901 migration steps completed."
echo "    Optional: ESTIO_DEPLOY_MODE=split bash deploy/stack-up.sh"
echo "    Test: curl -sS http://127.0.0.1:4000/"
echo "    Admin: http://127.0.0.1:3001/  Web: http://127.0.0.1:3000/"
