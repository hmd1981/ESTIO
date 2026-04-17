# Async media generation jobs — architecture & migration

**Operator runbook (async switch & verification):** [MEDIA_WORKER_PHASE_C_RUNBOOK.md](./MEDIA_WORKER_PHASE_C_RUNBOOK.md) · **Worker reachability (tunnel / `host.docker.internal`):** [MEDIA_WORKER_REACHABILITY_RUNBOOK.md](./MEDIA_WORKER_REACHABILITY_RUNBOOK.md)

**Topology (unchanged):** Estio API in Docker → `MEDIA_WORKER_URL=http://host.docker.internal:9000` → SSH reverse tunnel → workstation FastAPI → ComfyUI on `127.0.0.1:8188`.

**Goal:** Return a **job id immediately**; clients **poll** for status/result. The synchronous **`POST /media/generate-image`** stays for backward compatibility until callers migrate.

---

## 1. Current synchronous flow (review)

| Step | Component |
|------|-----------|
| Client | `POST /media/generate-image` with JSON body |
| `MediaController.generateImage` | `assertGenerateImagePayload(body)` → same object reference |
| `MediaService` | `forwardGenerateImageToWorker(payload)` |
| `MediaWorkerService` | `POST {MEDIA_WORKER_URL}/generate-image` with Axios `timeout = MEDIA_WORKER_TIMEOUT_MS` |
| Response | Worker JSON returned inline; client holds connection for full Comfy run |

**Implication:** Long generations block HTTP, proxies, and mobile clients. Timeouts align with **`MEDIA_WORKER_TIMEOUT_MS`**; failures map to **502 / 503 / 504** as today.

---

## 2. Recommended architecture (first production phase)

### Hybrid: **BullMQ (Redis) + Prisma**

| Layer | Role |
|-------|------|
| **Prisma `MediaGenerationJob`** | Durable record: id, status, timestamps, metadata, result/error payloads — **source of truth for `GET /media/jobs/:id`** |
| **BullMQ queue** `media-generate` (new) | At-least-once dispatch, retries/backoff, concurrency limit, survives short API restarts (Redis persists) |
| **Nest worker** | Bull `Worker` process handler: load row → `running` → call existing `MediaWorkerService.forwardGenerateImage` → persist `completed` / `failed` |

**Why not DB-only polling first?**

- Without a queue you need a poller (`@Cron` / `setInterval`) and **row locking** for multi-replica API — easy to get wrong.
- You **already run Redis + BullMQ** for `POST /ai/jobs` (`AiJobsModule`). Reusing the same Redis with a **separate queue name** avoids new infrastructure.

**Why not Bull-only (no Prisma)?**

- Bull job state is great for operators but **weaker for product features**: long-term audit, analytics, future multi-worker routing fields, and a **stable contract** for clients if Redis is flushed.
- Prisma gives a **simple polling API** without coupling clients to Bull job JSON.

**Hybrid downside:** Two writes (enqueue + DB update). Mitigate with **same UUID** as Bull `jobId` and Prisma `id`.

**Later extension:** Multiple workers → `workerTarget` / queue name / routing key on the row + separate Bull queues.

---

## 3. Endpoint contract

### `POST /media/jobs/generate-image`

**Request:** Same JSON as sync route (minimum: `prompt`; extra keys forwarded to worker unchanged).

**Response (202 or 200 — pick one; recommend 202):**

```json
{
  "id": "uuid",
  "status": "queued",
  "createdAt": "ISO-8601",
  "mediaWorkerMode": "sync|async"
}
```

**Errors:** **400** validation; **503** if Redis/queue unavailable (or degrade policy documented); optional **429** if you add rate limits per IP (mirror `AiJobsRateLimitService` pattern).

### `GET /media/jobs/:id`

**Response (example):**

```json
{
  "id": "uuid",
  "type": "generate_image",
  "status": "queued|running|completed|failed",
  "createdAt": "...",
  "startedAt": null,
  "completedAt": null,
  "workerTargetHost": "host.docker.internal",
  "inputMeta": { "promptCharLength": 42, "bodyKeyCount": 1, "jsonUtf8Bytes": 128 },
  "error": null
}
```

When `completed`, either embed a **summary** (`resultSummary`) or omit heavy payload and point to result route.

