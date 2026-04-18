#!/usr/bin/env bash
# Smoke-test Estio Docker ports and nginx HTTPS vhosts (run on the origin VM).
# Usage: bash deploy/verify-production.sh
set -euo pipefail

pass=0
fail=0

check_http() {
  local name="$1" url="$2" want="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 3 "$url" 2>/dev/null) || true
  [[ "$code" =~ ^[0-9]{3}$ ]] || code="000"
  if [[ "$code" == "$want" ]] || [[ "$want" == "2xx" && "$code" =~ ^2[0-9][0-9]$ ]] || [[ "$want" == "2xx3xx" && "$code" =~ ^[23][0-9][0-9]$ ]]; then
    echo "OK  $name → HTTP $code ($url)"
    pass=$((pass + 1))
  else
    echo "FAIL $name → HTTP $code (expected ~$want) ($url)"
    fail=$((fail + 1))
  fi
}

check_https_sni() {
  local name="$1" host="$2"
  local code
  code=$(curl -sk -o /dev/null -w '%{http_code}' --connect-timeout 3 "https://127.0.0.1/" -H "Host: ${host}" 2>/dev/null) || true
  [[ "$code" =~ ^[0-9]{3}$ ]] || code="000"
  if [[ "$code" =~ ^2[0-9][0-9]$ ]] || [[ "$code" == "301" ]] || [[ "$code" == "302" ]] || [[ "$code" == "307" ]] || [[ "$code" == "308" ]]; then
    echo "OK  $name (HTTPS SNI Host:$host) → HTTP $code"
    pass=$((pass + 1))
  else
    echo "FAIL $name (HTTPS SNI Host:$host) → HTTP $code (expected 2xx or redirect)"
    fail=$((fail + 1))
  fi
}

echo "=== Upstreams (Docker host ports) ==="
check_http "web"  "http://127.0.0.1:3000/" "2xx3xx"
check_http "admin" "http://127.0.0.1:3001/" "2xx3xx"
check_http "api"   "http://127.0.0.1:4000/" "2xx"

echo ""
echo "=== nginx TLS + server_name (curl to 127.0.0.1 with Host header) ==="
check_https_sni "public" "estio.org"
check_https_sni "admin" "admin.estio.org"
check_https_sni "api"   "api.estio.org"

echo ""
echo "=== Docker compose (if run from repo root) ==="
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$ROOT/docker-compose.prod.yml" ]; then
  VERIFY_COMPOSE="docker-compose.prod.yml"
  if [ -f "$ROOT/.env" ] && grep -E '^[[:space:]]*ESTIO_DEPLOY_MODE[[:space:]]*=[[:space:]]*split[[:space:]]*' "$ROOT/.env" >/dev/null 2>&1; then
    VERIFY_COMPOSE="docker-compose.prod.split.yml"
  fi
  (cd "$ROOT" && docker compose -f "$VERIFY_COMPOSE" ps 2>/dev/null) || true
else
  echo "(skipped: docker-compose.prod.yml not found from this script path)"
fi

echo ""
echo "=== Postgres volumes (single-node + dev: expect distinct names) ==="
docker volume ls --format '{{.Name}}' 2>/dev/null | grep -E 'estio.*pg|postgres' || true

echo ""
echo "=== DB + uploads sanity (if api + postgres containers exist) ==="
API_C=$(docker ps -q -f name=estio-platform-api 2>/dev/null | head -1)
PG_C=$(docker ps -q -f name=estio-platform-postgres 2>/dev/null | head -1)
if [ -n "$API_C" ] && [ -n "$PG_C" ]; then
  ASK_ON=$(docker exec "$API_C" printenv ASK_ESTIO_AI_ENABLED 2>/dev/null || true)
  KEY_SET=$(docker exec "$API_C" printenv DEEPSEEK_API_KEY 2>/dev/null | wc -c | tr -d ' ')
  if [ "${ASK_ON:-}" = "true" ]; then
    if [ "${KEY_SET:-0}" -gt 8 ]; then
      echo "OK  Ask Estio AI: ASK_ESTIO_AI_ENABLED=true and DEEPSEEK_API_KEY present in api container"
      pass=$((pass + 1))
    else
      echo "FAIL Ask Estio AI enabled but DEEPSEEK_API_KEY missing in api — fix .env and: docker compose -f docker-compose.prod.yml up -d api"
      fail=$((fail + 1))
    fi
  else
    echo "OK  Ask Estio AI skipped (ASK_ESTIO_AI_ENABLED not true)"
    pass=$((pass + 1))
  fi
  SAMPLE=$(docker exec "$PG_C" psql -U estio -d estio -tAc 'SELECT "fileName" FROM "MediaAsset" LIMIT 1;' 2>/dev/null | tr -d '[:space:]')
  if [ -n "$SAMPLE" ]; then
    check_http "api-upload-file" "http://127.0.0.1:4000/uploads/${SAMPLE}" "200"
  else
    echo "WARN  No rows in MediaAsset — skip /uploads/ check"
  fi
else
  echo "(skipped: estio api/postgres containers not found or not running)"
fi

echo ""
if [ "$fail" -eq 0 ]; then
  echo "All $pass checks passed."
  exit 0
else
  echo "$fail check(s) failed, $pass passed."
  echo "If HTTPS fails but upstreams OK: sudo bash install-estio-nginx-remote.sh or apply-nginx.sh; check /var/log/nginx/error.log"
  exit 1
fi
