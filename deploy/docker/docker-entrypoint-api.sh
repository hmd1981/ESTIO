#!/bin/sh
set -e
cd /app/apps/api
if [ -n "${DATABASE_URL:-}" ]; then
  ./node_modules/.bin/prisma migrate deploy
fi
exec "$@"
