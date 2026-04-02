#!/usr/bin/env bash
# Run on the Ubuntu/Debian origin VM (e.g. fr-vmv2-medium) as root.
# Easiest from repo root:
#   sudo bash apply-nginx.sh
# Or:
#   sudo bash deploy/nginx/apply-config.sh
# First-time TLS + nginx install:
#   sudo bash deploy/nginx/install-on-server.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR=/etc/ssl/cloudflare
CERT_PEM="$CERT_DIR/estio-origin.pem"
CERT_KEY="$CERT_DIR/estio-origin.key"

if [[ ! -f "$CERT_PEM" || ! -f "$CERT_KEY" ]]; then
  echo "Missing TLS material. Create Cloudflare Origin Certificate, then:"
  echo "  sudo mkdir -p $CERT_DIR"
  echo "  sudo nano $CERT_PEM      # paste certificate (BEGIN CERTIFICATE)"
  echo "  sudo nano $CERT_KEY      # paste private key (BEGIN PRIVATE KEY)"
  echo "  sudo chmod 600 $CERT_KEY"
  exit 1
fi

if ! openssl x509 -in "$CERT_PEM" -noout &>/dev/null; then
  echo "ERROR: $CERT_PEM is not a valid certificate."
  echo "  Use the .pem file for CERTIFICATE only, the .key file for the private key."
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx

install -m 644 "$SCRIPT_DIR/estio.conf" /etc/nginx/sites-available/estio
ln -sf /etc/nginx/sites-available/estio /etc/nginx/sites-enabled/estio
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl restart nginx

echo "nginx is up. Cloudflare SSL/TLS should be Full (strict)."
echo "Ensure these listen on localhost:"
echo "  :3000  public Next (estio.org / www)"
echo "  :3001  admin Next (admin.estio.org)"
echo "  :4000  API (api.estio.org)"
echo "Check: ss -tlnp | grep -E ':3000|:3001|:4000|:443'"
