# Cloudflare Tunnel on the canonical origin (estioapp)

Public hostnames must terminate on **the same machine** that runs Docker **web / admin / api** (and ideally Postgres). Do **not** run the tunnel on a workstation if that workstation is optional.

## Checklist

1. Install `cloudflared` on **estioapp** (the production host).
2. Create or move the tunnel so the **connector runs only on estioapp** (remove connectors from dev workstations).
3. Set **Published application routes** (or `config.yml` ingress) to:
   - `estio.org` → `http://127.0.0.1:3000`
   - `www.estio.org` → `http://127.0.0.1:3000`
   - `api.estio.org` → `http://127.0.0.1:4000`
   - `admin.estio.org` → `http://127.0.0.1:3001`
4. Ensure Docker Compose is up: `docker compose -f docker-compose.prod.yml up -d` (or split stack on VM901).
5. Run `bash deploy/verify-canonical-origin.sh` on the host.

DNS for proxied records should point at Cloudflare; the tunnel brings traffic to localhost on **estioapp**.

**DNS record templates and fixing `media` / private IPs:** `deploy/CLOUDFLARE_DNS_RECORDS.md`

## Optional: direct TLS without tunnel

If you use **nginx** on `:443` with a public IP (see `deploy/nginx/estio.conf`), you can serve without a tunnel; still keep **one** canonical origin.
