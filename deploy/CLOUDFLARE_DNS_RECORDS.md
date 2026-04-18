# Cloudflare DNS records — canonical production (82.22.50.142)

Apply these in the **Cloudflare dashboard** for `estio.org`, **or** run (requires API token):

```bash
export CLOUDFLARE_API_TOKEN='...'
export ESTIO_ORIGIN_IP='82.22.50.142'
bash deploy/cloudflare-dns-fix.sh
```

`deploy/nginx/estio.conf` on the origin now includes **`server_name media.estio.org`** → API `:4000` so `media` can share the same host as production.

## Two valid patterns (pick one)

### A) Cloudflare Tunnel only (connector on the production server)

- In **DNS**, public hostnames are usually **CNAME** to your tunnel (e.g. `*.cfargotunnel.com`) **or** managed automatically when you use **Zero Trust → Tunnels → Public hostnames**.
- **Published application routes** must send:
  - `estio.org` / `www` → `http://127.0.0.1:3000`
  - `api.estio.org` → `http://127.0.0.1:4000`
  - `admin.estio.org` → `http://127.0.0.1:3001`
- Run **`cloudflared` only** on **82.22.50.142** (same host as Docker). Remove extra tunnel connectors on workstations.

### B) Direct to origin (no tunnel) — nginx on 82.22.50.142

Use when traffic terminates on **nginx :443** on the server (`deploy/nginx/estio.conf`).

| Name | Type | Content | Proxy |
|------|------|---------|--------|
| `estio.org` | **A** | **82.22.50.142** | Proxied (orange) recommended |
| `www` | **CNAME** | `estio.org` | Proxied |
| `api` | **A** | **82.22.50.142** | Proxied |
| `admin` | **A** | **82.22.50.142** | Proxied |

SSL mode: **Full (strict)** with origin cert in `/etc/ssl/cloudflare/` (see `SERVER_RUNBOOK.txt`).

---

## Fix bad / confusing records

### `media` → `192.168.100.223` (DNS only)

- **Problem:** RFC1918 addresses are **not reachable from the public internet**. Browsers outside your LAN will not load `media.estio.org` as a real asset host.
- **Fix (choose one):**
  1. **Delete** the public `media` record if unused; serve media via **`https://api.estio.org/uploads/...`** (Estio default), or  
  2. Point `media` to the **same public origin** as the API (e.g. **A** `82.22.50.142` **Proxied**), and configure nginx/server_name for `media.estio.org` if you need that hostname, or  
  3. Keep **DNS only** + private IP **only** for **internal** testing — do not rely on it for public production.

### Duplicate or split-brain origins

- Do **not** point `estio.org` at **both** a tunnel **and** a different A record to another IP. **One** canonical origin (82.22.50.142).

### After changes

- **Caching → Purge Everything** (or purge by URL) once origin is correct.
- Run **`bash deploy/verify-canonical-origin.sh`** on **82.22.50.142**.

See also: `deploy/cloudflared/README.md`, `deploy/cloudflared/config.example.yml`.
