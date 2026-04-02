#!/usr/bin/env bash
# On the Ubuntu server (root): install site from this repo copy.
#   sudo bash deploy/nginx/apply-config.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF_SRC="$SCRIPT_DIR/estio.conf"
CONF_DST="/etc/nginx/sites-available/estio"

if [ ! -f "$CONF_SRC" ]; then
  echo "Missing $CONF_SRC"; exit 1
fi

install -m 644 "$CONF_SRC" "$CONF_DST"
ln -sf "$CONF_DST" /etc/nginx/sites-enabled/estio
nginx -t
systemctl reload nginx

echo "OK. Admin must proxy to :3001 on BOTH port 80 and 443."
echo "Verify:  curl -kIsS https://127.0.0.1/ -H 'Host: admin.estio.org' | head -1"
