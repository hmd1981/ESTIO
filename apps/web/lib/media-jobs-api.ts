import { publicApiBaseUrl } from "@/lib/api-config";
import {
  buildComfyViewImageUrl,
  mediaJobViewBaseUrl,
  mediaJobViewPath,
} from "@/lib/comfy-view-url";
import { getWalletSession } from "@/lib/wallet-session";

/**
 * Build the headers for a media-jobs request. Always JSON, and attaches
 * `Authorization: Bearer <walletToken>` if a wallet session exists in
 * localStorage. The API decides whether the token is required (Phase 2 soft
 * mode allows anonymous submits unless `PHASE2_ENFORCE_AUTH=true`).
 */
function jsonHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const session = getWalletSession();
  if (session) h["Authorization"] = `Bearer ${session.token}`;
  return h;
}

/** Keep in sync with `apps/api/src/modules/media/generate-image-payload.ts`. */
export const MEDIA_GENERATE_IMAGE_PROMPT_MAX_LENGTH = 8000;

const JOBS_BASE = `${publicApiBaseUrl.replace(/\/$/, "")}/media/jobs`;

/** Studio modes for `POST /media/jobs` (unified). */
export type MediaStudioJobMode =
  | "text_to_image"
  | "image_to_video"
  | "text_to_video";

/** Video quality tier — forwarded on the job body for VM900/901 tiered pipelines. */
export type VideoGenerationTier = "preview" | "standard" | "premium";

export type MediaJobLifecycleStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type CreateMediaGenerateImageResponse = {
  /** Same as `id`; preferred for new UIs */
  jobId: string;
  id: string;
  type: string;
  mediaKind: "image" | "video" | "unknown";
  status: "queued";
  resultReady: false;
  error: null;
  createdAt: string;
  mediaWorkerMode: "sync" | "async";
};

/** Normalized primary asset from `GET /media/jobs/:id/result` (200). */
export type MediaJobPlaybackDescriptor =
  | { kind: "http_url"; media: "image" | "video"; url: string }
  | { kind: "data_url"; media: "image" | "video"; dataUrl: string };

/** Successful result payload from `GET /media/jobs/:id/result`. */
export type MediaJobCompletedResultResponse = {
  jobId: string;
  id: string;
  type: string;
  mediaKind: "image" | "video" | "unknown";
  status: "completed";
  resultReady: true;
  error: null;
  playback: MediaJobPlaybackDescriptor | null;
  result: unknown;
};

export type MediaJobPublicError = {
  message: string;
  code: string;
};

/** Matches `MediaJobStatusResponse` from the API (`media-jobs-public.view.ts`). */
export type MediaJobStatusResponse = {
  jobId: string;
  id: string;
  type: string;
  status: MediaJobLifecycleStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  resultReady: boolean;
  /** @deprecated Prefer `resultReady` */
  hasResult: boolean;
  inputMeta: {
    promptCharLength: number | null;
    bodyKeyCount: number | null;
    jsonUtf8Bytes: number | null;
    imageSourceKey: string | null;
  };
  mediaKind: "image" | "video" | "unknown";
  error: MediaJobPublicError | null;
  meta: {
    mediaWorkerMode: "sync" | "async";
    workerRemoteJobId: string | null;
    workerTargetHost: string | null;
  };
};

export class MediaJobApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "MediaJobApiError";
  }
}

/** True when GET …/result returned 409 with `error.code` RESULT_NOT_READY (keep polling status/result). */
export function isMediaJobResultNotReadyError(e: unknown): boolean {
  if (!(e instanceof MediaJobApiError) || e.status !== 409) return false;
  const body = e.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) return false;
  const err = (body as Record<string, unknown>).error;
  if (!err || typeof err !== "object" || Array.isArray(err)) return false;
  return (err as Record<string, unknown>).code === "RESULT_NOT_READY";
}

