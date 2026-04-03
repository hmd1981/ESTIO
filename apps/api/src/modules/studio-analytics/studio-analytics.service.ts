import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { IngestEventsDto } from './dto/ingest-events.dto';
import {
  STUDIO_MIN_EVENTS_FOR_OPTIMIZATION,
  STUDIO_MIN_HOVER_IMPRESSIONS,
  STUDIO_RAW_EVENT_SCHEMA_VERSION,
  canonicalStudioEventType,
} from './studio-analytics.constants';
import type { StudioStatsSummaryV1 } from './studio-analytics.types';

/* ── Types ── */

type IntentScore = {
  intent: string;
  impressions: number;
  clicks: number;
  hoverImpressions: number;
  hoverClicks: number;
  bayesian: number;
  conversionScore: number;
};

type ConflictInfo = {
  detected: boolean;
  topInterest: string | null;
  topConversion: string | null;
  recommendation: string | null;
};

export type OptimizationResult = {
  schemaVersion: typeof STUDIO_RAW_EVENT_SCHEMA_VERSION;
  recommendedIntent: string | null;
  scores: IntentScore[];
  hoverReliability: number;
  hoverThresholdMs: number;
  conflict: ConflictInfo;
  context: { device: string | null; region: string | null };
  totalEvents: number;
  insufficientSample: boolean;
  samplePolicy: {
    minEventsForOptimization: number;
    minHoverImpressions: number;
    observedTotalEvents: number;
    observedHoverImpressions: number;
    fallbacksApplied: string[];
  };
};

/* ── Raw SQL result row ── */

type AggRow = {
  intent: string;
  impressions: bigint;
  clicks: bigint;
  hover_impressions: bigint;
  hover_clicks: bigint;
};

