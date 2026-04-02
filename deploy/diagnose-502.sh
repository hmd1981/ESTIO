#!/usr/bin/env bash
# Run on the origin VM (as root). Explains typical 502 causes.
set -euo pipefail
echo "=== Listeners (expect :3000 web, :3001 admin, :4000 api) ==="
ss -tlnp 2>/dev/null | grep -E ':3000|:3001|:4000' || echo "(none — Docker/upstreams probably down)"

echo ""
echo "=== Docker (estio / estio-platform projects) ==="
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null | head -25 || true

echo ""
echo "=== Local upstream smoke (no Host header issues) ==="
for p in 3000 3001 4000; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --connect-timeout 2 "http://127.0.0.1:${p}/" || echo "FAIL")
  echo "  :${p} -> HTTP ${code}"
done

echo ""
echo "=== HTTPS vhosts (mimic Cloudflare → port 443 on this box) ==="
for host in estio.org admin.estio.org api.estio.org; do
  code=$(curl -sk -o /dev/null -w '%{http_code}' --connect-timeout 3 "https://127.0.0.1/" -H "Host: ${host}" || echo "FAIL")
  echo "  https://127.0.0.1/  Host:${host} -> HTTP ${code}"
done

echo ""
echo "=== Last nginx upstream errors (if any) ==="
if [ -r /var/log/nginx/error.log ]; then
grep -E "connect\\(\\) failed|upstream prematurely|Connection refused" /var/log/nginx/error.log 2>/dev/null | tail -8 || echo "  (no matching lines)"
else
  echo "  cannot read /var/log/nginx/error.log"
fi

echo ""
echo "Hints:"
echo "  502 = nginx could not get a valid response from upstream — usually nothing on 3000/3001/4000."
echo "  If curl :3001 works but https://admin fails: check nginx *443* block — admin must proxy_pass :3001 (not old :3002)."
echo "  Fix: sudo bash deploy/nginx/apply-config.sh   (from repo root, after git pull)"
echo "  Start stack from repo root:  docker compose -f docker-compose.prod.yml up -d --build"
echo "  Use ASCII POSTGRES_PASSWORD or URL-encode it inside DATABASE_URL (unicode breaks many URL parsers)."