async function readBody(res: Response): Promise<unknown> {
  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  const t = await res.text();
  return t || null;
}

function errMessage(status: number, body: unknown): string {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    const o = body as Record<string, unknown>;
    const nestedErr = o.error;
    if (nestedErr && typeof nestedErr === "object" && !Array.isArray(nestedErr)) {
      const em = (nestedErr as Record<string, unknown>).message;
      if (typeof em === "string" && em.trim()) return em.trim();
    }
    const m = o.message;
    if (typeof m === "string" && m.trim()) return m.trim();
    const msg = o.errorMessage;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }
  if (typeof body === "string" && body.trim()) return body.trim().slice(0, 500);
  return `Request failed (${status})`;
}

/**
 * Unified Studio submit — all modes use `POST /media/jobs` with top-level `mode`.
 */
export async function createStudioMediaJob(body: {
  mode: MediaStudioJobMode;
  [key: string]: unknown;
}): Promise<CreateMediaGenerateImageResponse> {
  const res = await fetch(JOBS_BASE, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  });
  const payload = await readBody(res);
  if (!res.ok) {
    throw new MediaJobApiError(errMessage(res.status, payload), res.status, payload);
  }
  return payload as CreateMediaGenerateImageResponse;
}

/**
 * Text-to-image via unified `POST /media/jobs` (same persistence as Studio).
 * `POST /media/jobs/generate-image` remains on the API for older integrations.
 */
export async function createMediaGenerateImageJob(body: {
  prompt: string;
  [key: string]: unknown;
}): Promise<CreateMediaGenerateImageResponse> {
  return createStudioMediaJob({ ...body, mode: "text_to_image" });
}

export type CreateMediaGenerateMediaBody =
  | {
      mode: "text_to_video";
      prompt: string;
      duration_seconds?: number;
      [key: string]: unknown;
    }
  | {
      mode: "image_to_video";
      prompt?: string;
      image_url?: string;
      image_base64?: string;
      duration_seconds?: number;
      [key: string]: unknown;
    };

/** Video-oriented Studio bodies; same as {@link createStudioMediaJob}. */
export async function createMediaGenerateMediaJob(
  body: CreateMediaGenerateMediaBody,
): Promise<CreateMediaGenerateImageResponse> {
  return createStudioMediaJob(body);
}

/**
 * VM901 orchestration upgrade path when deployed (`POST /media/jobs/:id/upgrade`).
 * Returns the new job envelope (new id) while preserving lineage server-side.
 */
export async function upgradeMediaJobTier(
  jobId: string,
  tier: Exclude<VideoGenerationTier, "preview">,
): Promise<CreateMediaGenerateImageResponse> {
  const res = await fetch(
    `${JOBS_BASE}/${encodeURIComponent(jobId)}/upgrade`,
    {
      method: "POST",
      headers: jsonHeaders(),
      body: JSON.stringify({ generation_tier: tier }),
    },
  );
  const payload = await readBody(res);
  if (!res.ok) {
    throw new MediaJobApiError(errMessage(res.status, payload), res.status, payload);
  }
  return payload as CreateMediaGenerateImageResponse;
}

/**
 * Best-effort tier label from worker result JSON (shape may vary by worker version).
 */
export function extractVideoGenerationTierFromResult(
  result: unknown,
): VideoGenerationTier | null {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }
  const o = result as Record<string, unknown>;
  const raw =
    o.generation_tier ??
    o.generationTier ??
    o.tier ??
    o.quality_tier ??
    o.qualityTier ??
    o.render_tier;
  if (raw === "preview" || raw === "standard" || raw === "premium") {
    return raw;
  }
  if (typeof raw === "string") {
    const t = raw.trim().toLowerCase();
    if (t === "preview" || t === "standard" || t === "premium") {
      return t;
    }
  }
  return null;
}

/**
 * Prefer dedicated upgrade route; if the API has not added it yet, enqueue a new job with the same
 * inputs, a higher tier, and `derived_from_job_id` for worker lineage (passthrough).
 */
