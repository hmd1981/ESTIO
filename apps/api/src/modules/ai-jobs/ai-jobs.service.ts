import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { WorkstationRunService } from '../workstation/workstation-run.service';
import { AiJobsRateLimitService } from './ai-jobs-rate-limit.service';
import { bullmqConnectionOptions } from './redis-connection';
import type { CreateAiJobDto } from './dto/create-ai-job.dto';

export type AiJobPublicStatus =
  'queued' | 'active' | 'completed' | 'failed' | 'unknown';

@Injectable()
export class AiJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiJobsService.name);
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private useBull = false;

  /** In-process fallback when Redis is unavailable or AI_JOBS_USE_MEMORY=true */
  private readonly memory = new Map<
    string,
    {
      status: AiJobPublicStatus;
      assets?: string[];
      error?: string;
    }
  >();

  constructor(
    private readonly workstation: WorkstationRunService,
    private readonly rateLimit: AiJobsRateLimitService,
  ) {}

  onModuleInit(): void {
    const conn = bullmqConnectionOptions();
    if (!conn) {
      this.logger.log(
        'AI jobs: using in-memory queue (set REDIS_URL for BullMQ, or AI_JOBS_USE_MEMORY=true to force memory)',
      );
      return;
    }
    try {
      this.queue = new Queue('ai-jobs', {
        connection: conn,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
          removeOnComplete: { count: 500 },
          removeOnFail: { count: 200 },
        },
      });
      this.worker = new Worker(
        'ai-jobs',
        async (job) => {
          const { type, input } = job.data as CreateAiJobDto;
          return this.workstation.runForJob(
            type,
            input as unknown as Record<string, unknown>,
          );
        },
        {
          connection: conn,
          concurrency: 2,
          lockDuration: 120_000,
        },
      );
      this.worker.on('failed', (job, err) => {
        this.logger.warn(`Job ${job?.id} failed: ${err?.message}`);
      });
      this.useBull = true;
      this.logger.log('AI jobs: BullMQ worker started');
    } catch (e) {
      this.logger.error(
        `BullMQ init failed, using memory: ${e instanceof Error ? e.message : e}`,
      );
      this.queue = null;
      this.worker = null;
      this.useBull = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }

  private validateDto(dto: CreateAiJobDto): void {
    const p = dto.input.prompt?.trim() || dto.input.description?.trim() || '';
    if (!p) {
      throw new BadRequestException(
        'input.prompt or input.description is required',
      );
    }
  }

  private clientKey(ip: string | undefined): string {
    return (ip && ip.trim()) || 'unknown';
  }

  async createJob(dto: CreateAiJobDto, ip?: string): Promise<{ id: string }> {
    this.rateLimit.checkOrThrow(this.clientKey(ip));
    this.validateDto(dto);

    const id = randomUUID();

    if (this.useBull && this.queue) {
      await this.queue.add(
        'run',
        { type: dto.type, input: dto.input },
        {
          jobId: id,
        },
      );
      return { id };
    }

    this.memory.set(id, { status: 'queued' });
    void this.runMemoryJob(id, dto);
    return { id };
  }

  private async runMemoryJob(id: string, dto: CreateAiJobDto): Promise<void> {
    this.memory.set(id, { status: 'active' });
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        const assets = await this.workstation.runForJob(
          dto.type,
          dto.input as unknown as Record<string, unknown>,
        );
        this.memory.set(id, { status: 'completed', assets });
        return;
      } catch (e) {
        attempts += 1;
        if (attempts >= maxAttempts) {
          this.memory.set(id, {
            status: 'failed',
            error: e instanceof Error ? e.message : String(e),
          });
          return;
        }
        await new Promise((r) => setTimeout(r, 1500 * attempts));
      }
    }
  }

  async getJob(id: string): Promise<{
    status: AiJobPublicStatus;
    assets: string[];
    error?: string;
  }> {
    if (this.useBull && this.queue) {
      const job = await this.queue.getJob(id);
      if (!job) {
        return { status: 'unknown', assets: [] };
      }
      const state = await job.getState();
      if (state === 'completed') {
        const rv = job.returnvalue as string[] | undefined;
        return { status: 'completed', assets: Array.isArray(rv) ? rv : [] };
      }
      if (state === 'failed') {
        return {
          status: 'failed',
          assets: [],
          error: job.failedReason ?? 'failed',
        };
      }
      if (state === 'active' || state === 'waiting' || state === 'delayed') {
        return { status: state === 'active' ? 'active' : 'queued', assets: [] };
      }
      return { status: 'unknown', assets: [] };
    }

    const m = this.memory.get(id);
    if (!m) {
      return { status: 'unknown', assets: [] };
    }
    return {
      status: m.status,
      assets: m.assets ?? [],
      error: m.error,
    };
  }
}
