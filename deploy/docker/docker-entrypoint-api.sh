#!/bin/sh
set -e
cd /app/apps/api
if [ -n "${DATABASE_URL:-}" ]; then
  # Prisma may be hoisted to /app/node_modules (npm workspaces) or live under apps/api/node_modules.
  if [ -x /app/node_modules/.bin/prisma ]; then
    /app/node_modules/.bin/prisma migrate deploy
  elif [ -x ./node_modules/.bin/prisma ]; then
    ./node_modules/.bin/prisma migrate deploy
  else
    echo "docker-entrypoint: prisma CLI not found; skipping migrate deploy" >&2
  fi
fi
exec "$@"
