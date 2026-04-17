# Media worker reachability — API container ↔ host tunnel

**Topology (unchanged):** Nest API **in Docker** → `MEDIA_WORKER_URL` (typically `http://host.docker.internal:9000`) → **SSH reverse tunnel listener on the Estio host** (`0.0.0.0:9000` or equivalent) → workstation FastAPI → ComfyUI on `127.0.0.1:8188`.

**Related:** [MEDIA_WORKER.md](./MEDIA_WORKER.md) (full worker doc), [MEDIA_JOBS_ASYNC.md](./MEDIA_JOBS_ASYNC.md) (async jobs). **Host `curl 127.0.0.1:9000` OK but Docker API fails:** [MEDIA_WORKER_DOCKER_TUNNEL_REPAIR.md](./MEDIA_WORKER_DOCKER_TUNNEL_REPAIR.md).

---

## 1. Symptoms (this failure mode)

| Symptom | Meaning |
|---------|---------|
| `GET /media/worker-health` → **504** or slow failure | API cannot complete `GET {MEDIA_WORKER_URL}/health` within **`MEDIA_WORKER_HEALTH_TIMEOUT_MS`** (default **10000**). |
| Logs: `media_worker.health.failed` … `failureClass":"timeout"` | Same — health probe timed out. |
| `POST /media/jobs/generate-image` → **202**, then `GET /media/jobs/:id` stuck **`running`** | Bull processor called sync `POST …/generate-image`; Axios is waiting up to **`MEDIA_WORKER_TIMEOUT_MS`** (default **660000** ms). |
| Logs: `media_worker.generate_image.forwarding` then long silence | Request sent; no HTTP response before timeout. |
| `GET /media/jobs/:id/result` → **409** while running | **Expected** until job completes or fails — not a reachability bug by itself. |

**Root causes (Estio side):** tunnel down, tunnel bound only to `127.0.0.1` on host (Docker bridge cannot reach it), wrong port, firewall, **`MEDIA_WORKER_URL` unset/wrong** inside container, or **`extra_hosts`** missing so `host.docker.internal` does not resolve to the host gateway.

---

## 2. Runtime configuration review

| Variable | Role | Compose default / typical `.env` |
|----------|------|-----------------------------------|
| **`MEDIA_WORKER_URL`** | Base URL for worker (no trailing slash). **Inside Docker API:** use **`http://host.docker.internal:9000`**, not `127.0.0.1:9000`. | From `.env`; compose passes `${MEDIA_WORKER_URL:-}` (empty if unset → **503** from Nest). |
| **`MEDIA_WORKER_HEALTH_TIMEOUT_MS`** | Axios timeout for **`GET …/health`**. | **10000** |
| **`MEDIA_WORKER_TIMEOUT_MS`** | Axios timeout for **`POST …/generate-image`** (sync path and async inline completion). | **660000** (~11 min) |
| **`MEDIA_WORKER_MODE`** | `sync` (default) or `async`. Reachability issues affect both once the processor talks to the worker. | **sync** |

**Docker Compose (`docker-compose.prod.yml`):**

- **`api.extra_hosts`:** `host.docker.internal:host-gateway` — **required** so the container resolves `host.docker.internal` to the host running Docker.
- **`api.environment`:** all `MEDIA_WORKER_*` keys are passed from the shell/`.env` via `${VAR:-default}`.

---

## 3. Is 660000 ms “too high” for smoke testing?

- **Production / real Comfy runs:** **660000 ms is appropriate** — generations often run many minutes; shorter defaults cause false **504**s and stuck failed jobs.
- **Smoke testing / feedback loop:** **Yes, it is slow** when the worker is **down**: Prisma jobs stay **`running`** until Axios times out (~11 min), which masks “tunnel broken” behind a long wait.
- **Operational recommendation (no architecture change):**
  1. **Always smoke with `GET /media/worker-health` first** — fails in ~**10 s** if the path is broken.
  2. **From inside the API container**, run the **Node fetch probe** below (8–10 s max) before enqueueing jobs.
  3. **Optional — staging / lab only:** set a **lower** `MEDIA_WORKER_TIMEOUT_MS` (e.g. **60000**) in `.env` **only** on a non-production stack to get faster failure on `generate-image`. **Do not** use a low value in production unless you are sure no real job exceeds it. **Bull `lockDuration`** is derived from this timeout (+60 s); keep worker and API limits coherent (see [MEDIA_JOBS_ASYNC.md](./MEDIA_JOBS_ASYNC.md)).

---

## 4. Exact verification commands

Run from the **Estio server** (repo root = directory containing `docker-compose.prod.yml`). Adjust compose file path if needed.

### 4.1 Host: tunnel listener (no Docker)

Confirms the **host** sees the tunnel/worker (same as `MEDIA_WORKER.md`):

```bash
curl -sS --max-time 5 http://127.0.0.1:9000/health
# or if tunnel is only on a specific interface:
ss -tlnp | grep 9000
```