### `GET /media/jobs/:id/result` (optional but recommended)

- **200:** Full worker JSON (same shape as synchronous success).
- **404:** Unknown id.
- **409** or **425:** Job not finished (document one convention; e.g. **409** `{ "status": "running" }`).
- **422** or **200** with error object: Job **failed** — include structured `errorPayload` / `failureClass` aligned with sync (`timeout`, `connection`, `upstream_http`).

Keep **HTTP status** for “job state” separate from **worker upstream** status stored inside `errorPayload` when applicable.

---

## 4. Prisma data model (proposal)

```prisma
enum MediaGenerationJobStatus {
  queued
  running
  completed
  failed
}

model MediaGenerationJob {
  id        String   @id @default(uuid())
  type      String   // e.g. "generate_image"
  status    MediaGenerationJobStatus @default(queued)

  /// Denormalized for multi-worker later (hostname only, no secrets)
  workerTargetHost String?

  /// Snapshot for execution — treat as sensitive; restrict admin access / retention policy
  inputPayload     Json

  /// Safe fields for listings / logs (lengths, key counts); optional duplicate of metrics
  inputMeta        Json?

  resultPayload    Json?
  errorPayload     Json?
  /// Short message for clients; no stack traces in production
  errorMessage     String?  @db.VarChar(1024)

  upstreamHttpStatus Int?

  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?

  @@index([status, createdAt])
  @@map("media_generation_jobs")
}
```

**Privacy:** Prefer **not** logging full `inputPayload` in app logs; structured logs can mirror sync metrics (`promptCharLength`, `jsonUtf8Bytes`). For compliance, consider encryption-at-rest or TTL cleanup job later.

---

## 5. Job lifecycle

```text
POST /media/jobs/generate-image
  → INSERT MediaGenerationJob (queued) + inputPayload/inputMeta
  → queue.add(jobId = id, data: { id })
  → return { id, status: "queued" }

Bull Worker picks job
  → UPDATE status = running, startedAt = now()
  → MediaWorkerService.forwardGenerateImage(inputPayload as Record)
       → on success: UPDATE status = completed, resultPayload, completedAt
       → on throw: map to failureClass + UPDATE status = failed, errorPayload, errorMessage, completedAt

GET /media/jobs/:id
  → SELECT by id (Prisma)

GET /media/jobs/:id/result
  → If completed → resultPayload
  → If failed → error contract
  → Else → not ready response
```

**Retries:** Bull `attempts` (e.g. 2–3) with backoff for **transient** failures (`connection`). For **upstream 4xx** from worker validation, **do not** retry — fail job immediately.

**Concurrency:** `Worker` option `concurrency: 1` initially (one GPU); increase only when multiple remote workers exist.

**Bull job timeout:** Set `timeout` **≥** `MEDIA_WORKER_TIMEOUT_MS` so Bull does not kill the job before Axios times out (avoid double-timeout confusion).

---

## 6. Timeout & error mapping (clean)

| Layer | Behaviour |
|-------|-----------|
| Axios (unchanged) | `MEDIA_WORKER_TIMEOUT_MS` → **504**-class failure inside processor → persist `failureClass: "timeout"` |
| Connection / tunnel | **502**-class → `failureClass: "connection"` |
| Worker HTTP error body | Store `upstreamHttpStatus` + body in `errorPayload`; job **failed** |
| Client polling | **GET** never returns raw 504; returns **200** with `status: "failed"` and structured error (or **422** on `/result` — document choice) |

---

## 7. Migration steps

1. Add Prisma model + migration; run `prisma migrate deploy` on server.
2. Implement `MediaJobsService` + Bull queue `media-generate` + worker in API process (same pattern as `AiJobsService`).
3. Add routes under `MediaController` or **`MediaJobsController`** `@Controller('media/jobs')` to avoid route shadowing (`:id` vs `generate-image`).
4. Wire `MediaWorkerService` into job processor (reuse sync code path).
5. Deploy; verify async path with curl + poll.
6. Update web/admin clients to prefer async; keep **`POST /media/generate-image`** until deprecation window ends.
7. Optional: nginx longer timeout only for legacy sync path; async endpoints short timeout.

---

## 8. File-level implementation plan

