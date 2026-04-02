#!/usr/bin/env bash
# Self-contained: copy THIS FILE to the server (scp) and run:  sudo bash install-estio-nginx-remote.sh
# No git / no repo path required. Requires Cloudflare Origin cert at /etc/ssl/cloudflare/
set -euo pipefail

TARGET=/etc/nginx/sites-available/estio

if [ ! -f /etc/ssl/cloudflare/estio-origin.pem ] || [ ! -f /etc/ssl/cloudflare/estio-origin.key ]; then
  echo "Missing TLS files. Expected:" >&2
  echo "  /etc/ssl/cloudflare/estio-origin.pem" >&2
  echo "  /etc/ssl/cloudflare/estio-origin.key" >&2
  exit 1
fi

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

cat >"$tmp" <<'NGINX_CONF'
# Estio — web :3000, admin :3001, API :4000
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name estio.org www.estio.org;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name admin.estio.org;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name api.estio.org;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name estio.org www.estio.org;
    ssl_certificate     /etc/ssl/cloudflare/estio-origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/estio-origin.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.estio.org;
    ssl_certificate     /etc/ssl/cloudflare/estio-origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/estio-origin.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.estio.org;
    ssl_certificate     /etc/ssl/cloudflare/estio-origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/estio-origin.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX_CONF

install -m 644 "$tmp" "$TARGET"
ln -sf "$TARGET" /etc/nginx/sites-enabled/estio
nginx -t
systemctl reload nginx

echo "Done. Quick checks:"
echo "  ss -tlnp | grep -E ':3000|:3001|:4000'"
echo "  curl -kIsS https://127.0.0.1/ -H 'Host: admin.estio.org' | head -1"
