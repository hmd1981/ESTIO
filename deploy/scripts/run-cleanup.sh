#!/usr/bin/env bash
# Run daily cleanup inside the production API container.
# Usage:
#   bash deploy/scripts/run-cleanup.sh           # live run
#   bash deploy/scripts/run-cleanup.sh --dry-run # report only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DRY_RUN="${1:-}"

cd "$ROOT"

if ! docker compose -f "$COMPOSE_FILE" ps api --status running -q 2>/dev/null | grep -q .; then
  echo "estio cleanup: api container is not running" >&2
  exit 1
fi

if [[ "$DRY_RUN" == "--dry-run" ]]; then
  exec docker compose -f "$COMPOSE_FILE" exec -T api \
    node dist/src/cleanup-cli.js --dry-run
fi

exec docker compose -f "$COMPOSE_FILE" exec -T api \
  node dist/src/cleanup-cli.js
