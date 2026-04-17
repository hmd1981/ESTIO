import { Injectable } from '@nestjs/common';

type WindowKey = string;

/** In-memory sliding-window limits (per process). Scale-out: replace with Redis. */
@Injectable()
export class AskEstioAiRateLimitService {
  private readonly sessionWindows = new Map<WindowKey, number[]>();
  private readonly ipWindows = new Map<WindowKey, number[]>();
  private readonly burstWindows = new Map<WindowKey, number[]>();

  /** @returns null if allowed, or short reason code */
  check(params: {
    sessionId: string;
    ipKey: string;
    now?: number;
  }): 'session_quota' | 'ip_quota' | 'burst' | null {
    const now = params.now ?? Date.now();
    const sessionKey = `s:${params.sessionId.slice(0, 80)}`;
    const ipKey = `i:${params.ipKey}`;

    if (this.countInWindow(this.burstWindows, ipKey, now, 10_000) >= 3) {
      return 'burst';
    }
    this.pushTimestamp(this.burstWindows, ipKey, now, 10_000);

    if (this.countInWindow(this.sessionWindows, sessionKey, now, 600_000) >= 8) {
      return 'session_quota';
    }
    this.pushTimestamp(this.sessionWindows, sessionKey, now, 600_000);

    if (this.countInWindow(this.ipWindows, ipKey, now, 3_600_000) >= 20) {
      return 'ip_quota';
    }
    this.pushTimestamp(this.ipWindows, ipKey, now, 3_600_000);

    return null;
  }

  private countInWindow(
    map: Map<string, number[]>,
    key: string,
    now: number,
    windowMs: number,
  ): number {
    const arr = map.get(key) ?? [];
    const cutoff = now - windowMs;
    const kept = arr.filter((t) => t > cutoff);
    map.set(key, kept);
    return kept.length;
  }

  private pushTimestamp(
    map: Map<string, number[]>,
    key: string,
    now: number,
    windowMs: number,
  ): void {
    const arr = map.get(key) ?? [];
    const cutoff = now - windowMs;
    const kept = arr.filter((t) => t > cutoff);
    kept.push(now);
    map.set(key, kept);
  }
}
