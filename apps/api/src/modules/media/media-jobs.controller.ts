import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { MediaJobsService } from './media-jobs.service';

/**
 * Unified async media jobs. **Primary Studio submit:** `POST /media/jobs` with `{ mode, … }`.
 * Legacy: `POST …/generate-image`, `POST …/generate-media`.
 */
@Controller('media/jobs')
export class MediaJobsController {
  constructor(private readonly mediaJobs: MediaJobsService) {}

  @Post('generate-image')
  @HttpCode(HttpStatus.ACCEPTED)
  createGenerateImage(@Body() body: unknown) {
    return this.mediaJobs.createGenerateImageJob(body);
  }

  /**
   * Unified Studio submit: `{ "mode": "text_to_image" | "image_to_video" | "text_to_video", ... }`.
   * Same queue, status, and result endpoints as `generate-image`.
   */
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  createStudioMediaJob(@Body() body: unknown) {
    return this.mediaJobs.createStudioMediaJob(body);
  }

  /** Video-oriented async jobs (`mode`: `text_to_video` | `image_to_video`). Poll/result same as generate-image. */
  @Post('generate-media')
  @HttpCode(HttpStatus.ACCEPTED)
  createGenerateMedia(@Body() body: unknown) {
    return this.mediaJobs.createGenerateMediaJob(body);
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
