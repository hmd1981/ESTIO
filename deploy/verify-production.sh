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
check_http "web"  "http://127.0.0.1:3000/" "2xx"
check_http "admin" "http://127.0.0.1:3001/" "2xx3xx"
check_http "api"   "http://127.0.0.1:4000/" "2xx"

echo ""
echo "=== nginx TLS + server_name (curl to 127.0.0.1 with Host header) ==="
check_https_sni "public" "estio.org"
check_https_sni "admin" "admin.estio.org"
check_https_sni "api"   "api.estio.org"

echo ""
echo "=== Docker compose (if run from repo root) ==="
if [ -f "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/docker-compose.prod.yml" ]; then
  (cd "$(dirname "${BASH_SOURCE[0]}")/.." && docker compose -f docker-compose.prod.yml ps 2>/dev/null) || true
else
  echo "(skipped: docker-compose.prod.yml not found from this script path)"
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
