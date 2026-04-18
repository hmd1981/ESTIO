import { Controller, Get, Query } from '@nestjs/common';
import { StatusService, type GpuStatusSnapshot } from './status.service';

export interface StatusResponse {
  gpu: GpuStatusSnapshot;
}

/**
 * Public availability endpoint consumed by the web app's `useGpuStatus()` hook
 * and by health dashboards. Returns the cached probe; pass `?force=1` to skip
 * the cache (operator/debug only).
 */
@Controller('status')
export class StatusController {
  constructor(private readonly status: StatusService) {}

  @Get()
  async get(@Query('force') force?: string): Promise<StatusResponse> {
    const bypass = force === '1' || force === 'true';
    const gpu = await this.status.getStatus(bypass);
    return { gpu };
  }
}
