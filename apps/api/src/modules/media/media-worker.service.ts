import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  type MediaWorkerGenerateSubmission,
  type MediaWorkerMode,
  type MediaWorkerRemoteStatus,
  resolveMediaWorkerMode,
} from './media-worker.contract';
import { routingKindFromStoredJobType } from './media-job-modes';
import {
  buildGenerateMediaWireBody,
  hasMappableSourceImageB64,
  pickHttpsImageUrlForFetch,
} from './media-worker-generate-media.adapter';

function isAxiosError(e: unknown): e is AxiosError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'isAxiosError' in e &&
    (e as AxiosError).isAxiosError === true
  );
}

type WorkerFailureClass =
  'timeout' | 'connection' | 'upstream_http' | 'unknown';

function joinWorkerUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/**
 * HTTP client for the GPU media worker (FastAPI in front of ComfyUI).
 *
 * Phase B: **`MEDIA_WORKER_MODE`** (`sync` default, or `async` for workstation `/jobs/*`).
 *
 * Sync public API: `forwardGenerateImage`, `probeWorkerHealth`.
 * Async orchestration (used by `MediaJobsService`): `submitGenerateImageJobToWorker`,
 * `getWorkerJobStatusSnapshot`, `getWorkerJobResult`, `failureHintFromStatusBody`.
 */
@Injectable()
export class MediaWorkerService implements OnModuleInit {
  private readonly logger = new Logger(MediaWorkerService.name);

  constructor(private readonly http: HttpService) {}

  onModuleInit(): void {
    const mode = resolveMediaWorkerMode();
    const raw = process.env.MEDIA_WORKER_URL?.trim();
    if (!raw) {
      this.logger.warn(
        'MEDIA_WORKER_URL is unset; POST /media/generate-image and GET /media/worker-health will respond with 503',
      );
      return;
    }
    try {
      const u = new URL(raw);
      const port =
        u.port ||
        (u.protocol === 'https:' ? '443' : u.protocol === 'http:' ? '80' : '');
      this.logger.log(
        `Media worker client ready mode=${mode} host=${u.hostname} port=${port || '(default)'} sync=/generate-image,/generate-media asyncSubmit(text)=${process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH_TEXT_TO_IMAGE ?? process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH ?? '/jobs/generate-image'} asyncJobBase=${process.env.MEDIA_WORKER_ASYNC_JOB_BASE_PATH ?? '/jobs'}`,
      );
      if (mode === 'async') {
        this.logStructured('media_worker.async.phase_c_ready', {
          submitPath:
            process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH ??
            '/jobs/generate-image',
          jobBasePath: process.env.MEDIA_WORKER_ASYNC_JOB_BASE_PATH ?? '/jobs',
          statusField:
            process.env.MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD ?? 'status',
          jobIdKeys:
            process.env.MEDIA_WORKER_ASYNC_JOB_ID_KEYS ?? 'id,job_id,jobId',
        });
      }
    } catch {
      this.logger.warn(
        'MEDIA_WORKER_URL is set but is not a valid absolute URL; worker calls will fail',
      );
    }
  }

  getMediaWorkerMode(): MediaWorkerMode {
    return resolveMediaWorkerMode();
  }

