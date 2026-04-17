# GPU media worker ↔ Estio API (SSH reverse tunnel)

For **async job orchestration** (job id + polling) while keeping this sync path, see **`deploy/MEDIA_JOBS_ASYNC.md`**. Phase A routes: **`POST /media/jobs/generate-image`** (requires **Redis** / `REDIS_URL`), **`GET /media/jobs/:id`**, **`GET /media/jobs/:id/result`**.

**API container cannot reach the worker (health timeout, jobs stuck `running`)?** See **`deploy/MEDIA_WORKER_REACHABILITY_RUNBOOK.md`** — host vs Docker probes, env, logs, and **`MEDIA_WORKER_TIMEOUT_MS`** smoke-test guidance.

**Split VMs (app on 901, DB on 902, worker on 900):** see **`deploy/SPLIT_ARCHITECTURE.md`**. Set **`MEDIA_WORKER_URL`** to the **VM 900** worker base URL (private IP/DNS, e.g. `http://10.0.0.90:9000`). The **`host.docker.internal`** pattern below applies when the tunnel still terminates on the **same host as the API** (single-node or tunnel into VM 901).

Estio (web, admin, NestJS API) runs on the public server (e.g. `82.22.50.142`). The GPU workstation stays private. **Harden ComfyUI to `127.0.0.1:8188` only** on the workstation; only the **FastAPI** worker should talk to it. The Estio server never calls ComfyUI directly — architecture, SSH tunnel, and **`MEDIA_WORKER_URL=http://host.docker.internal:9000`** stay as today.

Worker contract:

- `GET /health`
- `POST /generate-image`

Nest exposes:

- `POST /media/generate-image` → forwards JSON (after `prompt` validation) to `{MEDIA_WORKER_URL}/generate-image`
- `GET /media/worker-health` → `{MEDIA_WORKER_URL}/health`

On **split LAN** deployments, **`MEDIA_WORKER_URL` may use a private IP** (VM 900) because the API container routes to that host over your VPC. Do **not** use arbitrary `192.168.x.x` in Docker **unless** that subnet is actually routed from the API container (same rule as before — prefer documented private IPs / DNS for VM 900).

---

## SSH server (`sshd`) on the Estio host (e.g. `82.22.50.142`)

Two settings are required so a **reverse tunnel** from the GPU workstation can forward a port on this server (e.g. `-R 0.0.0.0:9000:…`).

Edit `/etc/ssh/sshd_config` (or a file under `/etc/ssh/sshd_config.d/*.conf`) and ensure:

```text
AllowTcpForwarding yes
GatewayPorts yes
```

Notes:

- **`AllowTcpForwarding yes`** — allows remote port forwarding (`-R`). If set to `no`, the tunnel will not work.
- **`GatewayPorts yes`** — allows the forwarded socket to bind beyond `127.0.0.1`, e.g. `0.0.0.0:9000`, which is needed for **Docker** (`host.docker.internal` → host) to reach the tunnel. If you prefer stricter policy, **`GatewayPorts clientspecified`** is enough when the client uses `-R 0.0.0.0:port:…`.

Validate config and reload (Debian/Ubuntu service name is often `ssh`):

```bash
sudo sshd -t && sudo systemctl reload ssh
```

On some distributions the unit is `sshd` instead of `ssh`:

```bash
sudo sshd -t && sudo systemctl reload sshd
```

---

## Environment variables (API)

| Variable | Purpose |
|----------|---------|
| `MEDIA_WORKER_URL` | Base URL of the FastAPI worker **as seen from the Nest process** (no trailing slash). |
| `MEDIA_WORKER_TIMEOUT_MS` | Timeout for `POST …/generate-image` (default **660000**). |
| `MEDIA_WORKER_HEALTH_TIMEOUT_MS` | Timeout for `GET …/health` probe (default **10000**). |

Set them in `.env` next to `docker-compose.prod.yml`. Restart the API after changes.

---

## `127.0.0.1:9000` on the server vs Docker

The SSH tunnel is usually described as “the worker is on **localhost:9000** on the Estio server.” That is correct for **checks run on the host**:

