/** Per-category counters emitted in structured cleanup logs. */
export type CleanupCategoryCounts = {
  tempFilesDeleted: number;
  orphanAssetsDeleted: number;
  stuckJobsFailed: number;
  authTokensDeleted: number;
  /** Stateless JWT sessions have no DB rows; IntakeSession expiry counted separately. */
  portalSessionsExpired: number;
  paymentsMarkedExpired: number;
  logFilesRotated: number;
  analyticsEventsDeleted: number;
  askEventsDeleted: number;
  intakeSessionsDeleted: number;
  automationRunsDeleted: number;
  redisQueueJobsCleaned: number;
};

export type CleanupReport = {
  dryRun: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  counts: CleanupCategoryCounts;
  /** Human-readable audit trail (paths, ids) — capped per category in dry-run. */
  details: string[];
  skipped: string[];
};

export type CleanupRunOptions = {
  dryRun?: boolean;
};
