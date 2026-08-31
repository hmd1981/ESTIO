/**
 * Multiple GPU workers (VM 900, 900-1, 900-2, …): comma-separated `MEDIA_WORKER_URLS`.
 * Each media job stores the chosen base URL so async submit + poll + result hit the same worker.
 *
 * If only `MEDIA_WORKER_URL` is set, behaviour matches the legacy single-worker setup.
 */

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

/** Normalize and validate absolute http(s) base URLs. */
export function parseMediaWorkerBaseUrlList(): string[] {
  const multi = process.env.MEDIA_WORKER_URLS?.trim();
  if (multi) {
    const out: string[] = [];
    for (const part of multi.split(',')) {
      const raw = part.trim();
      if (!raw) continue;
      try {
        const u = new URL(raw);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          continue;
        }
        out.push(trimTrailingSlashes(raw));
      } catch {
        /* skip invalid */
      }
    }
    return out;
  }
  const single = process.env.MEDIA_WORKER_URL?.trim();
  if (!single) {
    return [];
  }
  try {
    const u = new URL(single);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return [];
    }
    return [trimTrailingSlashes(single)];
  } catch {
    return [];
  }
}

let roundRobin = 0;

/** Round-robin across `parseMediaWorkerBaseUrlList()` (at least one URL required). */
export function pickWorkerBaseUrlForNewJob(): string {
  const urls = parseMediaWorkerBaseUrlList();
  if (urls.length === 0) {
    throw new Error('MEDIA_WORKER_URL or MEDIA_WORKER_URLS must be configured');
  }
  const idx = roundRobin % urls.length;
  roundRobin += 1;
  return urls[idx];
}

export function hostnameFromWorkerBaseUrl(baseUrl: string): string | null {
  try {
    return new URL(baseUrl).hostname || null;
  } catch {
    return null;
  }
}