```bash
curl -sS http://127.0.0.1:9000/health
```

The Nest API runs **inside a container**. Inside that container, **`127.0.0.1` is the container itself**, not the host — so `MEDIA_WORKER_URL=http://127.0.0.1:9000` **does not** reach the host’s tunnel unless you use host networking for the API (not the default).

**Default Estio setup:** `docker-compose.prod.yml` adds `host.docker.internal → host-gateway` for the `api` service. Set:

```env
MEDIA_WORKER_URL=http://host.docker.internal:9000
```

**Requirement:** the remote forward must accept connections **from the host’s non-loopback addresses** (e.g. bind `0.0.0.0:9000` on the server), not only `127.0.0.1:9000`, otherwise Docker’s bridge to the host may not hit the listener. If the host can `curl 127.0.0.1:9000` but the API container times out on `host.docker.internal:9000`, see **`deploy/MEDIA_WORKER_DOCKER_TUNNEL_REPAIR.md`** (exact `sshd` + `-R` bind steps). Example patterns:

- sshd: `GatewayPorts clientspecified` (or `yes` if policy allows), then from the workstation:
  - `ssh -N -R 0.0.0.0:9000:127.0.0.1:8000 user@82.22.50.142`
- Adjust user, ports (`8000` = worker on the workstation), and keep the session alive (`autossh`, systemd, etc.).

**If the API runs on the host** (e.g. `nest start` without Docker):

```env
MEDIA_WORKER_URL=http://127.0.0.1:9000
```

---

## Upstream error behaviour (Nest)

| Situation | HTTP |
|-----------|------|
| `MEDIA_WORKER_URL` unset / empty | **503** `Service Unavailable` |
| Worker returns 4xx/5xx with body | Same **status** and **body** proxied |
| Request/health **timeout** (Axios) | **504** `Gateway Timeout` |
| **Connection refused**, DNS failure, reset, no HTTP response | **502** `Bad Gateway` |

---

## End-to-end validation (final operator runbook)

Replace `/opt/estio-platform` with your deploy path. Use your real public API base URL instead of `http://127.0.0.1:4000` when testing through nginx/TLS.

### Host checks

```bash
curl -sS --connect-timeout 3 http://127.0.0.1:9000/health
```

### Container checks

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml exec api printenv MEDIA_WORKER_URL
docker compose -f docker-compose.prod.yml exec api printenv MEDIA_WORKER_TIMEOUT_MS
docker compose -f docker-compose.prod.yml exec api printenv MEDIA_WORKER_HEALTH_TIMEOUT_MS
docker compose -f docker-compose.prod.yml exec api printenv MEDIA_WORKER_DEBUG
docker compose -f docker-compose.prod.yml exec api wget -qO- --timeout=5 http://host.docker.internal:9000/health
```

### API checks

```bash
curl -sS http://127.0.0.1:4000/media/worker-health
curl -sS -X POST http://127.0.0.1:4000/media/generate-image -H "Content-Type: application/json" -d '{"prompt":"a red apple on a wooden table"}'
```

### After `.env` changes (restart API only)

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml up -d api
```

### First real production test

```bash
curl -sS -X POST http://127.0.0.1:4000/media/generate-image -H "Content-Type: application/json" -d '{"prompt":"estio production smoke test"}'
```