| Action | Path |
|--------|------|
| Edit | `apps/api/prisma/schema.prisma` — add enum + `MediaGenerationJob` |
| Create | `apps/api/prisma/migrations/.../migration.sql` (via `prisma migrate`) |
| Create | `apps/api/src/modules/media/media-jobs.service.ts` — create job, Bull worker, Prisma updates, `getJob`, `getResult` |
| Create | `apps/api/src/modules/media/media-jobs.controller.ts` — `POST generate-image`, `GET :id`, `GET :id/result` |
| Create | `apps/api/src/modules/media/dto/create-media-generation-job.dto.ts` — reuse validation via `assertGenerateImagePayload` or shared pipe |
| Edit | `apps/api/src/modules/media/media.module.ts` — register controller, service, import `PrismaModule`, `HttpModule` (if not already), ensure Redis/Bull available (import shared redis helper from `ai-jobs/redis-connection.ts` or extract to `lib/`) |
| Edit | `apps/api/src/modules/ai-jobs/redis-connection.ts` — optional: export shared `bullmqConnectionOptions` usage only (no change if imported as-is) |
| Edit | `deploy/env.prod.example` — document `MEDIA_JOB_*` if any (optional concurrency env) |
| Edit | `deploy/MEDIA_WORKER.md` — link to this doc; note sync vs async |

**Do not remove** `POST /media/generate-image` or `MediaWorkerService.forwardGenerateImage` synchronous path.

---

## 9. Relation to existing `POST /ai/jobs`

- **`/ai/jobs`:** `WorkstationRunService` / `POST …/worker/run` / placeholder picsum outputs — **different contract** from FastAPI Comfy worker.
- **`/media/jobs/*`:** **Comfy media worker** via `MediaWorkerService` and `MEDIA_WORKER_URL`.

Long-term you may **delegate** `text_to_image` AI jobs to the media queue internally; out of scope for phase 1.

---

## 10. Final server architecture checklist

| Item | PASS when |
|------|-----------|
| SSH tunnel + `host.docker.internal:9000` | Unchanged; worker health OK |
| Redis | Container healthy; BullMQ connects |
| Prisma migration | `MediaGenerationJob` table exists |
| Async POST | Returns `id` immediately (< 1s) |
| Poll GET | Status transitions `queued` → `running` → `completed`/`failed` |
| Result GET | Matches worker JSON when completed |
| Sync POST | Still works for legacy clients |
| Logs | No full prompts in structured logs; job id correlates |
| Debug | `MEDIA_WORKER_DEBUG` remains off in production |
| GPU concurrency | Bull `concurrency` matches real GPU capacity |

---

## 11. Summary choice

**First production step:** **Hybrid — BullMQ + Prisma**, new queue **`media-generate`**, **reuse existing Redis**, **persist job state in Prisma** for polling and audit. Keep **synchronous** `POST /media/generate-image` until clients migrate.

---

## Phase A — implemented (server)

### Routes

| Method | Path | Notes |
|--------|------|--------|
| **POST** | `/media/jobs/generate-image` | **202** `{ id, status: "queued", createdAt }`. Requires **Redis** (`REDIS_URL`). |
| **GET** | `/media/jobs/:id` | DB status + `inputMeta` (lengths only); `hasResult` when completed. |
| **GET** | `/media/jobs/:id/result` | Full **`resultPayload`** when `completed`; **409** if not ready; **422** if `failed`. |

Sync **`POST /media/generate-image`** unchanged.

### Files touched

- `apps/api/prisma/schema.prisma` — `MediaGenerationJob` + enum
- `apps/api/prisma/migrations/20260404143000_media_generation_jobs/migration.sql`
- `apps/api/src/modules/media/generate-image-payload.ts` — `buildMediaJobInputMeta`
- `apps/api/src/modules/media/media-jobs.service.ts` — queue `media-generate`, worker **concurrency 1**, processor uses `MediaWorkerService`
- `apps/api/src/modules/media/media-jobs.controller.ts`
- `apps/api/src/modules/media/media.module.ts`

### Commands (server)

```bash
# From repo root (or apps/api with correct DATABASE_URL)
cd /opt/estio-platform/apps/api
npx prisma migrate deploy
# rebuild/restart API container from repo root:
cd /opt/estio-platform
docker compose -f docker-compose.prod.yml up -d --build api
```

