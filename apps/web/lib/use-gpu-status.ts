"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Client-side GPU/system availability hook.
 *
 * Polls `GET /api/status` (which proxies the API's cached worker-health probe).
 * Default cadence: 30s when healthy, exponential backoff up to 120s after a
 * fetch error so we don't hammer the server when the BFF itself is down.
 *
 * Behaviour:
 * - First snapshot: `online === null` (use as "loading"). Components should NOT
 *   disable CTAs while loading; only disable when `online === false`.
 * - Network failures count as `online: false` after the first failed fetch.
 * - Visibility-aware: the loop pauses when the tab is hidden and resumes
 *   immediately on focus.
 */

export type GpuStatusSnapshot = {
  online: boolean;
  lastCheckedAt: string;
  latencyMs: number | null;
  reason: string | null;
};

export type UseGpuStatusOptions = {
  /** Polling interval (ms) when last check was healthy. Default 30000. */
  intervalMs?: number;
  /** Initial back-off after a failed fetch. Default 5000. Doubles up to maxBackoffMs. */
  initialBackoffMs?: number;
  /** Hard cap on back-off. Default 120000. */
  maxBackoffMs?: number;
};

export type UseGpuStatusResult = {
  /** Latest snapshot, or null until the first fetch resolves. */
  status: GpuStatusSnapshot | null;
  /** Convenience: `true` when last probe said online. `null` while loading. */
  online: boolean | null;
  /** True until the first fetch resolves (success or failure). */
  loading: boolean;
  /** Force an immediate refresh (also resets back-off). */
  refresh: () => void;
};

const DEFAULT_INTERVAL_MS = 30_000;
const DEFAULT_INITIAL_BACKOFF_MS = 5_000;
const DEFAULT_MAX_BACKOFF_MS = 120_000;

export function useGpuStatus(
  opts: UseGpuStatusOptions = {},
): UseGpuStatusResult {
  const intervalMs = opts.intervalMs ?? DEFAULT_INTERVAL_MS;
  const initialBackoffMs = opts.initialBackoffMs ?? DEFAULT_INITIAL_BACKOFF_MS;
  const maxBackoffMs = opts.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS;

  const [status, setStatus] = useState<GpuStatusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const mountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef<number>(initialBackoffMs);
  const inflightRef = useRef<AbortController | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const schedule = useCallback(
    (delayMs: number) => {
      clearTimer();
      timerRef.current = setTimeout(() => {
        void doFetch();
      }, delayMs);
    },
    // doFetch defined below; intentionally omitted from deps to avoid a cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearTimer],
  );

  const doFetch = useCallback(async () => {
    if (!mountedRef.current) return;
    if (typeof document !== "undefined" && document.hidden) {
      schedule(intervalMs);
      return;
    }
    inflightRef.current?.abort();
    const ac = new AbortController();
    inflightRef.current = ac;
    try {
      const res = await fetch("/api/status", {
        method: "GET",
        cache: "no-store",
        signal: ac.signal,
      });
      const text = await res.text();
      let parsed: { gpu?: GpuStatusSnapshot } = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = {};
      }
      if (!mountedRef.current) return;
      const snap: GpuStatusSnapshot | null = parsed.gpu ?? null;
      if (snap) {
        setStatus(snap);
        if (snap.online) {
          backoffRef.current = initialBackoffMs;
        } else {
          backoffRef.current = Math.min(
            maxBackoffMs,
            Math.max(intervalMs * 2, backoffRef.current * 2),
          );
        }
      } else {
        const reason = `bff_http_${res.status}`;
        setStatus({
          online: false,
          lastCheckedAt: new Date().toISOString(),
          latencyMs: null,
          reason,
        });
        backoffRef.current = Math.min(
          maxBackoffMs,
          Math.max(intervalMs * 2, backoffRef.current * 2),
        );
      }
      setLoading(false);
      schedule(snap?.online === false || !snap ? backoffRef.current : intervalMs);
    } catch (e) {
      if (!mountedRef.current) return;
      if ((e as { name?: string })?.name === "AbortError") return;
      setStatus({
        online: false,
        lastCheckedAt: new Date().toISOString(),
        latencyMs: null,
        reason: "fetch_error",
      });
      setLoading(false);
      const next = Math.min(maxBackoffMs, backoffRef.current * 2);
      backoffRef.current = next;
      schedule(next);
    }
  }, [initialBackoffMs, intervalMs, maxBackoffMs, schedule]);

  const refresh = useCallback(() => {
    backoffRef.current = initialBackoffMs;
    void doFetch();
  }, [doFetch, initialBackoffMs]);

  useEffect(() => {
    mountedRef.current = true;
    void doFetch();
    const onVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        refresh();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }
    return () => {
      mountedRef.current = false;
      clearTimer();
      inflightRef.current?.abort();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    online: status ? status.online : null,
    loading,
    refresh,
  };
}