@Injectable()
export class StudioAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /* ────────────────────────────────────────────────────────
     Ingest: batch-insert events
     ──────────────────────────────────────────────────────── */

  async ingest(
    dto: IngestEventsDto,
    device: string | null,
    region: string | null,
  ): Promise<number> {
    const values = dto.events.flatMap((ev) => {
      const canonical = canonicalStudioEventType(ev.type);
      if (!canonical) return [];
      const ts = new Date(ev.ts).toISOString();
      const esc = (v: string | null | undefined) =>
        v == null ? 'NULL' : `'${v.replace(/'/g, "''")}'`;
      return [
        `(
        gen_random_uuid(),
        ${esc(dto.sessionId)}, ${esc(canonical)}, ${esc(ev.intent)}, ${esc(ev.source)},
        ${ev.quality ?? 'NULL'}, ${esc(ev.ctaPosition)},
        ${ev.clicked ? 'TRUE' : 'FALSE'}, FALSE,
        ${ev.hoverDuration ?? 'NULL'}, ${esc(ev.exitGoal)},
        ${esc(region)}, ${esc(device)}, ${esc(dto.locale)},
        '${ts}'::timestamptz
      )`,
      ];
    });

    if (values.length === 0) return 0;

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO "StudioEvent"
        ("id","sessionId","eventType","intent","source","quality","ctaPosition",
         "clicked","converted","hoverDuration","exitGoal","region","device","locale","createdAt")
      VALUES ${values.join(',')}
    `);
    return values.length;
  }

  /* ────────────────────────────────────────────────────────
     Optimize: Bayesian scoring + conflict detection
     ──────────────────────────────────────────────────────── */

  async optimize(
    device?: string,
    region?: string,
    locale?: string,
  ): Promise<OptimizationResult> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    const filters: string[] = [
      `"intent" IS NOT NULL`,
      `"createdAt" > '${thirtyDaysAgo.toISOString()}'`,
    ];
    if (device) filters.push(`"device" = '${device}'`);
    if (region) filters.push(`"region" = '${region}'`);
    if (locale) filters.push(`"locale" = '${locale}'`);

    const where = filters.join(' AND ');

    const rows = await this.prisma.$queryRawUnsafe<AggRow[]>(`
      SELECT
        "intent",
        COUNT(*) FILTER (WHERE "eventType" = 'intent_selected')            AS impressions,
        COUNT(*) FILTER (WHERE "eventType" = 'cta_clicked')                AS clicks,
        COUNT(*) FILTER (WHERE "eventType" = 'intent_selected'
                           AND "source" = 'hover')                         AS hover_impressions,
        COUNT(*) FILTER (WHERE "eventType" = 'cta_clicked'
                           AND "source" = 'hover')                         AS hover_clicks
      FROM "StudioEvent"
      WHERE ${where}
      GROUP BY "intent"
    `);

    const totalResult = await this.prisma.$queryRawUnsafe<[{ cnt: bigint }]>(`
      SELECT COUNT(*) AS cnt FROM "StudioEvent"
      WHERE "createdAt" > '${thirtyDaysAgo.toISOString()}'
    `);
    const totalEvents = Number(totalResult[0]?.cnt ?? 0);

    /* ── Bayesian scoring: (clicks + α) / (impressions + α + β) ── */
    const scores: IntentScore[] = rows.map((r) => {
      const imp = Number(r.impressions);
      const clk = Number(r.clicks);
      const hImp = Number(r.hover_impressions);
      const hClk = Number(r.hover_clicks);

      return {
        intent: r.intent,
        impressions: imp,
        clicks: clk,
        hoverImpressions: hImp,
        hoverClicks: hClk,
        bayesian: (clk + 1) / (imp + 2),
        conversionScore: clk > 0 ? (clk + 1) / (imp + 2) : 0,
      };
    });

    scores.sort((a, b) => b.bayesian - a.bayesian);

    /* ── Interest vs Conversion conflict detection ── */
    const topInterest =
      [...scores].sort((a, b) => b.impressions - a.impressions)[0] ?? null;
    const topConversion =
      [...scores].sort((a, b) => b.bayesian - a.bayesian)[0] ?? null;

    const conflictDetected =
      topInterest &&
      topConversion &&
      topInterest.intent !== topConversion.intent;

    const conflict: ConflictInfo = {
      detected: !!conflictDetected,
      topInterest: topInterest?.intent ?? null,
      topConversion: topConversion?.intent ?? null,
      recommendation: this.resolveConflict(topInterest, topConversion),
    };

    /* ── Hover reliability ── */
    const totalHoverImp = scores.reduce((s, r) => s + r.hoverImpressions, 0);
    const totalHoverClk = scores.reduce((s, r) => s + r.hoverClicks, 0);
    const hoverReliability =
      totalHoverImp >= STUDIO_MIN_HOVER_IMPRESSIONS
        ? totalHoverClk / totalHoverImp
        : 0;

    let hoverThresholdMs = 3000;
    if (totalHoverImp >= STUDIO_MIN_HOVER_IMPRESSIONS) {
      if (hoverReliability < 0.05) hoverThresholdMs = 8000;
      else if (hoverReliability < 0.15) hoverThresholdMs = 5000;
    }

    const fallbacksApplied: string[] = [];
    if (totalEvents < STUDIO_MIN_EVENTS_FOR_OPTIMIZATION) {
      fallbacksApplied.push('below_min_events_recommendation_suppressed');
    }
    if (totalHoverImp < STUDIO_MIN_HOVER_IMPRESSIONS) {
      fallbacksApplied.push('hover_reliability_defaulted');
    }

    /* ── Recommended intent (null when sample below threshold) ── */
    let recommendedIntent: string | null =
      conflict.recommendation ?? scores[0]?.intent ?? null;
    if (totalEvents < STUDIO_MIN_EVENTS_FOR_OPTIMIZATION) {
      recommendedIntent = null;
    }

    return {
      schemaVersion: STUDIO_RAW_EVENT_SCHEMA_VERSION,
      recommendedIntent,
      scores,
      hoverReliability: Math.round(hoverReliability * 1000) / 1000,
      hoverThresholdMs,
      conflict,
      context: { device: device ?? null, region: region ?? null },
      totalEvents,
      insufficientSample: totalEvents < STUDIO_MIN_EVENTS_FOR_OPTIMIZATION,
      samplePolicy: {
        minEventsForOptimization: STUDIO_MIN_EVENTS_FOR_OPTIMIZATION,
        minHoverImpressions: STUDIO_MIN_HOVER_IMPRESSIONS,
        observedTotalEvents: totalEvents,
        observedHoverImpressions: totalHoverImp,
        fallbacksApplied,
      },
    };
  }

  /* ────────────────────────────────────────────────────────
     Event → Action: resolve interest ≠ conversion
     ──────────────────────────────────────────────────────── */

  /**
   * When interest (volume) and conversion (CTR) disagree:
   *   final = 0.3 × interest_score + 0.7 × conversion_score
   * Conversion matters more than raw interest.
   */
  private resolveConflict(
    topInterest: IntentScore | null,
    topConversion: IntentScore | null,
  ): string | null {
    if (!topInterest || !topConversion) return null;
    if (topInterest.intent === topConversion.intent)
      return topInterest.intent;

    const interestNorm =
      topInterest.impressions /
      Math.max(topInterest.impressions, topConversion.impressions, 1);
    const conversionNorm =
      topConversion.bayesian /
      Math.max(topInterest.bayesian, topConversion.bayesian, 0.001);

    const interestWeighted = 0.3 * interestNorm + 0.7 * topInterest.bayesian;
    const conversionWeighted =
      0.3 *
        (topConversion.impressions /
          Math.max(topInterest.impressions, topConversion.impressions, 1)) +
      0.7 * conversionNorm;

    return conversionWeighted >= interestWeighted
      ? topConversion.intent
      : topInterest.intent;
  }

  /* ── Admin: formal stats (rollup when present, else raw) ── */

  async getStats(days = 30): Promise<StudioStatsSummaryV1> {
    return this.getStatsSummaryV1(days);
  }

  async getStatsSummaryV1(days = 30): Promise<StudioStatsSummaryV1> {
    const periodDays = Math.min(366, Math.max(1, Math.floor(Number(days)) || 30));
    const to = new Date();
    const since = new Date(to.getTime() - periodDays * 86_400_000);
    const sinceStr = since.toISOString();
    const sinceDay = sinceStr.slice(0, 10);
    const toDay = to.toISOString().slice(0, 10);

    const [rawTotal, hoverImp] = await Promise.all([
      this.prisma.studioEvent.count({ where: { createdAt: { gte: since } } }),
      this.prisma.studioEvent.count({
        where: {
          createdAt: { gte: since },
          eventType: 'intent_selected',
          source: 'hover',
        },
      }),
    ]);

    const sampleFallbacks: string[] = [];
    if (rawTotal < STUDIO_MIN_EVENTS_FOR_OPTIMIZATION) {
      sampleFallbacks.push('below_min_events');
    }
    if (hoverImp < STUDIO_MIN_HOVER_IMPRESSIONS) {
      sampleFallbacks.push('hover_sample_sparse');
    }

    const sample = {
      minEventsForOptimization: STUDIO_MIN_EVENTS_FOR_OPTIMIZATION,
      minHoverImpressions: STUDIO_MIN_HOVER_IMPRESSIONS,
      observedTotalEvents: rawTotal,
      observedHoverImpressions: hoverImp,
      sufficientForOptimization: rawTotal >= STUDIO_MIN_EVENTS_FOR_OPTIMIZATION,
      sufficientForHoverReliability: hoverImp >= STUDIO_MIN_HOVER_IMPRESSIONS,
      fallbacksApplied: sampleFallbacks,
    };

    const rollAgg = await this.prisma.studioAnalyticsRollupDay.aggregate({
      where: {
        day: {
          gte: new Date(`${sinceDay}T00:00:00.000Z`),
          lte: new Date(`${toDay}T00:00:00.000Z`),
        },
      },
      _sum: { eventCount: true },
    });
    const rollupTotal = Number(rollAgg._sum.eventCount ?? 0);

    type IntentRow = { intent: string; total: bigint; clicks: bigint };
    type DeviceRow = { device: string; cnt: bigint };
    type EventRow = { event_type: string; cnt: bigint };
    type FunnelRow = { stage: string; cnt: bigint };

    let dataSource: StudioStatsSummaryV1['dataSource'] = 'raw';
    let byIntent: StudioStatsSummaryV1['byIntent'];
    let byDevice: StudioStatsSummaryV1['byDevice'];
    let byEvent: StudioStatsSummaryV1['byEvent'];
    let funnelSessions: StudioStatsSummaryV1['funnelSessions'] = null;
    let funnelNote: string | null = null;

    if (rollupTotal > 0) {
      dataSource = 'rollup';
      funnelNote =
        'Funnel uses distinct sessions per stage; not summed from daily rollups (would bias counts). Query raw window if needed.';
      const [bi, bd, be] = await Promise.all([
        this.prisma.$queryRawUnsafe<IntentRow[]>(`
          SELECT r.intent AS intent,
                 SUM(r."eventCount") AS total,
                 SUM(CASE WHEN r."eventType" = 'cta_clicked' THEN r."eventCount" ELSE 0 END) AS clicks
          FROM "StudioAnalyticsRollupDay" r
          WHERE r.day >= '${sinceDay}'::date AND r.day <= '${toDay}'::date AND r.intent <> ''
          GROUP BY r.intent ORDER BY total DESC
        `),
        this.prisma.$queryRawUnsafe<DeviceRow[]>(`
          SELECT r.device AS device, SUM(r."eventCount") AS cnt
          FROM "StudioAnalyticsRollupDay" r
          WHERE r.day >= '${sinceDay}'::date AND r.day <= '${toDay}'::date AND r.device <> ''
          GROUP BY r.device ORDER BY cnt DESC
        `),
        this.prisma.$queryRawUnsafe<EventRow[]>(`
          SELECT r."eventType" AS event_type, SUM(r."eventCount") AS cnt
          FROM "StudioAnalyticsRollupDay" r
          WHERE r.day >= '${sinceDay}'::date AND r.day <= '${toDay}'::date
          GROUP BY r."eventType" ORDER BY cnt DESC
        `),
      ]);
      byIntent = bi.map((r) => ({
        intent: r.intent,
        total: Number(r.total),
        clicks: Number(r.clicks),
        ctr:
          Number(r.total) > 0
            ? Math.round((Number(r.clicks) / Number(r.total)) * 10000) / 100
            : 0,
      }));
      byDevice = bd.map((r) => ({
        device: r.device,
        count: Number(r.cnt),
      }));
      byEvent = be.map((r) => ({
        eventType: r.event_type,
        count: Number(r.cnt),
      }));
    } else {
      const [byIntentRows, byDeviceRows, byEventRows, funnel] =
        await Promise.all([
          this.prisma.$queryRawUnsafe<IntentRow[]>(`
        SELECT "intent",
               COUNT(*)                                                 AS total,
               COUNT(*) FILTER (WHERE "eventType" = 'cta_clicked')      AS clicks
        FROM "StudioEvent"
        WHERE "intent" IS NOT NULL AND "createdAt" > '${sinceStr}'
        GROUP BY "intent" ORDER BY total DESC
      `),

          this.prisma.$queryRawUnsafe<DeviceRow[]>(`
        SELECT "device", COUNT(*) AS cnt
        FROM "StudioEvent"
        WHERE "createdAt" > '${sinceStr}' AND "device" IS NOT NULL
        GROUP BY "device" ORDER BY cnt DESC
      `),

          this.prisma.$queryRawUnsafe<EventRow[]>(`
        SELECT "eventType" AS event_type, COUNT(*) AS cnt
        FROM "StudioEvent"
        WHERE "createdAt" > '${sinceStr}'
        GROUP BY "eventType" ORDER BY cnt DESC
      `),

          this.prisma.$queryRawUnsafe<FunnelRow[]>(`
        SELECT "eventType" AS stage, COUNT(DISTINCT "sessionId") AS cnt
        FROM "StudioEvent"
        WHERE "createdAt" > '${sinceStr}'
          AND "eventType" IN ('page_view','intent_selected','cta_clicked','exit_input_submitted')
        GROUP BY "eventType"
        ORDER BY cnt DESC
      `),
        ]);
      byIntent = byIntentRows.map((r) => ({
        intent: r.intent,
        total: Number(r.total),
        clicks: Number(r.clicks),
        ctr:
          Number(r.total) > 0
            ? Math.round((Number(r.clicks) / Number(r.total)) * 10000) / 100
            : 0,
      }));
      byDevice = byDeviceRows.map((r) => ({
        device: r.device,
        count: Number(r.cnt),
      }));
      byEvent = byEventRows.map((r) => ({
        eventType: r.event_type,
        count: Number(r.cnt),
      }));
      funnelSessions = funnel.map((r) => ({
        stage: r.stage,
        sessions: Number(r.cnt),
      }));
    }

    return {
      schemaVersion: STUDIO_RAW_EVENT_SCHEMA_VERSION,
      period: {
        days: periodDays,
        fromIso: sinceStr,
        toIso: to.toISOString(),
      },
      dataSource,
      sample,
      byIntent,
      byDevice,
      byEvent,
      funnelSessions,
      funnelNote,
    };
  }
}
