import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

function utcMidnight(d: Date): string {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

@Injectable()
export class StudioAnalyticsAggregationService {
  private readonly log = new Logger(StudioAnalyticsAggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Replace all rollup rows for the UTC calendar day. */
  async rebuildDayUtc(day: Date): Promise<void> {
    const dayStr = utcMidnight(day);
    const start = new Date(`${dayStr}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 86_400_000);
    const startIso = start.toISOString();
    const endIso = end.toISOString();

    await this.prisma.$executeRawUnsafe(
      `DELETE FROM "StudioAnalyticsRollupDay" WHERE "day" = '${dayStr}'::date`,
    );

    await this.prisma.$executeRawUnsafe(`
      INSERT INTO "StudioAnalyticsRollupDay"
        ("id","day","locale","device","eventType","intent","source","eventCount","clickCount","sessionCount")
      SELECT
        gen_random_uuid(),
        sub."day",
        sub."locale",
        sub."device",
        sub."eventType",
        sub."intent",
        sub."source",
        sub."eventCount",
        sub."clickCount",
        sub."sessionCount"
      FROM (
        SELECT
          ("createdAt" AT TIME ZONE 'UTC')::date AS day,
          COALESCE("locale", '') AS locale,
          COALESCE("device", '') AS device,
          "eventType",
          COALESCE("intent", '') AS intent,
          COALESCE("source", '') AS source,
          COUNT(*)::int AS "eventCount",
          COUNT(*) FILTER (WHERE "eventType" = 'cta_clicked')::int AS "clickCount",
          COUNT(DISTINCT "sessionId")::int AS "sessionCount"
        FROM "StudioEvent"
        WHERE "createdAt" >= '${startIso}'::timestamptz AND "createdAt" < '${endIso}'::timestamptz
        GROUP BY
          ("createdAt" AT TIME ZONE 'UTC')::date,
          COALESCE("locale", ''),
          COALESCE("device", ''),
          "eventType",
          COALESCE("intent", ''),
          COALESCE("source", '')
      ) AS sub
    `);

    const n = await this.prisma.studioAnalyticsRollupDay.count({
      where: { day: start },
    });
    this.log.log(`rollup day=${dayStr} buckets=${n}`);
  }

  /** Backfill last N UTC days (excluding today). */
  async rebuildLastNDays(n: number): Promise<void> {
    const today = new Date();
    for (let i = 1; i <= n; i++) {
      const day = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() - i,
        ),
      );
      await this.rebuildDayUtc(day);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledRollupYesterday(): Promise<void> {
    const today = new Date();
    const yesterday = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - 1,
      ),
    );
    await this.rebuildDayUtc(yesterday);
  }
}
