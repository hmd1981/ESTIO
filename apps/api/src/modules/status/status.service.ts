import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface GpuStatusSnapshot {
  online: boolean;
  lastCheckedAt: string;
  latencyMs: number | null;
  reason: string | null;
}

const DEFAULT_TTL_MS = 10_000;
const MIN_TTL_MS = 1_000;
const MAX_TTL_MS = 60_000;
const DEFAULT_PROBE_TIMEOUT_MS = 5_000;

function isAxiosError(e: unknown): e is AxiosError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'isAxiosError' in e &&
    (e as AxiosError).isAxiosError === true
  );
}

/**
 * Cached GPU worker availability probe used by `GET /status` and the API-side
 * fast-fail precheck on `POST /media/jobs` and `POST /media/generate-image`.
 *
 * The probe issues `GET ${MEDIA_WORKER_URL}/health` directly (it does not depend
 * on `MediaWorkerService`, to keep `StatusModule` free of any back-reference to
 * `MediaModule`). Result is held in memory for `STATUS_PROBE_TTL_MS` (default
 * 10s) so a busy front page does not fan out one upstream call per visitor.
 */
@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  private cache: GpuStatusSnapshot | null = null;
  private cacheExpiresAt = 0;
  private inflight: Promise<GpuStatusSnapshot> | null = null;

  constructor(private readonly http: HttpService) {}

  private get ttlMs(): number {
    const raw = Number(process.env.STATUS_PROBE_TTL_MS ?? DEFAULT_TTL_MS);
    if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TTL_MS;
    return Math.min(MAX_TTL_MS, Math.max(MIN_TTL_MS, Math.trunc(raw)));
  }

  private get probeTimeoutMs(): number {
    const raw = Number(
      process.env.MEDIA_WORKER_HEALTH_TIMEOUT_MS ?? DEFAULT_PROBE_TIMEOUT_MS,
    );
    if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PROBE_TIMEOUT_MS;
    return Math.trunc(raw);
  }

  /** Returns the current cached snapshot, refreshing it if stale or `force`. */
  async getStatus(force = false): Promise<GpuStatusSnapshot> {
    const now = Date.now();
    if (!force && this.cache && now < this.cacheExpiresAt) {
      return this.cache;
    }
    if (this.inflight) {
      return this.inflight;
    }
    this.inflight = this.refresh().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  /**
   * Synchronous gating helper for submit handlers. Returns the cached value
   * when fresh; otherwise kicks off a refresh in the background and returns
   * the last known value (or `true` on first boot to avoid a cold-start
   * false-negative on the very first request after deploy). Never blocks.
   */
  isWorkerOnlineFast(): boolean {
    const now = Date.now();
    if (this.cache && now < this.cacheExpiresAt) {
      return this.cache.online;
    }
    void this.getStatus().catch(() => undefined);
    return this.cache ? this.cache.online : true;
  }

  /** Last cached reason (for 503 response bodies). Null if never probed. */
  lastReason(): string | null {
    return this.cache?.reason ?? null;
  }

  private async refresh(): Promise<GpuStatusSnapshot> {
    const startedAt = Date.now();
    const baseUrl = process.env.MEDIA_WORKER_URL?.trim();
    if (!baseUrl) {
      const snapshot: GpuStatusSnapshot = {
        online: false,
        lastCheckedAt: new Date().toISOString(),
        latencyMs: 0,
        reason: 'unconfigured',
      };
      this.commit(snapshot);
      return snapshot;
    }
    const url = `${baseUrl.replace(/\/+$/, '')}/health`;
    try {
      const res = await firstValueFrom(
        this.http.get<unknown>(url, {
          timeout: this.probeTimeoutMs,
          validateStatus: () => true,
        }),
      );
      const latencyMs = Date.now() - startedAt;
      if (res.status >= 200 && res.status < 300) {
        const snapshot: GpuStatusSnapshot = {
          online: true,
          lastCheckedAt: new Date().toISOString(),
          latencyMs,
          reason: null,
        };
        this.commit(snapshot);
        return snapshot;
      }
      const snapshot: GpuStatusSnapshot = {
        online: false,
        lastCheckedAt: new Date().toISOString(),
        latencyMs,
        reason: `upstream_http_${res.status}`,
      };
      this.commit(snapshot);
      this.logger.warn(
        `gpu worker unhealthy: upstream_http_${res.status} (latency=${latencyMs}ms)`,
      );
      return snapshot;
    } catch (e) {
      const reason = this.classifyReason(e);
      const snapshot: GpuStatusSnapshot = {
        online: false,
        lastCheckedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        reason,
      };
      this.commit(snapshot);
      this.logger.warn(
        `gpu worker unhealthy: ${reason} (latency=${snapshot.latencyMs}ms)`,
      );
      return snapshot;
    }
  }

  private commit(snapshot: GpuStatusSnapshot): void {
    this.cache = snapshot;
    this.cacheExpiresAt = Date.now() + this.ttlMs;
  }

  private classifyReason(e: unknown): string {
    if (isAxiosError(e)) {
      if (
        e.code === 'ECONNABORTED' ||
        (typeof e.message === 'string' && e.message.toLowerCase().includes('timeout'))
      ) {
        return 'timeout';
      }
      if (e.code === 'ECONNREFUSED' || e.code === 'ECONNRESET') {
        return 'unreachable';
      }
      if (e.code === 'ENOTFOUND') {
        return 'dns';
      }
      return e.code ? `network_${e.code.toLowerCase()}` : 'unreachable';
    }
    return 'unreachable';
  }
}
