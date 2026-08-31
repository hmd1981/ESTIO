import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { isAxiosError } from 'axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { CreateMediaAssetDto } from './dto/create-media-asset.dto';
import { UpdateMediaAssetDto } from './dto/update-media-asset.dto';
import { assertGenerateImagePayload } from './generate-image-payload';
import { MediaService } from './media.service';

function joinWorkerUrl(baseUrl: string, path: string): string {
  const b = baseUrl.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly http: HttpService,
  ) {}

  // Same per-IP submit envelope as POST /media/jobs* (defence-in-depth before
  // Phase 2 lands real wallet auth + credit debits).
  @Post('generate-image')
  @Throttle({
    short: { limit: 5, ttl: 60_000 },
    long: { limit: 50, ttl: 86_400_000 },
  })
  generateImage(@Body() body: unknown) {
    const payload = assertGenerateImagePayload(body);
    return this.mediaService.forwardGenerateImageToWorker(payload);
  }

  @Post()
  create(@Body() dto: CreateMediaAssetDto) {
    return this.mediaService.create(dto);
  }

  @Get()
  findAll() {
    return this.mediaService.findAll();
  }

  /** Proxies worker GET /health (see MEDIA_WORKER_URL — e.g. SSH tunnel on Estio host). */
  @Get('worker-health')
  workerHealth() {
    return this.mediaService.probeMediaWorkerHealth();
  }

  /**
   * Structured connectivity snapshot (no auth). Enable only temporarily:
   * MEDIA_WORKER_DEBUG=true — disable in production when satisfied.
   */
  @Get('worker-debug')
  async workerDebug() {
    if (process.env.MEDIA_WORKER_DEBUG?.trim() !== 'true') {
      throw new NotFoundException();
    }
    return this.mediaService.getMediaWorkerDebugSnapshot();
  }

  /**
   * Public Comfy-style image bytes for `<img src>` when the worker only returns `filename` in JSON.
   * Forwards to `MEDIA_JOB_VIEW_PROXY_UPSTREAM` (or `MEDIA_WORKER_URL`) + `MEDIA_JOB_VIEW_PATH` (default `/view`).
   * Set `MEDIA_JOB_VIEW_BASE_URL` + `MEDIA_JOB_VIEW_PATH` to this route on your **browser-visible** API origin
   * (e.g. `https://api.estio.org` + `/media/comfy-view`).
   */
  @Get('comfy-view')
  async comfyView(
    @Query('filename') filename: string,
    @Query('type') type: string | undefined,
    @Query('subfolder') subfolder: string | undefined,
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    if (typeof filename !== 'string' || !filename.trim()) {
      res.status(400).json({ message: 'filename query is required' });
      return;
    }
    const rawUpstream =
      process.env.MEDIA_JOB_VIEW_PROXY_UPSTREAM?.trim() ||
      process.env.MEDIA_WORKER_URL?.trim() ||
      '';
    if (!rawUpstream) {
      throw new ServiceUnavailableException(
        'Comfy view proxy is not configured (set MEDIA_JOB_VIEW_PROXY_UPSTREAM or MEDIA_WORKER_URL)',
      );
    }
    const upstreamViewPath = (
      process.env.MEDIA_JOB_VIEW_UPSTREAM_PATH ?? '/view'
    ).trim();
    const pathSuffix = upstreamViewPath.startsWith('/')
      ? upstreamViewPath
      : `/${upstreamViewPath}`;
    const qs = new URLSearchParams({
      filename: filename.trim(),
      type: typeof type === 'string' && type.trim() ? type.trim() : 'output',
      subfolder: typeof subfolder === 'string' ? subfolder : '',
    });
    const url = `${joinWorkerUrl(rawUpstream, pathSuffix)}?${qs.toString()}`;
    try {
      const upstream = await firstValueFrom(
        this.http.get(url, {
          responseType: 'stream',
          timeout: 120_000,
          maxContentLength: 80 * 1024 * 1024,
          maxBodyLength: 80 * 1024 * 1024,
          validateStatus: () => true,
        }),
      );
      if (upstream.status >= 400) {
        res.status(upstream.status).end();
        return;
      }
      const ct = upstream.headers['content-type'];
      if (typeof ct === 'string') {
        res.setHeader('Content-Type', ct);
      }
      const cd = upstream.headers['content-disposition'];
      if (typeof cd === 'string') {
        res.setHeader('Content-Disposition', cd);
      }
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.status(200);
      upstream.data.pipe(res);
    } catch (e) {
      if (isAxiosError(e) && !e.response) {
        throw new BadGatewayException(
          'Could not reach Comfy/worker for image view',
        );
      }
      throw e;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMediaAssetDto) {
    return this.mediaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