If this fails, fix **SSH reverse tunnel / autossh / systemd** on the workstation and **GatewayPorts** / bind address on the server before debugging Docker.

### 4.2 API container: `MEDIA_WORKER_*` env

```bash
docker compose -f docker-compose.prod.yml exec api printenv | grep '^MEDIA_WORKER' | sort
```

Expect at least:

- `MEDIA_WORKER_URL=http://host.docker.internal:9000` (or your chosen URL — **no** `192.168.x.x` in Docker unless you have a deliberate routed setup).
- `MEDIA_WORKER_HEALTH_TIMEOUT_MS=10000`
- `MEDIA_WORKER_TIMEOUT_MS=660000` (or your override)
- `MEDIA_WORKER_MODE=sync` or `async`

### 4.3 API container: HTTP probe to worker (no `curl`/`wget` in image)

The API image is slim; use **Node** (available in the container):

```bash
docker compose -f docker-compose.prod.yml exec api node -e "
const u=(process.env.MEDIA_WORKER_URL||'').replace(/\/$/,'')+'/health';
const ac=new AbortController();
setTimeout(()=>ac.abort(),8000);
fetch(u,{signal:ac.signal})
  .then(r=>r.text().then(t=>console.log('OK',r.status,t.slice(0,200))))
  .catch(e=>console.error('FAIL',e.name,e.message,'url='+u));
"
```

- **OK** + status **200** → container → host tunnel path is working.
- **FAIL AbortError** → same as health timeout: tunnel down, wrong port, or `host.docker.internal` / gateway misconfiguration.

### 4.4 API: Nest worker health (through app)

```bash
curl -sS --max-time 15 -D- http://127.0.0.1:4000/media/worker-health -o /tmp/wh.body
head -c 400 /tmp/wh.body; echo
```

Compare with **`MEDIA_WORKER_HEALTH_TIMEOUT_MS`** (default 10 s + overhead).

### 4.5 API logs (media worker)

```bash
docker compose -f docker-compose.prod.yml logs api --tail=200 2>&1 | grep -E 'MediaWorker|media_worker|media_jobs'
```

Look for:

- `media_worker.health.failed` … `timeout` / `ECONNABORTED`
- `media_worker.generate_image.forwarding` without a matching `completed` / `failed` for a long time

### 4.6 Optional: structured debug (short-lived)

Set **`MEDIA_WORKER_DEBUG=true`** in `.env`, restart **api**, call **`GET /media/worker-debug`**, then **revert** to `false` — see [MEDIA_WORKER.md](./MEDIA_WORKER.md). **Unauthenticated** — do not leave enabled in production.

---

## 5. Repair checklist (order matters)

1. **Host:** `curl http://127.0.0.1:9000/health` succeeds.
2. **Tunnel:** listener on **`0.0.0.0:9000`** (or route Docker can use), not only **`127.0.0.1:9000`**, if the API runs in Docker (see [MEDIA_WORKER.md](./MEDIA_WORKER.md) — `GatewayPorts`).
3. **`.env`:** `MEDIA_WORKER_URL=http://host.docker.internal:9000` (no trailing slash).
4. **Compose:** `api.extra_hosts` includes **`host.docker.internal:host-gateway`** (already in `docker-compose.prod.yml`).
5. **Restart API** after `.env` changes:  
   `docker compose -f docker-compose.prod.yml up -d api`
6. **Re-run** §4.3 and §4.4 until both pass.

---

## 6. Estio reachability checklist (final)

| # | Check | Pass |
|---|--------|------|
| 1 | `docker compose … exec api printenv MEDIA_WORKER_URL` = `http://host.docker.internal:9000` (or documented equivalent) | ☐ |
| 2 | Host `curl -sS http://127.0.0.1:9000/health` returns quickly | ☐ |
| 3 | Container Node probe (§4.3) prints **OK 200** | ☐ |
| 4 | `curl http://127.0.0.1:4000/media/worker-health` succeeds within ~15 s | ☐ |
| 5 | `logs api` show no persistent `media_worker.health.failed` / timeout after tunnel restored | ☐ |
| 6 | `MEDIA_WORKER_DEBUG` false/unset in production | ☐ |

---

## 7. Diagnosis summary (quick)

| If | Then |
|----|------|
| Host curl **fails** | Fix tunnel / workstation worker / bind address on **server** — not Docker. |
| Host curl **OK**, container Node probe **fails** | **`extra_hosts`**, wrong **`MEDIA_WORKER_URL`**, or tunnel not bound for Docker bridge (e.g. only `127.0.0.1`). |
| Container probe **OK**, Nest health **fails** | Check **`MEDIA_WORKER_URL`** inside container vs probe URL; check Nest logs for different error (502 vs 504). |
| Health **OK**, `generate-image` **hangs** | Worker accepts health but Comfy/generate path stuck — **workstation** logs, Comfy on `127.0.0.1:8188`, worker timeouts. |
