/**
 * Estio ↔ workstation worker transport (Phase B/C boundary).
 *
 * ### Workstation `/jobs` contract (async mode)
 *
 * | Estio call | HTTP | Expected shape |
 * |------------|------|----------------|
 * | `submitMediaJobToWorker` (text_to_image / legacy `generate_image`) | `POST` + `MEDIA_WORKER_ASYNC_SUBMIT_PATH_TEXT_TO_IMAGE` or `MEDIA_WORKER_ASYNC_SUBMIT_PATH` or default `/jobs/generate-image` | JSON body (top-level `mode` stripped on wire); response must include job id (see `MEDIA_WORKER_ASYNC_JOB_ID_KEYS`). |
 * | `submitMediaJobToWorker` (image_to_video) | default `/jobs/image-to-video` or `MEDIA_WORKER_ASYNC_SUBMIT_PATH_IMAGE_TO_VIDEO` | Same async poll/result base (`MEDIA_WORKER_ASYNC_JOB_BASE_PATH`). |
 * | `submitMediaJobToWorker` (text_to_video) | default `/jobs/text-to-video` or `MEDIA_WORKER_ASYNC_SUBMIT_PATH_TEXT_TO_VIDEO` | Same async poll/result base. |
 * | `getWorkerJobStatusSnapshot` | `GET {base}{MEDIA_WORKER_ASYNC_JOB_BASE_PATH}/:workerJobId` | JSON with `status` or `state` (see `MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD`) ∈ `queued` \| `running` \| `completed` \| `failed` (+ aliases below). |
 * | `getWorkerJobResult` | `GET …/:workerJobId/result` | 2xx + worker result JSON when completed. |
 *
 * **Status aliases → Estio:** `pending`/`waiting`→queued; `active`/`processing`→running; `success`/`done`/`succeeded`→completed; `error`/`failure`/`cancelled`/`canceled`→failed.
 *
 * - **sync**: blocking `POST` — `text_to_image` / legacy `generate_image` → `/generate-image` (body without top-level `mode`); `image_to_video` / `text_to_video` → `/generate-media` with worker-shaped JSON (top-level `mode` kept; Estio maps `image_base64` → `source_image_b64`).
 * - **async**: submit + poll + result as above.
 *
 * `MEDIA_WORKER_MODE` defaults to `sync`; set `async` when the workstation exposes the async API.
 */

export type MediaWorkerMode = 'sync' | 'async';

/** Outcome of submitting a generate-image job to the workstation. */
export type MediaWorkerGenerateSubmission =
  | { kind: 'inline_completed'; result: unknown }
  | { kind: 'deferred'; workerJobId: string };

/** Normalized remote lifecycle (workstation may use different labels; we map in MediaWorkerService). */
export type MediaWorkerRemoteStatus =
  'queued' | 'running' | 'completed' | 'failed' | 'unknown';

export function resolveMediaWorkerMode(): MediaWorkerMode {
  const raw = process.env.MEDIA_WORKER_MODE?.trim().toLowerCase();
  if (raw === 'async') {
    return 'async';
  }
  return 'sync';
}
