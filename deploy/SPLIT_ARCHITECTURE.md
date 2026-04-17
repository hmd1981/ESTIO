# Estio split infrastructure (VM 900 / 901 / 902)

Production layout:

| VM   | Role        | Runs |
|------|-------------|------|
| **900** | GPU worker  | FastAPI media worker → ComfyUI (worker only; no Estio stack) |
| **901** | Application | Docker: **Redis**, **api**, **web**, **admin** (`docker-compose.prod.split.yml`) |
| **902** | Database    | Docker: **PostgreSQL** only (`docker-compose.prod.postgres.yml`) |

Studio unified media (`POST /media/jobs`, `text_to_image` / `image_to_video` / `text_to_video`) is unchanged at the API level: the Nest app on **901** calls **`MEDIA_WORKER_URL`** on **900**.

Single-node “all-in-one” compose remains available as **`docker-compose.prod.yml`** (Postgres + Redis + apps on one host) for labs and legacy installs.

---

## Environment mapping (VM 901)

| Variable | Target | Notes |
|----------|--------|--------|
| **`DATABASE_URL`** | VM **902** | `postgresql://estio:…@<vm902-private-ip>:5432/estio?schema=public`. Not `postgres` hostname unless you use a user-defined Docker network that reaches 902. |
| **`REDIS_URL`** | VM **901** | Default **`redis://redis:6379`** — Redis container in `docker-compose.prod.split.yml`. BullMQ / AI jobs / media async jobs. |
| **`MEDIA_WORKER_URL`** | VM **900** | e.g. **`http://<vm900-private-ip>:9000`** (no trailing slash). Must be reachable from the **api** container (routing/firewall). |
| **`NEXT_PUBLIC_API_URL`** | Public edge | URL browsers use to call the API (via nginx / Cloudflare). |

Optional: if the worker is still exposed only via an SSH reverse tunnel that listens on **VM 901’s host** `:9000`, set **`MEDIA_WORKER_URL=http://host.docker.internal:9000`** (compose includes `extra_hosts: host.docker.internal:host-gateway`). Prefer direct **900** when the network allows.

---

## Deploy order

1. **VM 902** — start Postgres, create DB user/db if needed, restrict `5432` to VM 901’s IP.
2. **VM 901** — set **`DATABASE_URL`**, run Prisma migrations against 902 (`npm run db:migrate --workspace=api` or CI) with the same URL.
3. **VM 900** — run the worker; bind HTTP **9000** (or your chosen port) so **901** can connect.
4. **VM 901** — `docker compose -f docker-compose.prod.split.yml up -d --build`.

---

## Network / firewall checklist

- **902:** allow **TCP 5432** (or your port) **only** from **901** (and admin bastion if needed).
- **901:** allow **outbound** to **902:5432** and **900:9000** (or your worker port).
- **900:** allow **TCP 9000** (worker HTTP) **only** from **901** (or from tunnel source if you keep tunneling).
- **900:** ComfyUI stays on **`127.0.0.1`** on the workstation; only the worker speaks to it.

---

## Verification

**On VM 901 (host):**

```bash
# Postgres (replace host)
pg_isready -h <VM902_IP> -p 5432 -U estio

# Worker
curl -sS --max-time 5 "http://<VM900_IP>:9000/health"
```

**From API container (env only — image has no curl):**

```bash
docker compose -f docker-compose.prod.split.yml exec api printenv DATABASE_URL REDIS_URL MEDIA_WORKER_URL
```

**Worker HTTP from inside the API container (Node one-liner):**

```bash
docker compose -f docker-compose.prod.split.yml exec api node -e "
const b=(process.env.MEDIA_WORKER_URL||'').replace(/\\/+$/, '');
fetch(b+'/health').then(async r=>console.log(r.status, await r.text())).catch(e=>console.error(e));"
```

**Through nginx (public):**

- `GET /media/worker-health` (if exposed) or health via your API routes.
- Studio: submit `POST /media/jobs` with `mode: text_to_image`, poll `GET /media/jobs/:id`, fetch result when `resultReady`.

---

## Files reference

| File | Use |
|------|-----|
| `docker-compose.prod.split.yml` | VM **901** — app + Redis |
| `docker-compose.prod.postgres.yml` | VM **902** — Postgres |
| `docker-compose.prod.yml` | Single-node (Postgres + Redis + apps) |
| `deploy/env.split.example` | Template `.env` for split **901** |
| `deploy/nginx/estio.conf` | Reverse proxy to localhost **3000 / 3001 / 4000** on **901** |

---

## Final split-architecture checklist

- [ ] **902:** Postgres running, data volume backed up, **5432** not public.
- [ ] **902:** `DATABASE_URL` user/password match **`docker-compose.prod.postgres.yml`** (or managed equivalent).
- [ ] **901:** `.env` has **`DATABASE_URL`** → 902, **`REDIS_URL`** → local Redis service, **`MEDIA_WORKER_URL`** → 900 (or tunnel via `host.docker.internal`).
- [ ] **901:** Migrations applied to 902 with production **`DATABASE_URL`**.
- [ ] **900:** Worker `/health` OK; async paths (`/jobs/...`) match **`MEDIA_WORKER_*`** env on **901**.
- [ ] **901:** `docker compose -f docker-compose.prod.split.yml up -d` healthy; **`NEXT_PUBLIC_API_URL`** matches public API URL.
- [ ] Studio smoke: **`POST /media/jobs`** → poll → **`GET …/result`** with **`playback`** or raw **`result`** as expected.
