# Media worker Phase C — async mode switch & verification

**Scope:** Controlled rollout of `MEDIA_WORKER_MODE=async` on Estio API against the workstation `/jobs` API. Prisma remains the durable source of truth for `GET /media/jobs/:id`; BullMQ dispatches processors; tunnel topology is unchanged.

**Related:** [MEDIA_JOBS_ASYNC.md](./MEDIA_JOBS_ASYNC.md) (architecture), [MEDIA_WORKER.md](./MEDIA_WORKER.md) (sync worker).

---

## 1. Operator: switch between sync and async

### `MEDIA_WORKER_MODE=sync` (default)

- Estio async jobs (`POST /media/jobs/generate-image`) still run: the processor calls the worker once with **blocking** `POST …/generate-image` and completes the Prisma row inline.
- `POST /media/generate-image` is unchanged (blocking).
- `workerRemoteJobId` on Prisma rows stays **null** for these completions.

### `MEDIA_WORKER_MODE=async`

- Processor: `POST` submit → store `workerRemoteJobId` → poll `GET …/jobs/:id` → on completed, `GET …/jobs/:id/result`; on failed, prefer error hints from poll JSON then result body.
- Sync `POST /media/generate-image` still uses **blocking** `/generate-image` (not the `/jobs` submit path).

**Verify the difference**

1. With `sync`: create async job → `GET /media/jobs/:id` should move to `completed`/`failed` without `workerRemoteJobId` (or null).
2. With `async`: same flow → row should show **`workerRemoteJobId`** set to the workstation job id once submitted; status transitions `queued` → `running` → `completed`/`failed`.

---

## 2. Environment variables (Estio API)

| Variable | Role |
|----------|------|
| `MEDIA_WORKER_MODE` | `sync` (default) or `async`. |
| `MEDIA_WORKER_URL` | Base URL to tunnel/worker (e.g. `http://host.docker.internal:9000`). |
| `MEDIA_WORKER_ASYNC_SUBMIT_PATH` | Default `/jobs/generate-image`. |
| `MEDIA_WORKER_ASYNC_JOB_BASE_PATH` | Default `/jobs` → status `GET /jobs/:id`, result `GET /jobs/:id/result`. |
| `MEDIA_WORKER_ASYNC_JOB_ID_KEYS` | Comma-separated JSON keys tried for submit response id (default `id,job_id,jobId,uuid`; nested `job.{key}` also tried). |
| `MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD` | Primary field for status string (default `status`; also tries `state`, `job_status`, `jobStatus`). |
| `MEDIA_WORKER_ASYNC_SUBMIT_TIMEOUT_MS` | Submit request timeout. |
| `MEDIA_WORKER_ASYNC_POLL_REQUEST_TIMEOUT_MS` | Per-poll GET timeout. |
| `MEDIA_WORKER_ASYNC_POLL_INTERVAL_MS` | Delay between polls (ms). |
| `MEDIA_WORKER_TIMEOUT_MS` | Bull lock / overall async job budget (processor deadline). |
| `REDIS_URL` | Required for `POST /media/jobs/generate-image`. |

---

## 3. Exact commands (replace placeholders)

Assume API base `https://api.example.com`, bearer token or session as your deployment uses. Examples use `curl` and `jq`.

### Enable async mode

In repo root `.env` (same dir as `docker-compose.prod.yml`):

```bash
MEDIA_WORKER_MODE=async
# Optional if workstation uses different field names:
# MEDIA_WORKER_ASYNC_JOB_ID_KEYS=id,uuid
# MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD=status
```

### Restart API (Docker Compose)

```bash
cd /path/to/estio-platform
docker compose -f docker-compose.prod.yml up -d api
docker compose -f docker-compose.prod.yml logs -f --tail=100 api
```

Look for structured log `media_worker.async.phase_c_ready` and `Media worker client ready mode=async`.

### Submit an async media job (Estio)

