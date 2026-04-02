#!/usr/bin/env bash
# Apply nginx site config from this repo (run on the server as root).
#   cd /path/to/estio-platform && sudo bash apply-nginx.sh
#
# No full repo on server? Copy only install-estio-nginx-remote.sh and run:
#   sudo bash install-estio-nginx-remote.sh
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NESTED="$REPO_ROOT/deploy/nginx/apply-config.sh"
CONF="$REPO_ROOT/deploy/nginx/estio.conf"

if [ -f "$NESTED" ]; then
  exec bash "$NESTED"
fi

if [ ! -f "$CONF" ]; then
  echo "Missing nginx config: $CONF"
  echo "Clone or pull the full repo so deploy/nginx/estio.conf exists."
  exit 1
fi

install -m 644 "$CONF" /etc/nginx/sites-available/estio
ln -sf /etc/nginx/sites-available/estio /etc/nginx/sites-enabled/estio
nginx -t
systemctl reload nginx
echo "nginx reloaded. Test: curl -kIsS https://127.0.0.1/ -H 'Host: admin.estio.org' | head -1"