```bash
# Create async job
curl -sS -X POST http://127.0.0.1:4000/media/jobs/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"async phase a test"}'

# Poll (replace JOB_ID)
curl -sS http://127.0.0.1:4000/media/jobs/JOB_ID

# Result when completed
curl -sS http://127.0.0.1:4000/media/jobs/JOB_ID/result
```

### Phase A complete — checklist

| Item | Done |
|------|------|
| Prisma model + migration | Yes |
| Bull queue `media-generate` + worker `concurrency: 1` | Yes |
| `lockDuration` ≥ `MEDIA_WORKER_TIMEOUT_MS` + 60s | Yes |
| POST creates row + enqueue; returns quickly | Yes |
| GET status from DB only (safe `inputMeta`) | Yes |
| GET result returns stored worker JSON | Yes |
| Processor uses `MediaWorkerService.submitGenerateImageJobToWorker` (sync = inline same as `forwardGenerateImage`) | Yes |
| Sync endpoint preserved | Yes |
| No `192.168.x.x` in code paths | Yes |
| Redis required for async; 503 if missing | Yes |

---

## Phase B — worker mode boundary (implemented)

### Behaviour

| `MEDIA_WORKER_MODE` | Estio `MediaJobsService` processor | Sync `POST /media/generate-image` |
|---------------------|--------------------------------------|-------------------------------------|
| **`sync`** (default) | `submitGenerateImageJobToWorker` → inline blocking `POST …/generate-image` (same as Phase A) | Unchanged |
| **`async`** | Submit `POST …/jobs/generate-image` (configurable path), store `workerRemoteJobId`, poll `GET …/jobs/:id` until `completed`/`failed`, then `GET …/jobs/:id/result` | Still uses blocking `/generate-image` unless you later split |

Prisma remains **source of truth** for `GET /media/jobs/:id`. `workerRemoteJobId` is stored for ops when `async`.

### New / edited files

- `apps/api/src/modules/media/media-worker.contract.ts` — mode + submission types
- `apps/api/src/modules/media/media-worker.service.ts` — `submitGenerateImageJobToWorker`, `getWorkerJobStatusSnapshot`, `getWorkerJobResult`, `failureHintFromStatusBody`, `getMediaWorkerMode`; refactored sync HTTP core
- `apps/api/src/modules/media/media-jobs.service.ts` — processor: inline vs poll loop
- `apps/api/prisma/schema.prisma` — `workerRemoteJobId`
- `apps/api/prisma/migrations/20260404160000_media_job_worker_remote_id/migration.sql`
- `deploy/env.prod.example` — `MEDIA_WORKER_MODE` + async path envs

### Next step (workstation)

Align FastAPI SQLite jobs with:

- `POST {MEDIA_WORKER_ASYNC_SUBMIT_PATH}` → `{ "id": "<uuid>" }` (or `job_id` / `jobId`)
- `GET {MEDIA_WORKER_ASYNC_JOB_BASE_PATH}/:id` → `{ "status": "queued|running|completed|failed" }` (labels mapped in Estio)
- `GET …/:id/result` → final JSON when completed

Then set `MEDIA_WORKER_MODE=async` on Estio **after** the workstation ships the API.

### Phase C — controlled async switch (implemented)

- Configurable submit id keys (`MEDIA_WORKER_ASYNC_JOB_ID_KEYS`) and status JSON field (`MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD`).
- Poll uses `getWorkerJobStatusSnapshot` (status + body) for richer failure hints; contract table in `media-worker.contract.ts`.
- `POST /media/jobs/generate-image` response includes `mediaWorkerMode`.
- Runbook: [MEDIA_WORKER_PHASE_C_RUNBOOK.md](./MEDIA_WORKER_PHASE_C_RUNBOOK.md).

### Phase B server checklist

| Item | PASS when |
|------|-----------|
| Default `MEDIA_WORKER_MODE` unset or `sync` | Async Estio jobs complete via single blocking worker call; no `workerRemoteJobId` required |
| Sync `POST /media/generate-image` | Still works |
| `GET /media/jobs/:id` | Includes `mediaWorkerMode`, `workerRemoteJobId` (null in sync) |
| `MEDIA_WORKER_MODE=async` + matching workstation | Poll completes and persists result or structured failure |
| No prompt in status JSON | Only `inputMeta` lengths |