```bash
JOB_JSON=$(curl -sS -X POST "https://api.example.com/media/jobs/generate-image" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"prompt":"a red cube on white background"}')
echo "$JOB_JSON"
JOB_ID=$(echo "$JOB_JSON" | jq -r '.id')
echo "Estio job id: $JOB_ID"
echo "$JOB_JSON" | jq -e '.mediaWorkerMode == "async"' >/dev/null && echo "API reports async mode"
```

### Poll job status (Prisma-backed)

```bash
curl -sS "https://api.example.com/media/jobs/${JOB_ID}" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

Repeat until `status` is `completed` or `failed`. Check `workerRemoteJobId` in async mode.

### Fetch job result

```bash
curl -sS "https://api.example.com/media/jobs/${JOB_ID}/result" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .
```

- **409** while not terminal: poll status.
- **422** on failed: body includes `errorMessage`, `errorPayload`, `upstreamHttpStatus` when applicable.

### Triage failures

| Symptom | Checks |
|---------|--------|
| `503` on `POST /media/jobs/generate-image` | `REDIS_URL` set; Redis healthy; API logs Bull init. |
| Row stuck `running`, no `workerRemoteJobId` | Submit to workstation failed before id stored; check API logs `media_worker.async.submitted` / errors; worker reachability (`MEDIA_WORKER_URL`). |
| `workerRemoteJobId` set, never completes | Poll `GET {MEDIA_WORKER_URL}{MEDIA_WORKER_ASYNC_JOB_BASE_PATH}/:workerRemoteJobId` from a debug host; confirm status values match mapping (§4). |
| `failed` with generic message | Workstation should return `error` / `message` / `detail` on status or result JSON; tune `MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD` / id keys if fields differ. |
| Timeout failure | Increase `MEDIA_WORKER_TIMEOUT_MS` or fix slow worker; check `MEDIA_WORKER_ASYNC_POLL_INTERVAL_MS`. |

Optional (brief): set `MEDIA_WORKER_DEBUG=true`, restart API, use `GET /media/worker-debug` per [MEDIA_WORKER.md](./MEDIA_WORKER.md), then **unset** debug.

---

## 4. Workstation ↔ Estio status mapping

Workstation JSON (field from `MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD`, else `status` / `state` / `job_status` / `jobStatus`) is normalized to:

| Remote (case-insensitive) | Estio `MediaGenerationJob.status` |
|---------------------------|-----------------------------------|
| `queued`, `pending`, `waiting`, `0` | `queued` (poll continues; row may already be `running`) |
| `running`, `active`, `processing`, `1` | `running` |
| `completed`, `success`, `done`, `succeeded`, `2` | → fetch result → `completed` |
| `failed`, `error`, `failure`, `cancelled`, `canceled`, `3` | → `failed` |
| unknown / missing | treated as `unknown` (poll continues until deadline) |

Submit response id: first non-empty match among configured keys on root object, then nested `job` object.

---

## 5. Phase C checklist (Estio)

| # | Item | PASS when |
|---|------|-----------|
| 1 | `MEDIA_WORKER_MODE=sync` | Async Estio jobs complete; `mediaWorkerMode` in status is `sync`; `workerRemoteJobId` null. |
| 2 | `MEDIA_WORKER_MODE=async` | Submit returns; Prisma row gets `workerRemoteJobId`; terminal state persisted. |
| 3 | Status mapping | Workstation `queued`/`running`/`completed`/`failed` (and aliases) drive poll behavior. |
| 4 | Result path | After remote `completed`, `GET …/result` populates `resultPayload`; client `GET /media/jobs/:id/result` returns it. |
| 5 | Failed path | Remote `failed` persists `failed`; `errorMessage` prefers result/status hints when present. |
| 6 | Sync endpoint | `POST /media/generate-image` still works in both modes. |
| 7 | No tunnel change | Only env + restart; same `MEDIA_WORKER_URL`. |
| 8 | Logs | On async boot, `media_worker.async.phase_c_ready` includes submit path, job base, status field, id keys. |

---

## 6. Roll back

Set `MEDIA_WORKER_MODE=sync` (or unset), restart API. In-flight async workstation jobs may still be polled until the processor hits an error or timeout; new jobs use blocking inline completion again.