  /**
   * Synchronous path used by `POST /media/generate-image` (unchanged behaviour).
   */
  async forwardGenerateImage(body: Record<string, unknown>): Promise<unknown> {
    const receivedAt = Date.now();
    const receivedIso = new Date(receivedAt).toISOString();
    this.logStructured('media_worker.generate_image.received', {
      receivedAt: receivedIso,
      ...this.safeBodyMetrics(body),
    });

    const forwardedAt = Date.now();
    const safeTimeout = this.resolveGenerateTimeoutMs();
    this.logStructured('media_worker.generate_image.forwarding', {
      forwardedAt: new Date(forwardedAt).toISOString(),
      axiosTimeoutMs: safeTimeout,
    });

    try {
      const { data, status } = await this.performSyncGenerateImageHttp(
        body,
        safeTimeout,
      );
      const responseAt = Date.now();
      this.logStructured('media_worker.generate_image.completed', {
        success: true,
        responseReceivedAt: new Date(responseAt).toISOString(),
        totalLatencyMs: responseAt - receivedAt,
        queueToWireMs: forwardedAt - receivedAt,
        wireLatencyMs: responseAt - forwardedAt,
        upstreamHttpStatus: status,
      });
      return data;
    } catch (e) {
      const responseAt = Date.now();
      if (isAxiosError(e)) {
        const failureClass = this.classifyAxiosFailure(e);
        this.logStructured('media_worker.generate_image.failed', {
          success: false,
          responseReceivedAt: new Date(responseAt).toISOString(),
          totalLatencyMs: responseAt - receivedAt,
          failureClass,
          upstreamHttpStatus: e.response?.status,
          axiosCode: e.code,
        });
        this.throwFromAxios(e, 'generate-image');
      }
      this.logStructured('media_worker.generate_image.failed', {
        success: false,
        responseReceivedAt: new Date(responseAt).toISOString(),
        totalLatencyMs: responseAt - receivedAt,
        failureClass: 'unknown' satisfies WorkerFailureClass,
      });
      throw e;
    }
  }

  /**
   * Phase B adapter: submit generate-image to the workstation (legacy type `generate_image`).
   * Prefer `submitMediaJobToWorker` for new code paths.
   */
  async submitGenerateImageJobToWorker(
    body: Record<string, unknown>,
  ): Promise<MediaWorkerGenerateSubmission> {
    return this.submitMediaJobToWorker('generate_image', body);
  }

