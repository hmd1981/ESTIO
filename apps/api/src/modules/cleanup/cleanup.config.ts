import { join } from 'node:path';

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/** Relative to `process.cwd()` — only these upload subdirs may be scanned for cleanup. */
export const CLEANUP_ALLOWLISTED_UPLOAD_SUBDIRS = [
  'uploads/tmp',
  'uploads/.temp',
  'uploads/previews',
  'uploads/samples',
] as const;

export const CLEANUP_ALLOWLISTED_LOG_DIR = 'logs';

export type CleanupConfig = {
  tempFileHours: number;
  orphanAssetHours: number;
  stuckJobHours: number;
  authTokenHours: number;
  paymentPendingDays: number;
  logRetentionDays: number;
  analyticsRetentionDays: number;
  uploadsRoot: string;
  allowlistedUploadAbsDirs: string[];
  logsDir: string;
};

export function loadCleanupConfig(cwd = process.cwd()): CleanupConfig {
  const extra = (process.env.CLEANUP_EXTRA_TEMP_DIRS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((p) => p.startsWith('uploads/'));

  const relDirs = [...CLEANUP_ALLOWLISTED_UPLOAD_SUBDIRS, ...extra];

  return {
    tempFileHours: envInt('CLEANUP_TEMP_FILE_HOURS', 24),
    orphanAssetHours: envInt('CLEANUP_ORPHAN_ASSET_HOURS', 48),
    stuckJobHours: envInt('CLEANUP_STUCK_JOB_HOURS', 6),
    authTokenHours: envInt('CLEANUP_AUTH_TOKEN_HOURS', 24),
    paymentPendingDays: envInt('CLEANUP_PAYMENT_PENDING_DAYS', 7),
    logRetentionDays: envInt('CLEANUP_LOG_RETENTION_DAYS', 14),
    analyticsRetentionDays: envInt('CLEANUP_ANALYTICS_RETENTION_DAYS', 90),
    uploadsRoot: join(cwd, 'uploads'),
    allowlistedUploadAbsDirs: relDirs.map((d) => join(cwd, d)),
    logsDir: join(cwd, CLEANUP_ALLOWLISTED_LOG_DIR),
  };
}
