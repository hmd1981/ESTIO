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
| `deploy/MIGRATION_TO_VM901.md` | Full migration from single-node to **901/902/900** (DB, uploads, cutover) |
| `deploy/nginx/estio.conf` | Reverse proxy to localhost **3000 / 3001 / 4000** on **901** |

---

## Troubleshooting: empty site, missing images/videos, admin looks “reset”

These symptoms usually mean the **API is connected to the wrong Postgres** or **upload URLs no longer match** `PUBLIC_FILE_BASE_URL` — not that an “AI” rewrote the product.

### Root cause A — wrong Compose file on VM 901 (most common)

**`deploy/stack-up.sh`** and many tutorials use **`docker-compose.prod.yml`**, which starts **Postgres on the same host** and sets `DATABASE_URL` to that container. On **split** production, the real data lives on **VM 902**.

If someone runs the **single-node** stack on **901** (or `docker compose -f docker-compose.prod.yml up`):

- The API uses a **new or separate local** `estio` database — **empty** of CMS rows, media metadata, and persisted job history.
- The public site and admin look **blank or default**; previously uploaded files may still exist in the Docker volume `estio_uploads`, but **nothing points to them** until the DB on **902** is used again.
- Rebuilding **web/admin** images can change UI details; combined with an empty DB, it feels like the “admin panel was completely altered.”

**Fix (no architecture change):**

1. Stop the single-node stack if it was started by mistake:  
   `docker compose -f docker-compose.prod.yml down`  
   (omit `-v` unless you intend to remove volumes — see below.)
2. Ensure repo root `.env` has **`ESTIO_DEPLOY_MODE=split`** (see `deploy/env.split.example`) and a correct **`DATABASE_URL`** to **902**.
3. Bring up the app tier only:  
   `docker compose -f docker-compose.prod.split.yml up -d --build`
4. Confirm the API sees 902:  
   `docker compose -f docker-compose.prod.split.yml exec api printenv DATABASE_URL`  
   (host must be your **902** address, not `postgres` unless you have a custom network to 902.)

Optional: run **`bash deploy/diagnose-vm901.sh`** from the repo on **901** for a quick compose/volume summary.

### Root cause B — different Docker project name → new empty volume

Compose prefixes named volumes with the **project name** (`docker compose ls`). If you deploy with a different **`-p` / `COMPOSE_PROJECT_NAME`** / checkout directory name than before, Docker may create **`…_estio_uploads`** again — **empty**. Files from the old volume still exist under the old project name; **reattach** by using the same project name as before or inspect `docker volume ls` and align the stack.

### Root cause C — `PUBLIC_FILE_BASE_URL` / `NEXT_PUBLIC_API_URL` wrong after a change

Rows in the DB store **`/uploads/...`** URLs built from **`PUBLIC_FILE_BASE_URL`**. If that env no longer matches how nginx/API exposes files, images and videos **404** in the browser even though files and DB rows exist. Align `.env` with your public API origin and redeploy **api** (and **web** if needed).

### Restoring data

- **902:** Restore from backup if the database was dropped or overwritten; re-run **`prisma migrate deploy`** against that URL if schema is behind.
- **901 uploads volume:** If files are missing from the volume, restore **`estio_uploads`** from backup; keep the same volume name/project as production.

---

## Final split-architecture checklist

- [ ] **902:** Postgres running, data volume backed up, **5432** not public.
- [ ] **902:** `DATABASE_URL` user/password match **`docker-compose.prod.postgres.yml`** (or managed equivalent).
- [ ] **901:** `.env` has **`ESTIO_DEPLOY_MODE=split`**, **`DATABASE_URL`** → 902, **`REDIS_URL`** → local Redis service, **`MEDIA_WORKER_URL`** → 900 (or tunnel via `host.docker.internal`).
- [ ] **901:** Migrations applied to 902 with production **`DATABASE_URL`**.
- [ ] **900:** Worker `/health` OK; async paths (`/jobs/...`) match **`MEDIA_WORKER_*`** env on **901**.
- [ ] **901:** `docker compose -f docker-compose.prod.split.yml up -d` healthy; **`NEXT_PUBLIC_API_URL`** matches public API URL.
- [ ] Studio smoke: **`POST /media/jobs`** → poll → **`GET …/result`** with **`playback`** or raw **`result`** as expected.
