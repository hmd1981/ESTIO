import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { MaybeWalletAuthGuard } from '../wallet-auth/maybe-wallet-auth.guard';
import { MediaJobsService } from './media-jobs.service';

// Submit-side rate limit (per IP). Real per-user accounting is the job of the
// upcoming WalletAuthGuard + credit ledger in Phase 2; until that ships these
// IP limits are the only thing standing between the open internet and our GPU.
const SUBMIT_THROTTLE = {
  short: { limit: 5, ttl: 60_000 }, //  5 submits / minute / IP
  long: { limit: 50, ttl: 86_400_000 }, // 50 submits / day    / IP
} as const;

/**
 * Unified async media jobs. **Primary Studio submit:** `POST /media/jobs` with `{ mode, … }`.
 * Legacy: `POST …/generate-image`, `POST …/generate-media`.
 */
@Controller('media/jobs')
@UseGuards(MaybeWalletAuthGuard)
export class MediaJobsController {
  constructor(private readonly mediaJobs: MediaJobsService) {}

  @Post('generate-image')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(SUBMIT_THROTTLE)
  createGenerateImage(@Body() body: unknown, @Req() req: Request) {
    return this.mediaJobs.createGenerateImageJob(body, req.walletUser?.id ?? null);
  }

  /**
   * Unified Studio submit: `{ "mode": "text_to_image" | "image_to_video" | "text_to_video", ... }`.
   * Same queue, status, and result endpoints as `generate-image`.
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(SUBMIT_THROTTLE)
  createStudioMediaJob(@Body() body: unknown, @Req() req: Request) {
    return this.mediaJobs.createStudioMediaJob(body, req.walletUser?.id ?? null);
  }

  /** Video-oriented async jobs (`mode`: `text_to_video` | `image_to_video`). Poll/result same as generate-image. */
  @Post('generate-media')
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(SUBMIT_THROTTLE)
  createGenerateMedia(@Body() body: unknown, @Req() req: Request) {
    return this.mediaJobs.createGenerateMediaJob(body, req.walletUser?.id ?? null);
  }

  /**
   * Completed: **200** — `jobId`, `id`, `type`, `mediaKind`, `status`, `resultReady`, `error`, `playback`, `result`.
   * `playback` is a browser-safe descriptor when inferable; otherwise `null` (use `result`).
   * Not ready: **409** — same identity fields + `resultReady: false`, `error.code` **RESULT_NOT_READY**.
   * Failed: **422** — `resultReady: false`, `error` safe for UI (no raw upstream body).
   */
  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.mediaJobs.getJobResult(id);
  }

  @Get(':id')
  getStatus(@Param('id') id: string) {
    return this.mediaJobs.getJobStatus(id);
  }
}
