import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { IngestEventsDto } from './dto/ingest-events.dto';
import { StudioAnalyticsAggregationService } from './studio-analytics-aggregation.service';
import { STUDIO_RAW_EVENT_SCHEMA_VERSION } from './studio-analytics.constants';
import { StudioAnalyticsService } from './studio-analytics.service';

@Controller('studio-analytics')
export class StudioAnalyticsController {
  constructor(
    private readonly svc: StudioAnalyticsService,
    private readonly rollup: StudioAnalyticsAggregationService,
  ) {}

  /* ── Public: receive events from the frontend ── */
  @Post('events')
  async ingest(@Body() dto: IngestEventsDto, @Req() req: Request) {
    if (
      dto.schemaVersion != null &&
      dto.schemaVersion !== STUDIO_RAW_EVENT_SCHEMA_VERSION
    ) {
      throw new BadRequestException({
        error: 'schema_version_mismatch',
        expected: STUDIO_RAW_EVENT_SCHEMA_VERSION,
        received: dto.schemaVersion,
      });
    }
    const device = this.detectDevice(req.headers['user-agent'] ?? '');
    const region = this.detectRegion(req);
    const count = await this.svc.ingest(dto, device, region);
    return {
      ok: true,
      stored: count,
      schemaVersion: STUDIO_RAW_EVENT_SCHEMA_VERSION,
    };
  }

  /* ── Public: return optimized defaults for the conversion layer ── */
  @Get('optimize')
  async optimize(
    @Query('device') device?: string,
    @Query('locale') locale?: string,
    @Req() req?: Request,
  ) {
    const detectedDevice = device || this.detectDevice(req?.headers['user-agent'] ?? '');
    const region = this.detectRegion(req) ?? undefined;
    return this.svc.optimize(detectedDevice, region, locale);
  }

  /* ── Admin: formal stats summary (auth required) ── */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async stats(@Query('days') days?: number) {
    return this.svc.getStatsSummaryV1(days ?? 30);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/summary')
  async statsSummary(@Query('days') days?: number) {
    return this.svc.getStatsSummaryV1(days ?? 30);
  }

  /** Rebuild daily rollup buckets for the last N UTC days (excluding today). */
  @UseGuards(JwtAuthGuard)
  @Post('admin/rebuild-rollups')
  async rebuildRollups(@Query('days') days?: number) {
    const n = Math.min(90, Math.max(1, Math.floor(Number(days)) || 7));
    await this.rollup.rebuildLastNDays(n);
    return { ok: true, rebuiltDays: n };
  }

  /* ── Helpers ── */

  private detectDevice(ua: string): string {
    const lower = ua.toLowerCase();
    if (/mobile|android|iphone|ipod|webos|blackberry|opera mini/i.test(lower))
      return 'mobile';
    if (/ipad|tablet|kindle|silk/i.test(lower)) return 'tablet';
    return 'desktop';
  }

  private detectRegion(req?: Request): string | null {
    if (!req) return null;
    const lang = (req.headers['accept-language'] ?? '').toLowerCase();
    if (lang.startsWith('ar')) return 'gcc';
    const forwarded = req.headers['x-forwarded-for'];
    if (!forwarded) return null;
    return null;
  }
}