**PASS:** HTTP 2xx and a JSON body consistent with your worker (e.g. `ok`, `prompt_id`, Comfy history fields). **FAIL:** immediate **502**/**503**, or **504** before a normal worker response — use failure triage below.

### Failure triage

| Symptom | What to verify |
|---------|----------------|
| **Host tunnel down** | Run host check `curl http://127.0.0.1:9000/health`. Restore SSH `-R`, `autossh`/systemd session, and `sshd` (`AllowTcpForwarding yes`, `GatewayPorts` / `clientspecified` + bind `0.0.0.0:9000` if Docker must reach the tunnel). |
| **Container cannot reach `host.docker.internal:9000`** | Run container `wget` check. If host `curl` works but this fails: confirm `api.extra_hosts: host.docker.internal:host-gateway` and that the tunnel is not bound **only** to `127.0.0.1` on the host (Docker hits the host via the gateway, not loopback). |
| **`/media/worker-health` fails** | `printenv MEDIA_WORKER_URL` must be `http://host.docker.internal:9000`. Compare with raw `wget` from the container; inspect `docker compose … logs api --tail 100`. |
| **`generate-image` times out (504)** | ComfyUI on workstation should listen on **`127.0.0.1:8188`**; worker env (`COMFYUI_URL`, checkpoint, etc.) must match. Increase `MEDIA_WORKER_TIMEOUT_MS` only if generations legitimately exceed the default (660000 ms). |

### Failure triage (tunnel drop, slowness, timeout alignment)

| Symptom | What to verify |
|---------|----------------|
| **Tunnel dropped** | Host `curl http://127.0.0.1:9000/health` fails; API logs `failureClass:connection` on generate/health. Restore SSH session (`autossh`/systemd). |
| **Worker slow but reachable** | Health stays fast; `totalLatencyMs` in logs grows with Comfy load. Tune GPU/worker; do not set `MEDIA_WORKER_TIMEOUT_MS` below realistic max generation time. |
| **Worker internal timeout** | Upstream returns **504** or error payload while Nest `totalLatencyMs` &lt; `MEDIA_WORKER_TIMEOUT_MS`. Adjust worker (`COMFYUI_GENERATION_TIMEOUT`, etc.) on the workstation. |
| **API vs worker timeout mismatch** | Nest returns **504** and logs show `failureClass:timeout` with `totalLatencyMs` ≈ `axiosTimeoutMs` from `generate_image.forwarding`. Increase `MEDIA_WORKER_TIMEOUT_MS` or speed up worker; keep worker limits ≤ API limit where possible so the worker errors before Axios cuts the connection. |

### `MEDIA_WORKER_DEBUG` (production)

**Leave `MEDIA_WORKER_DEBUG=false` or unset** in production. Compose defaults to `false`. Set `true` only for short, controlled diagnosis, then revert — `GET /media/worker-debug` is **unauthenticated**.

Enable (set `MEDIA_WORKER_DEBUG=true` in `.env`, then):

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml up -d api
curl -sS http://127.0.0.1:4000/media/worker-debug
```

Disable (set `MEDIA_WORKER_DEBUG=false` or remove the line, then):

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml up -d api
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:4000/media/worker-debug
```

Expect **`404`** after disable.

### PASS / FAIL checklist (final)

| Area | PASS when |
|------|-----------|
| **Tunnel** | Host `curl http://127.0.0.1:9000/health` succeeds |
| **Container routing** | `wget http://host.docker.internal:9000/health` from `api` container succeeds |
| **API worker health** | `GET /media/worker-health` returns worker payload (not 502/503/504) |
| **Image generation path** | `POST /media/generate-image` with `{"prompt":"…"}` completes per worker contract |
| **Production debug exposure** | `MEDIA_WORKER_DEBUG` is `false` or unset; `GET /media/worker-debug` returns **404** |

---

## Structured logging (API)

`MediaWorkerService` emits **one JSON object per line** via Nest `Logger` (searchable with `docker compose logs` / `grep`).

Events (no prompt text, no response bodies):

| Event | Fields (typical) |
|-------|------------------|
| `media_worker.generate_image.received` | `receivedAt`, `bodyKeyCount`, `promptCharLength`, `jsonUtf8Bytes` |
| `media_worker.generate_image.forwarding` | `forwardedAt`, `axiosTimeoutMs` (= enforced **`MEDIA_WORKER_TIMEOUT_MS`**) |
| `media_worker.generate_image.completed` | `success:true`, `responseReceivedAt`, `totalLatencyMs`, `queueToWireMs`, `wireLatencyMs`, `upstreamHttpStatus` |
| `media_worker.generate_image.failed` | `success:false`, `failureClass` (`timeout` \| `connection` \| `upstream_http` \| `unknown`), `upstreamHttpStatus`, `axiosCode` |
| `media_worker.health.*` | Same pattern for health probes |

### Check logs

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml logs api --tail 200 | grep media_worker
```

```bash
docker compose -f docker-compose.prod.yml logs api --since 30m 2>&1 | grep generate_image
```

---

## Request body size (no truncation)

- **Inbound JSON** to the API: limit raised to **5mb** in `apps/api/src/main.ts` (`useBodyParser('json', { limit: '5mb' })`) so large prompts / extra keys are accepted.
- **Outbound** to the worker: Axios posts the **full** object (`maxBodyLength` / `maxContentLength` unbounded). No application-level truncation.

---

## API timeout guard

- **`MEDIA_WORKER_TIMEOUT_MS`** is passed to Axios as **`timeout`** on `POST …/generate-image` and logged as **`axiosTimeoutMs`** on `media_worker.generate_image.forwarding`.
- Invalid or non-positive values fall back to **660000** ms in code.

---

## Minimal load test (curl only, no queue)

Replace the API URL if needed. Expect **2xx** and stable logs.

**Single request**

```bash
curl -sS -X POST http://127.0.0.1:4000/media/generate-image -H "Content-Type: application/json" -d '{"prompt":"load test single"}'
```

**Three sequential requests**

```bash
for i in 1 2 3; do curl -sS -X POST http://127.0.0.1:4000/media/generate-image -H "Content-Type: application/json" -d "{\"prompt\":\"load test seq $i\"}"; echo; done
```

**Stability:** no intermittent **502** between runs while the tunnel stays up; `totalLatencyMs` may vary with GPU load.

---

## Operator commands (quick reference)

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml logs api --tail 150 | grep media_worker
docker compose -f docker-compose.prod.yml up -d api
curl -sS http://127.0.0.1:4000/media/worker-health
curl -sS -X POST http://127.0.0.1:4000/media/generate-image -H "Content-Type: application/json" -d '{"prompt":"operator check"}'
```

---

## Production readiness checklist (final)

| Item | PASS when |
|------|-----------|
| **Tunnel stability** | Host health succeeds; tunnel stays up during sequential load test |
| **API connectivity** | Container `wget host.docker.internal:9000/health` succeeds; `MEDIA_WORKER_URL` correct |
| **Worker responsiveness** | `GET /media/worker-health` fast; generate completes within expected GPU time |
| **Error handling** | Forced failures yield **502**/**503**/**504** as designed; logs show matching `failureClass` |
| **Debug endpoint** | `MEDIA_WORKER_DEBUG` false/unset; `/media/worker-debug` → **404** |

---

## Security

- Do **not** publish port `9000` on the public firewall; the tunnel should only be reachable from loopback / Docker-to-host as designed.
- Restrict `GET /media/worker-health` at nginx or add auth if you do not want it world-visible.

---

## Runtime notes (NestJS)

- Worker base URL comes only from **`process.env.MEDIA_WORKER_URL`** in `media-worker.service.ts` (not hardcoded).
- **Docker:** use **`http://host.docker.internal:9000`** — do **not** use `127.0.0.1` as `MEDIA_WORKER_URL` inside the container for the worker.

---

## Files involved (NestJS + deploy)

- `apps/api/src/main.ts` (JSON body limit **5mb** for large worker payloads)
- `apps/api/src/modules/media/media.module.ts`
- `apps/api/src/modules/media/media.controller.ts` (`/media/worker-health`, `/media/worker-debug`)
- `apps/api/src/modules/media/media.service.ts`
- `apps/api/src/modules/media/media-worker.service.ts` (`MEDIA_WORKER_URL`, structured logs, timeouts, `getDebugSnapshot`)
- `apps/api/src/modules/media/generate-image-payload.ts`
- `apps/api/src/modules/media/dto/generate-image.dto.ts`
- `docker-compose.prod.yml` (`api.extra_hosts`, `MEDIA_WORKER_*`, `MEDIA_WORKER_DEBUG`)
- `deploy/env.prod.example`
- `deploy/SERVER_RUNBOOK.txt`
