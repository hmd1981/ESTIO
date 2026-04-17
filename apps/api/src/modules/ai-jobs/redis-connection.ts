import type { ConnectionOptions } from 'bullmq';

/**
 * Returns null to use the in-process memory queue (no Redis).
 * BullMQ is only enabled when REDIS_URL is set (or set AI_JOBS_USE_MEMORY=true to force memory).
 */
export function bullmqConnectionOptions(): ConnectionOptions | null {
  if (process.env.AI_JOBS_USE_MEMORY === 'true') {
    return null;
  }
  const url = process.env.REDIS_URL?.trim();
  if (url) {
    return { url };
  }
  return null;
}