export async function requestVideoTierUpgrade(options: {
  fromJobId: string;
  targetTier: Exclude<VideoGenerationTier, "preview">;
  /** Must include `mode` and the same inputs as the original job. */
  replayBody: Record<string, unknown>;
}): Promise<CreateMediaGenerateImageResponse> {
  try {
    return await upgradeMediaJobTier(options.fromJobId, options.targetTier);
  } catch (e) {
    if (
      e instanceof MediaJobApiError &&
      (e.status === 404 || e.status === 405 || e.status === 501)
    ) {
      return createStudioMediaJob({
        ...options.replayBody,
        mode: options.replayBody.mode as MediaStudioJobMode,
        generation_tier: options.targetTier,
        derived_from_job_id: options.fromJobId,
      });
    }
    throw e;
  }
}

export async function getMediaJobStatus(
  id: string,
): Promise<MediaJobStatusResponse> {
  const res = await fetch(
    `${JOBS_BASE}/${encodeURIComponent(id)}`,
    { method: "GET" },
  );
  const payload = await readBody(res);
  if (!res.ok) {
    throw new MediaJobApiError(errMessage(res.status, payload), res.status, payload);
  }
  return payload as MediaJobStatusResponse;
}

export async function getMediaJobResult(
  id: string,
): Promise<MediaJobCompletedResultResponse> {
  const res = await fetch(
    `${JOBS_BASE}/${encodeURIComponent(id)}/result`,
    { method: "GET" },
  );
  const payload = await readBody(res);
  if (!res.ok) {
    throw new MediaJobApiError(errMessage(res.status, payload), res.status, payload);
  }
  return payload as MediaJobCompletedResultResponse;
}

/** Single string suitable for `<img src>` / `<video src>` when `playback` is set. */
export function mediaPlaybackSrc(
  playback: MediaJobPlaybackDescriptor | null,
): string | null {
  if (!playback) return null;
  return playback.kind === "http_url" ? playback.url : playback.dataUrl;
}

