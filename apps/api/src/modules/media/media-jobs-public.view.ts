import type { MediaGenerationJob } from '@prisma/client';
import {
  normalizeMediaJobPlayback,
  type MediaJobPlaybackDescriptor,
} from './media-job-playback.normalize';
import { publicMediaKindFromStoredType } from './media-job-modes';

export type { MediaJobPlaybackDescriptor };

/**
 * UI-facing media job API shapes (Estio ↔ browser).
 * Workstation wire format stays internal to MediaWorkerService.
 */

export type MediaJobUiStatus = 'queued' | 'running' | 'completed' | 'failed';

export type MediaJobPublicErrorCode =
  | 'TIMEOUT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_ERROR'
  | 'WORKER_JOB_FAILED'
  | 'UNKNOWN';

export type MediaJobPublicError = {
  message: string;
  code: MediaJobPublicErrorCode;
};

export type MediaJobSubmitResponse = {
  /** Same as `id`; preferred for new clients */
  jobId: string;
  id: string;
  /** Persisted job discriminator (`generate_image` legacy, or Studio `text_to_image`, …) */
  type: string;
  /** Normalized hint for UI (`image` vs `video`) */
  mediaKind: 'image' | 'video' | 'unknown';
  status: 'queued';
  /** Always false immediately after submit */
  resultReady: false;
  error: null;
  createdAt: string;
  mediaWorkerMode: 'sync' | 'async';
  /** Present when credits were debited for this job (wallet-authenticated submit). */
  credits?: {
    debited: number;
    balanceAfter: number;
  };
};

export type MediaJobStatusResponse = {
  jobId: string;
  id: string;
  type: string;
  mediaKind: 'image' | 'video' | 'unknown';
  status: MediaJobUiStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  /** True when `GET …/result` will return 200 with a completed envelope */
  resultReady: boolean;
  /** @deprecated Use `resultReady` */
  hasResult: boolean;
  inputMeta: {
    promptCharLength: number | null;
    bodyKeyCount: number | null;
    jsonUtf8Bytes: number | null;
    /** Which body key supplied the image reference (e.g. `image_url`); never the URL value */
    imageSourceKey: string | null;
  };
  /** Set only when `status === 'failed'` */
  error: MediaJobPublicError | null;
  meta: {
    mediaWorkerMode: 'sync' | 'async';
    workerRemoteJobId: string | null;
    workerTargetHost: string | null;
  };
};

export type MediaJobResultSuccess = {
  jobId: string;
  id: string;
  type: string;
  mediaKind: 'image' | 'video' | 'unknown';
  status: 'completed';
  resultReady: true;
  error: null;
  /**
   * Browser-safe primary asset for `<img>` / `<video src>` when inferable from `result`.
   * If `null`, inspect `result` or extend the worker contract.
   */
  playback: MediaJobPlaybackDescriptor | null;
  /** Raw workstation JSON; shape depends on job `type` / worker version */
  result: unknown;
};

/** Returned on **409** when the job has not finished successfully yet */
export type MediaJobResultNotReadyBody = {
  statusCode: 409;
  jobId: string;
  id: string;
  type: string;
  mediaKind: 'image' | 'video' | 'unknown';
  status: MediaJobUiStatus;
  resultReady: false;
  error: {
    message: string;
    code: 'RESULT_NOT_READY';
  };
};

export type MediaJobResultFailedBody = {
  statusCode: 422;
  jobId: string;
  id: string;
  type: string;
  mediaKind: 'image' | 'video' | 'unknown';
  status: 'failed';
  resultReady: false;
  error: MediaJobPublicError;
};

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

/**
 * Map persisted `errorPayload` (internal shape + raw worker JSON) to a stable, user-safe code.
 * Never expose raw `errorPayload` on public HTTP responses.
 */