  /**
   * Unified submit: routes by persisted Prisma `MediaGenerationJob.type`
   * (`generate_image` → same as `text_to_image`).
   *
   * - **sync**: blocking `POST` — `text_to_image` → `/generate-image` (no `mode`); `image_to_video` /
   *   `text_to_video` → `/generate-media` with worker-shaped JSON (top-level `mode` kept).
   * - **async**: `POST` to mode-specific submit path; returns deferred + workstation job id.
   *
   * The JSON body omits top-level `mode` when forwarding to `/generate-image` only.
   */
  async submitMediaJobToWorker(
    estioStoredJobType: string,
    body: Record<string, unknown>,
  ): Promise<MediaWorkerGenerateSubmission> {
    const workerMode = resolveMediaWorkerMode();
    const routing = routingKindFromStoredJobType(estioStoredJobType);

    if (workerMode === 'sync') {
      if (routing === 'image_to_video' || routing === 'text_to_video') {
        let payload = body;
        if (routing === 'image_to_video') {
          payload = await this.enrichImageToVideoPayload(body);
        }
        const wire = buildGenerateMediaWireBody(routing, payload);
        this.logStructured('media_worker.submit_media.mode', {
          mediaWorkerMode: workerMode,
          estioStoredJobType,
          routing,
          syncPath: '/generate-media',
          ...this.safeGenerateMediaWireMetrics(wire),
        });
        const result = await this.forwardSyncGenerateMedia(wire);
        return { kind: 'inline_completed', result };
      }
    }

    const workerBody = this.stripModeForWorkerForward(body);
    this.logStructured('media_worker.submit_media.mode', {
      mediaWorkerMode: workerMode,
      estioStoredJobType,
      routing,
      ...this.safeBodyMetrics(workerBody),
    });

    if (workerMode === 'sync') {
      const result = await this.forwardSyncMediaJob(routing, workerBody);
      return { kind: 'inline_completed', result };
    }

    const baseUrl = process.env.MEDIA_WORKER_URL?.trim();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'MEDIA_WORKER_URL is not configured',
      );
    }

    const submitPath = this.resolveAsyncSubmitPath(routing);
    const submitTimeout = Number(
      process.env.MEDIA_WORKER_ASYNC_SUBMIT_TIMEOUT_MS ?? 30_000,
    );
    const safeSubmitTimeout =
      Number.isFinite(submitTimeout) && submitTimeout > 0
        ? submitTimeout
        : 30_000;

    const url = joinWorkerUrl(baseUrl, submitPath);
    try {
      const res = await firstValueFrom(
        this.http.post<unknown>(url, workerBody, {
          timeout: safeSubmitTimeout,
          headers: { 'Content-Type': 'application/json' },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }),
      );
      const workerJobId = this.extractAsyncWorkerJobId(res.data);
      if (!workerJobId) {
        throw new BadGatewayException(
          'Worker async submit response missing job id (expected id, job_id, or jobId)',
        );
      }
      this.logStructured('media_worker.async.submitted', {
        routing,
        workerJobId,
        upstreamHttpStatus: res.status,
      });
      return { kind: 'deferred', workerJobId };
    } catch (e) {
      if (isAxiosError(e)) {
        this.throwFromAxios(e, 'media-job');
      }
      throw e;
    }
  }

  private stripModeForWorkerForward(
    body: Record<string, unknown>,
  ): Record<string, unknown> {
    const { mode: _m, ...rest } = body;
    return rest;
  }

  private resolveAsyncSubmitPath(
    routing: ReturnType<typeof routingKindFromStoredJobType>,
  ): string {
    if (routing === 'text_to_image') {
      return (
        process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH_TEXT_TO_IMAGE?.trim() ||
        process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH?.trim() ||
        '/jobs/generate-image'
      );
    }
    if (routing === 'image_to_video') {
      return (
        process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH_IMAGE_TO_VIDEO?.trim() ||
        '/jobs/image-to-video'
      );
    }
    return (
      process.env.MEDIA_WORKER_ASYNC_SUBMIT_PATH_TEXT_TO_VIDEO?.trim() ||
      '/jobs/text-to-video'
    );
  }

  private async forwardSyncGenerateMedia(
    body: Record<string, unknown>,
  ): Promise<unknown> {
    const safeTimeout = this.resolveGenerateTimeoutMs();
    const { data } = await this.performSyncMediaPost(
      '/generate-media',
      body,
      safeTimeout,
    );
    return data;
  }

  private async forwardSyncMediaJob(
    routing: ReturnType<typeof routingKindFromStoredJobType>,
    body: Record<string, unknown>,
  ): Promise<unknown> {
    if (routing !== 'text_to_image') {
      throw new BadGatewayException(
        'Internal error: sync video routing must use POST /generate-media',
      );
    }
    return this.forwardGenerateImage(body);
  }

  /**
   * When the client sends only a public http(s) image URL, fetch bytes server-side so the worker
   * receives `source_image_b64`. URLs rejected by {@link pickHttpsImageUrlForFetch} must use base64 instead.
   */
  private async enrichImageToVideoPayload(
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (hasMappableSourceImageB64(body)) {
      return body;
    }
    const url = pickHttpsImageUrlForFetch(body);
    if (!url) {
      return body;
    }
    const b64 = await this.downloadPublicImageAsBase64(url);
    return { ...body, image_base64: b64 };
  }

  private async downloadPublicImageAsBase64(urlStr: string): Promise<string> {
    if (pickHttpsImageUrlForFetch({ image_url: urlStr }) !== urlStr) {
      throw new BadRequestException(
        'Source image URL is not allowed for server-side fetch',
      );
    }
    try {
      const res = await firstValueFrom(
        this.http.get(urlStr, {
          responseType: 'arraybuffer',
          timeout: 20_000,
          maxContentLength: 15 * 1024 * 1024,
          maxBodyLength: 15 * 1024 * 1024,
          validateStatus: (s) => s >= 200 && s < 300,
        }),
      );
      const raw = res.data as ArrayBuffer | Buffer | Uint8Array;
      const buf = Buffer.isBuffer(raw)
        ? raw
        : raw instanceof ArrayBuffer
          ? Buffer.from(raw)
          : Buffer.from(raw);
      return buf.toString('base64');
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status !== undefined) {
          throw new BadGatewayException(
            `Could not download source image (HTTP ${e.response.status})`,
          );
        }
        this.throwFromAxios(e, 'media-job');
      }
      throw e;
    }
  }

  private safeGenerateMediaWireMetrics(wire: Record<string, unknown>): {
    bodyKeyCount: number;
    promptCharLength: number;
    jsonUtf8Bytes: number;
  } {
    const prompt = wire.prompt;
    const promptCharLength = typeof prompt === 'string' ? prompt.length : 0;
    const redacted: Record<string, unknown> = { ...wire };
    if (typeof redacted.source_image_b64 === 'string') {
      redacted.source_image_b64 = `<${redacted.source_image_b64.length} chars>`;
    }
    let jsonUtf8Bytes = 0;
    try {
      jsonUtf8Bytes = Buffer.byteLength(JSON.stringify(redacted), 'utf8');
    } catch {
      jsonUtf8Bytes = -1;
    }
    return {
      bodyKeyCount: Object.keys(wire).length,
      promptCharLength,
      jsonUtf8Bytes,
    };
  }

  private async performSyncMediaPost(
    pathSuffix: string,
    body: Record<string, unknown>,
    safeTimeout: number,
  ): Promise<{ data: unknown; status: number }> {
    const baseUrl = process.env.MEDIA_WORKER_URL?.trim();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'MEDIA_WORKER_URL is not configured',
      );
    }
    const url = joinWorkerUrl(baseUrl, pathSuffix);
    try {
      const res = await firstValueFrom(
        this.http.post<unknown>(url, body, {
          timeout: safeTimeout,
          headers: { 'Content-Type': 'application/json' },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }),
      );
      return { data: res.data, status: res.status };
    } catch (e) {
      if (isAxiosError(e)) {
        this.throwFromAxios(e, 'media-job');
      }
      throw e;
    }
  }

  /**
   * Poll workstation async job status (`GET {MEDIA_WORKER_ASYNC_JOB_BASE_PATH}/:id`).
   * Returns normalized status plus raw JSON for failure hints (no prompt extraction).
   */
  async getWorkerJobStatusSnapshot(workerJobId: string): Promise<{
    status: MediaWorkerRemoteStatus;
    body: unknown;
    httpStatus: number;
  }> {
    if (resolveMediaWorkerMode() === 'sync') {
      throw new BadRequestException(
        'getWorkerJobStatusSnapshot is only valid when MEDIA_WORKER_MODE=async',
      );
    }
    const baseUrl = process.env.MEDIA_WORKER_URL?.trim();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'MEDIA_WORKER_URL is not configured',
      );
    }
    const jobBase =
      process.env.MEDIA_WORKER_ASYNC_JOB_BASE_PATH?.trim() || '/jobs';
    const url = joinWorkerUrl(
      baseUrl,
      `${jobBase.replace(/\/+$/, '')}/${encodeURIComponent(workerJobId)}`,
    );
    const timeout = Number(
      process.env.MEDIA_WORKER_ASYNC_POLL_REQUEST_TIMEOUT_MS ?? 10_000,
    );
    const safeTimeout =
      Number.isFinite(timeout) && timeout > 0 ? timeout : 10_000;

    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(url, {
          timeout: safeTimeout,
          validateStatus: (s) => s < 600,
        }),
      );
      if (res.status === 404) {
        return { status: 'unknown', body: res.data, httpStatus: res.status };
      }
      return {
        status: this.parseRemoteJobStatus(res.data),
        body: res.data,
        httpStatus: res.status,
      };
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.response?.status === 404) {
          return {
            status: 'unknown',
            body: e.response?.data,
            httpStatus: 404,
          };
        }
        this.throwFromAxios(e, 'media-job');
      }
      throw e;
    }
  }

  /** Best-effort short message from workstation status JSON (errors only; never prompt). */
  failureHintFromStatusBody(data: unknown): string | null {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }
    const o = data as Record<string, unknown>;
    for (const k of [
      'error',
      'message',
      'detail',
      'reason',
      'error_message',
      'errorMessage',
    ]) {
      const v = o[k];
      if (typeof v === 'string' && v.trim()) {
        return v.trim().slice(0, 1024);
      }
    }
    return null;
  }

  /**
   * Fetch workstation async job result (`GET …/:id/result`).
   */
  async getWorkerJobResult(workerJobId: string): Promise<unknown> {
    if (resolveMediaWorkerMode() === 'sync') {
      throw new BadRequestException(
        'getWorkerJobResult is only valid when MEDIA_WORKER_MODE=async',
      );
    }
    const baseUrl = process.env.MEDIA_WORKER_URL?.trim();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'MEDIA_WORKER_URL is not configured',
      );
    }
    const jobBase =
      process.env.MEDIA_WORKER_ASYNC_JOB_BASE_PATH?.trim() || '/jobs';
    const url = joinWorkerUrl(
      baseUrl,
      `${jobBase.replace(/\/+$/, '')}/${encodeURIComponent(workerJobId)}/result`,
    );
    const timeout = Number(
      process.env.MEDIA_WORKER_ASYNC_POLL_REQUEST_TIMEOUT_MS ?? 10_000,
    );
    const safeTimeout =
      Number.isFinite(timeout) && timeout > 0 ? timeout : 10_000;

    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(url, {
          timeout: safeTimeout,
          validateStatus: () => true,
        }),
      );
      if (res.status >= 200 && res.status < 300) {
        return res.data;
      }
      throw new HttpException(
        res.data ?? { message: 'Worker result error' },
        res.status,
      );
    } catch (e) {
      if (isAxiosError(e) && !e.response) {
        this.throwFromAxios(e, 'media-job');
      }
      throw e;
    }
  }

  private async performSyncGenerateImageHttp(
    body: Record<string, unknown>,
    safeTimeout: number,
  ): Promise<{ data: unknown; status: number }> {
    return this.performSyncMediaPost('/generate-image', body, safeTimeout);
  }

  private resolveGenerateTimeoutMs(): number {
    const timeout = Number(process.env.MEDIA_WORKER_TIMEOUT_MS ?? 660_000);
    return Number.isFinite(timeout) && timeout > 0 ? timeout : 660_000;
  }

  private extractAsyncWorkerJobId(data: unknown): string | null {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }
    const o = data as Record<string, unknown>;
    const keys = (
      process.env.MEDIA_WORKER_ASYNC_JOB_ID_KEYS?.trim() ||
      'id,job_id,jobId,uuid'
    )
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const pick = (obj: Record<string, unknown>): string | null => {
      for (const key of keys) {
        const raw = obj[key];
        if (typeof raw === 'string' && raw.trim()) {
          return raw.trim();
        }
        if (typeof raw === 'number' && Number.isFinite(raw)) {
          return String(raw);
        }
      }
      return null;
    };

    const direct = pick(o);
    if (direct) {
      return direct;
    }
    const nested = o.job;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return pick(nested as Record<string, unknown>);
    }
    return null;
  }

  private parseRemoteJobStatus(data: unknown): MediaWorkerRemoteStatus {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return 'unknown';
    }
    const o = data as Record<string, unknown>;
    const primary =
      process.env.MEDIA_WORKER_ASYNC_STATUS_JSON_FIELD?.trim() || 'status';
    const raw =
      o[primary] ?? o.status ?? o.state ?? o.job_status ?? o.jobStatus;
    const str =
      typeof raw === 'number'
        ? String(Math.trunc(raw))
        : typeof raw === 'string'
          ? raw.toLowerCase().trim()
          : '';
    if (
      str === 'queued' ||
      str === 'pending' ||
      str === 'waiting' ||
      str === '0'
    ) {
      return 'queued';
    }
    if (
      str === 'running' ||
      str === 'active' ||
      str === 'processing' ||
      str === '1'
    ) {
      return 'running';
    }
    if (
      str === 'completed' ||
      str === 'success' ||
      str === 'done' ||
      str === 'succeeded' ||
      str === '2'
    ) {
      return 'completed';
    }
    if (
      str === 'failed' ||
      str === 'error' ||
      str === 'failure' ||
      str === 'cancelled' ||
      str === 'canceled' ||
      str === '3'
    ) {
      return 'failed';
    }
    return 'unknown';
  }

  /** GET {MEDIA_WORKER_URL}/health — short timeout for connectivity checks. */
  async probeWorkerHealth(): Promise<unknown> {
    const baseUrl = process.env.MEDIA_WORKER_URL?.trim();
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'MEDIA_WORKER_URL is not configured',
      );
    }
    const url = `${baseUrl.replace(/\/$/, '')}/health`;
    const timeout = Number(
      process.env.MEDIA_WORKER_HEALTH_TIMEOUT_MS ?? 10_000,
    );
    const safeTimeout =
      Number.isFinite(timeout) && timeout > 0 ? timeout : 10_000;

    const receivedAt = Date.now();
    this.logStructured('media_worker.health.received', {
      receivedAt: new Date(receivedAt).toISOString(),
      axiosTimeoutMs: safeTimeout,
    });
    const forwardedAt = Date.now();
    this.logStructured('media_worker.health.forwarding', {
      forwardedAt: new Date(forwardedAt).toISOString(),
    });

    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(url, { timeout: safeTimeout }),
      );
      const responseAt = Date.now();
      this.logStructured('media_worker.health.completed', {
        success: true,
        responseReceivedAt: new Date(responseAt).toISOString(),
        totalLatencyMs: responseAt - receivedAt,
        wireLatencyMs: responseAt - forwardedAt,
        upstreamHttpStatus: res.status,
      });
      return res.data;
    } catch (e) {
      const responseAt = Date.now();
      if (isAxiosError(e)) {
        const failureClass = this.classifyAxiosFailure(e);
        this.logStructured('media_worker.health.failed', {
          success: false,
          responseReceivedAt: new Date(responseAt).toISOString(),
          totalLatencyMs: responseAt - receivedAt,
          failureClass,
          upstreamHttpStatus: e.response?.status,
          axiosCode: e.code,
        });
        this.throwFromAxios(e, 'health');
      }
      this.logStructured('media_worker.health.failed', {
        success: false,
        totalLatencyMs: responseAt - receivedAt,
        failureClass: 'unknown',
      });
      throw e;
    }
  }

  /**
   * Non-throwing probe for optional GET /media/worker-debug (gated by MEDIA_WORKER_DEBUG=true).
   * Uses validateStatus to capture upstream HTTP status without throwing.
   */
  async getDebugSnapshot(): Promise<Record<string, unknown>> {
    const raw = process.env.MEDIA_WORKER_URL?.trim();
    if (!raw) {
      return { configured: false, message: 'MEDIA_WORKER_URL unset' };
    }
    let hostname = '';
    let port = '';
    try {
      const u = new URL(raw);
      hostname = u.hostname;
      port =
        u.port ||
        (u.protocol === 'https:' ? '443' : u.protocol === 'http:' ? '80' : '');
    } catch {
      return { configured: true, validUrl: false };
    }
    const url = `${raw.replace(/\/$/, '')}/health`;
    const timeout = Number(
      process.env.MEDIA_WORKER_HEALTH_TIMEOUT_MS ?? 10_000,
    );
    const safeTimeout =
      Number.isFinite(timeout) && timeout > 0 ? timeout : 10_000;
    const t0 = Date.now();
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(url, {
          timeout: safeTimeout,
          validateStatus: () => true,
        }),
      );
      const latencyMs = Date.now() - t0;
      return {
        configured: true,
        validUrl: true,
        targetHost: hostname,
        targetPort: port,
        healthHttpStatus: res.status,
        healthOk: res.status >= 200 && res.status < 300,
        latencyMs,
        healthBody: res.data,
        mediaWorkerMode: resolveMediaWorkerMode(),
      };
    } catch (e) {
      const latencyMs = Date.now() - t0;
      return {
        configured: true,
        validUrl: true,
        targetHost: hostname,
        targetPort: port,
        healthOk: false,
        latencyMs,
        errorMessage: isAxiosError(e) ? e.message : String(e),
        errorCode: isAxiosError(e) ? e.code : undefined,
        mediaWorkerMode: resolveMediaWorkerMode(),
      };
    }
  }

  /** Log metrics only — never prompt text, tokens, or response bodies. */
  private safeBodyMetrics(body: Record<string, unknown>): {
    bodyKeyCount: number;
    promptCharLength: number;
    jsonUtf8Bytes: number;
  } {
    const prompt = body.prompt;
    const promptCharLength = typeof prompt === 'string' ? prompt.length : 0;
    let jsonUtf8Bytes = 0;
    try {
      jsonUtf8Bytes = Buffer.byteLength(JSON.stringify(body), 'utf8');
    } catch {
      jsonUtf8Bytes = -1;
    }
    return {
      bodyKeyCount: Object.keys(body).length,
      promptCharLength,
      jsonUtf8Bytes,
    };
  }

  private logStructured(
    event: string,
    fields: Record<string, string | number | boolean | undefined>,
  ): void {
    this.logger.log(JSON.stringify({ event, ...fields }));
  }

  private workerUpstreamMessage(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') {
      return undefined;
    }
    const o = data as Record<string, unknown>;
    const d = o.detail;
    if (typeof d === 'string' && d.trim()) {
      return d.trim().slice(0, 800);
    }
    if (Array.isArray(d)) {
      const parts: string[] = [];
      for (const item of d) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const rec = item as Record<string, unknown>;
          const msg = rec.msg;
          const loc = rec.loc;
          if (typeof msg === 'string') {
            const locStr = Array.isArray(loc)
              ? loc
                  .filter((x) => typeof x === 'string' || typeof x === 'number')
                  .join('.')
              : '';
            parts.push(locStr ? `${locStr}: ${msg}` : msg);
          }
        }
      }
      if (parts.length > 0) {
        return parts.join('; ').slice(0, 1200);
      }
    }
    if (typeof o.message === 'string' && o.message.trim()) {
      return o.message.trim().slice(0, 800);
    }
    return undefined;
  }

  private classifyAxiosFailure(e: AxiosError): WorkerFailureClass {
    if (
      e.code === 'ECONNABORTED' ||
      e.message.toLowerCase().includes('timeout')
    ) {
      return 'timeout';
    }
    if (e.response?.status !== undefined) {
      return 'upstream_http';
    }
    if (
      e.code === 'ECONNREFUSED' ||
      e.code === 'ENOTFOUND' ||
      e.code === 'ECONNRESET' ||
      e.code === 'ETIMEDOUT'
    ) {
      return 'connection';
    }
    return 'unknown';
  }

  private throwFromAxios(
    e: AxiosError,
    op: 'generate-image' | 'media-job' | 'health',
  ): never {
    if (
      e.code === 'ECONNABORTED' ||
      e.message.toLowerCase().includes('timeout')
    ) {
      throw new GatewayTimeoutException(
        op === 'health'
          ? 'Media worker health check timed out'
          : 'Media worker request timed out',
      );
    }
    const status = e.response?.status;
    const data = e.response?.data;
    if (status !== undefined && status >= 100 && status < 600) {
      if (op === 'media-job') {
        const distilled = this.workerUpstreamMessage(data);
        if (status >= 500) {
          throw new BadGatewayException(
            distilled ?? `Media worker returned HTTP ${status}`,
          );
        }
        if (status === 422) {
          throw new UnprocessableEntityException(
            distilled ??
              'Media worker rejected the request (validation failed)',
          );
        }
        if (status >= 400) {
          throw new BadRequestException(
            distilled ?? `Media worker rejected the request (HTTP ${status})`,
          );
        }
      }
      throw new HttpException(data ?? { message: e.message }, status);
    }
    const net = e.code ?? e.message;
    throw new BadGatewayException(`Cannot reach media worker: ${net}`);
  }
}