const IMAGE_PATH_EXT = /\.(png|jpe?g|webp|gif|svg)(\?|#|$)/i;

/** Browser can load Estio API–hosted paths (e.g. `/uploads/...`) when the worker stores a site-relative path. */
function absolutizePublicApiPath(path: string): string {
  const p = path.trim();
  const base = publicApiBaseUrl.replace(/\/$/, "");
  return p.startsWith("/") ? `${base}${p}` : `${base}/${p}`;
}

function coerceImageString(s: string): string | null {
  const t = s.trim();
  if (!t) return null;
  if (t.startsWith("data:image/")) return t;
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  if (t.startsWith("/") && IMAGE_PATH_EXT.test(t)) return absolutizePublicApiPath(t);
  return null;
}

/** Last resort: scan JSON for any string that looks like an image URL or site-relative image path. */
function deepFindCoercedImageString(v: unknown, depth: number): string | null {
  if (depth > 14) return null;
  if (typeof v === "string") {
    return coerceImageString(v);
  }
  if (Array.isArray(v)) {
    for (const item of v) {
      const r = deepFindCoercedImageString(item, depth + 1);
      if (r) return r;
    }
    return null;
  }
  if (v && typeof v === "object") {
    for (const val of Object.values(v as Record<string, unknown>)) {
      const r = deepFindCoercedImageString(val, depth + 1);
      if (r) return r;
    }
  }
  return null;
}

/**
 * Best-effort image URL (or data URL) from worker result JSON.
 * Keeps UI tolerant of minor contract variations without exposing prompts.
 */
export function extractRenderableImageUrl(result: unknown): string | null {
  if (typeof result === "string") {
    return coerceImageString(result);
  }
  if (Array.isArray(result)) {
    return deepFindCoercedImageString(result, 0);
  }
  if (!result || typeof result !== "object") {
    return null;
  }
  const o = result as Record<string, unknown>;

  const comfyBase = mediaJobViewBaseUrl();
  if (comfyBase) {
    const comfyUrl = buildComfyViewImageUrl(
      result,
      comfyBase,
      mediaJobViewPath(),
    );
    if (comfyUrl) {
      return comfyUrl;
    }
  }

  const tryString = (v: unknown): string | null => {
    if (typeof v !== "string" || !v.trim()) return null;
    return coerceImageString(v);
  };

  for (const key of [
    "image_url",
    "imageUrl",
    "url",
    "output_url",
    "outputUrl",
    "result_url",
    "resultUrl",
    "public_url",
    "publicUrl",
    "preview",
    "preview_url",
    "previewUrl",
    "file_url",
    "fileUrl",
    "src",
    "href",
    "image",
    "thumbnail",
    "thumbnail_url",
    "thumbnailUrl",
  ]) {
    const u = tryString(o[key]);
    if (u) return u;
  }

  const b64json = o.b64_json ?? o.b64Json;
  if (typeof b64json === "string" && b64json.length > 20) {
    const clean = b64json.replace(/\s/g, "");
    return `data:image/png;base64,${clean}`;
  }

  for (const nested of ["output", "result", "image", "data"]) {
    const inner = o[nested];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const u = extractRenderableImageUrl(inner);
      if (u) return u;
    }
    if (typeof inner === "string") {
      const u = coerceImageString(inner);
      if (u) return u;
    }
  }

  const images = o.images;
  if (Array.isArray(images) && images.length > 0) {
    for (const first of images) {
      if (typeof first === "string") {
        const u = coerceImageString(first);
        if (u) return u;
      }
      if (first && typeof first === "object" && !Array.isArray(first)) {
        const r = first as Record<string, unknown>;
        const u =
          tryString(r.url) ??
          tryString(r.image_url) ??
          tryString(r.imageUrl);
        if (u) return u;
      }
    }
  }

  const b64 = o.image_base64 ?? o.imageBase64 ?? o.base64;
  if (typeof b64 === "string" && b64.length > 0) {
    if (b64.startsWith("data:image/")) return b64;
    return `data:image/png;base64,${b64.replace(/\s/g, "")}`;
  }

  return deepFindCoercedImageString(result, 0);
}

function isRenderableVideoUrl(s: string): boolean {
  const t = s.trim();
  if (t.startsWith("data:video/")) return true;
  if (t.startsWith("http://") || t.startsWith("https://")) return true;
  return false;
}

/**
 * Best-effort video URL (or data URL) from worker result JSON (including `{ result: { … } }` envelopes).
 */
export function extractRenderableVideoUrl(result: unknown): string | null {
  if (typeof result === "string") {
    const s = result.trim();
    return isRenderableVideoUrl(s) ? s : null;
  }
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }
  const o = result as Record<string, unknown>;

  const tryVideoString = (v: unknown): string | null => {
    if (typeof v !== "string" || !v.trim()) return null;
    const s = v.trim();
    return isRenderableVideoUrl(s) ? s : null;
  };

  for (const key of [
    "video_url",
    "videoUrl",
    "output_url",
    "outputUrl",
    "result_url",
    "resultUrl",
    "url",
    "public_url",
    "publicUrl",
  ]) {
    const u = tryVideoString(o[key]);
    if (u) return u;
  }

  for (const nested of ["output", "result", "data", "video"]) {
    const inner = o[nested];
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      const u = extractRenderableVideoUrl(inner);
      if (u) return u;
    }
  }

  const videos = o.videos;
  if (Array.isArray(videos) && videos.length > 0) {
    const first = videos[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      const u = tryVideoString((first as Record<string, unknown>).url);
      if (u) return u;
      const u2 = tryVideoString((first as Record<string, unknown>).video_url);
      if (u2) return u2;
    }
  }

  return null;
}