export function mediaJobPublicErrorFromRow(
  row: MediaGenerationJob,
): MediaJobPublicError {
  const message =
    row.errorMessage?.trim() ||
    (row.status === 'failed' ? 'Media job failed' : 'Something went wrong');

  const payload = row.errorPayload;
  const rec = asRecord(payload);
  const kind = rec && typeof rec.kind === 'string' ? rec.kind : null;

  if (kind === 'timeout') {
    return { message, code: 'TIMEOUT' };
  }
  if (kind === 'bad_gateway' || kind === 'service_unavailable') {
    return { message, code: 'UPSTREAM_UNAVAILABLE' };
  }
  if (kind === 'http_exception') {
    return { message, code: 'UPSTREAM_ERROR' };
  }
  if (kind === 'unknown') {
    return { message, code: 'UNKNOWN' };
  }

  if (row.status === 'failed') {
    if (row.upstreamHttpStatus != null) {
      return { message, code: 'UPSTREAM_ERROR' };
    }
    // Worker failure body or other non-internal payload
    return { message, code: 'WORKER_JOB_FAILED' };
  }

  return { message, code: 'UNKNOWN' };
}

export function buildMediaJobSubmitResponse(
  row: { id: string; createdAt: Date; type: string },
  mediaWorkerMode: 'sync' | 'async',
  credits?: { debited: number; balanceAfter: number | null },
): MediaJobSubmitResponse {
  const base: MediaJobSubmitResponse = {
    jobId: row.id,
    id: row.id,
    type: row.type,
    mediaKind: publicMediaKindFromStoredType(row.type),
    status: 'queued',
    resultReady: false,
    error: null,
    createdAt: row.createdAt.toISOString(),
    mediaWorkerMode,
  };
  if (
    credits &&
    credits.debited > 0 &&
    credits.balanceAfter != null &&
    Number.isFinite(credits.balanceAfter)
  ) {
    base.credits = {
      debited: credits.debited,
      balanceAfter: credits.balanceAfter,
    };
  }
  return base;
}

export function buildMediaJobStatusResponse(
  row: MediaGenerationJob,
  mediaWorkerMode: 'sync' | 'async',
): MediaJobStatusResponse {
  const meta = row.inputMeta as {
    promptCharLength?: number | null;
    bodyKeyCount?: number;
    jsonUtf8Bytes?: number;
    imageSourceKey?: string | null;
  };
  const resultReady = row.resultPayload != null;
  return {
    jobId: row.id,
    id: row.id,
    type: row.type,
    mediaKind: publicMediaKindFromStoredType(row.type),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    resultReady,
    hasResult: resultReady,
    inputMeta: {
      promptCharLength: meta.promptCharLength ?? null,
      bodyKeyCount: meta.bodyKeyCount ?? null,
      jsonUtf8Bytes: meta.jsonUtf8Bytes ?? null,
      imageSourceKey: meta.imageSourceKey ?? null,
    },
    error: row.status === 'failed' ? mediaJobPublicErrorFromRow(row) : null,
    meta: {
      mediaWorkerMode,
      workerRemoteJobId: row.workerRemoteJobId ?? null,
      workerTargetHost: row.workerTargetHost ?? null,
    },
  };
}

export function buildMediaJobResultSuccess(
  row: MediaGenerationJob,
): MediaJobResultSuccess {
  const mediaKind = publicMediaKindFromStoredType(row.type);
  const raw = row.resultPayload as unknown;
  return {
    jobId: row.id,
    id: row.id,
    type: row.type,
    mediaKind,
    status: 'completed',
    resultReady: true,
    error: null,
    playback: normalizeMediaJobPlayback(mediaKind, raw),
    result: raw,
  };
}

export function buildMediaJobResultNotReadyBody(
  row: MediaGenerationJob,
): MediaJobResultNotReadyBody {
  return {
    statusCode: 409,
    jobId: row.id,
    id: row.id,
    type: row.type,
    mediaKind: publicMediaKindFromStoredType(row.type),
    status: row.status,
    resultReady: false,
    error: {
      code: 'RESULT_NOT_READY',
      message:
        'Result is not ready yet. Poll GET /media/jobs/:id until status is completed or failed.',
    },
  };
}

export function buildMediaJobResultFailedBody(
  row: MediaGenerationJob,
): MediaJobResultFailedBody {
  return {
    statusCode: 422,
    jobId: row.id,
    id: row.id,
    type: row.type,
    mediaKind: publicMediaKindFromStoredType(row.type),
    status: 'failed',
    resultReady: false,
    error: mediaJobPublicErrorFromRow(row),
  };
}
