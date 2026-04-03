export type StudioStatsDataSource = 'rollup' | 'raw';

export type StudioSamplePolicyBlock = {
  minEventsForOptimization: number;
  minHoverImpressions: number;
  observedTotalEvents: number;
  observedHoverImpressions: number;
  sufficientForOptimization: boolean;
  sufficientForHoverReliability: boolean;
  fallbacksApplied: string[];
};

export type StudioStatsSummaryV1 = {
  /** Frozen ingest / stats contract version. */
  schemaVersion: 1;
  period: { days: number; fromIso: string; toIso: string };
  dataSource: StudioStatsDataSource;
  sample: StudioSamplePolicyBlock;
  byIntent: Array<{
    intent: string;
    total: number;
    clicks: number;
    ctr: number;
  }>;
  byDevice: Array<{ device: string; count: number }>;
  byEvent: Array<{ eventType: string; count: number }>;
  /** Null when `dataSource === 'rollup'` — session-uniques cannot be summed across buckets without bias. */
  funnelSessions: Array<{ stage: string; sessions: number }> | null;
  funnelNote: string | null;
};
