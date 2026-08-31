import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { WalletAuthGuard } from '../wallet-auth/wallet-auth.guard';
import { MediaJobsService } from './media-jobs.service';

const SUBMIT_THROTTLE = {
  short: { limit: 5, ttl: 60_000 },
  long: { limit: 50, ttl: 86_400_000 },
} as const;

/**
 * Unified async media jobs. **Primary Studio submit:** `POST /media/jobs` with `{ mode, … }`.
 * Phase 4: all submits require wallet JWT; credit debit is atomic with job row creation.
 * Status/result polling stays public so clients can poll by job id.
 */
@Controller('media/jobs')
export class MediaJobsController {
  constructor(private readonly mediaJobs: MediaJobsService) {}

  /**
   * Credit quote for a mode (authenticated). Same cost rules as submit.
   * GET /media/jobs/preflight?mode=text_to_image
   */
  @Get('preflight')
  @UseGuards(WalletAuthGuard)
  @Throttle({
    short: { limit: 30, ttl: 60_000 },
    long: { limit: 500, ttl: 86_400_000 },
  })
  preflight(@Query('mode') mode: string | undefined, @Req() req: Request) {
    return this.mediaJobs.getPreflightQuote(
      mode ?? 'text_to_image',
      req.walletUser!.id,
    );
  }

  @Post('generate-image')
  @UseGuards(WalletAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(SUBMIT_THROTTLE)
  createGenerateImage(@Body() body: unknown, @Req() req: Request) {
    return this.mediaJobs.createGenerateImageJob(body, req.walletUser!.id);
  }

  @Post()
  @UseGuards(WalletAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(SUBMIT_THROTTLE)
  createStudioMediaJob(@Body() body: unknown, @Req() req: Request) {
    return this.mediaJobs.createStudioMediaJob(body, req.walletUser!.id);
  }

  @Post('generate-media')
  @UseGuards(WalletAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Throttle(SUBMIT_THROTTLE)
  createGenerateMedia(@Body() body: unknown, @Req() req: Request) {
    return this.mediaJobs.createGenerateMediaJob(body, req.walletUser!.id);
  }

  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.mediaJobs.getJobResult(id);
  }

  @Get(':id')
  getStatus(@Param('id') id: string) {
    return this.mediaJobs.getJobStatus(id);
  }
}
