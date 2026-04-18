#!/usr/bin/env bash
# Run on the canonical production host (estioapp). Read-only checks + quick HTTP probes.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "=== Host ==="
hostname
hostname -I 2>/dev/null | head -1

echo ""
echo "=== cloudflared (optional if using nginx-only public entry) ==="
if pgrep -a cloudflared >/dev/null 2>&1; then
  pgrep -a cloudflared | head -3
else
  echo "(no cloudflared process — OK if public traffic hits nginx :443 on this host)"
fi

echo ""
echo "=== Docker stack (expect single-node or split app tier) ==="
docker compose -f docker-compose.prod.yml ps 2>/dev/null || true

echo ""
echo "=== DATABASE_URL target (api container) ==="
DBU="$(docker exec estio-platform-api-1 printenv DATABASE_URL 2>/dev/null | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')"
echo "$DBU"
if echo "$DBU" | grep -q '@postgres:'; then
  echo "OK: Postgres is the local compose service (canonical single-node)."
elif echo "$DBU" | grep -qE '@[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+|@[a-zA-Z0-9.-]+:'; then
  echo "NOTE: DATABASE_URL points at a host/IP — public uptime depends on that DB staying up (e.g. VM902)."
fi

echo ""
echo "=== MEDIA_WORKER (optional for marketing pages; required for Studio generation) ==="
docker exec estio-platform-api-1 printenv MEDIA_WORKER_URL 2>/dev/null || true

echo ""
echo "=== Origin alignment: API site JSON vs web HTML title (same host) ==="
if command -v jq >/dev/null 2>&1; then
  HLINE="$(curl -sS http://127.0.0.1:4000/public/site/en 2>/dev/null | jq -r '.homePage.sections.hero.headline // empty' 2>/dev/null | head -c 120)"
  echo "api hero headline (from /public/site/en): $HLINE"
else
  echo "(install jq for hero line compare)"
fi
WTITLE="$(curl -sS http://127.0.0.1:3000/en 2>/dev/null | sed -n 's/.*<title>\([^<]*\)<\/title>.*/\1/p' | head -1)"
echo "web <title>: $WTITLE"

echo ""
echo "=== Public loopback probes ==="
curl -sS -o /dev/null -w "127.0.0.1:3000/en → %{http_code}\n" http://127.0.0.1:3000/en
curl -sS -o /dev/null -w "127.0.0.1:4000/ → %{http_code}\n" http://127.0.0.1:4000/

echo ""
echo "Done. If tunnel runs elsewhere, move cloudflared to this host and match deploy/cloudflared/config.example.yml."
