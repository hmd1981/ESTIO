import {
  BadGatewayException,
  ConflictException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Queue, Worker } from 'bullmq';
import { bullmqConnectionOptions } from '../ai-jobs/redis-connection';
import { PrismaService } from '../../prisma/prisma.service';
import { assertGenerateImagePayload } from './generate-image-payload';
import { assertUnifiedStudioMediaJobBody, buildMediaJobInputMeta } from './media-job-payload';
import { assertGenerateMediaPayload } from './generate-media-payload';
import type { MediaWorkerRemoteStatus } from './media-worker.contract';
import { MediaWorkerService } from './media-worker.service';
import {
  buildMediaJobResultFailedBody,
  buildMediaJobResultNotReadyBody,
  buildMediaJobResultSuccess,
  buildMediaJobStatusResponse,
  buildMediaJobSubmitResponse,
  type MediaJobResultSuccess,
} from './media-jobs-public.view';

const QUEUE_NAME = 'media-generate';

function parseMediaWorkerHost(): string | null {
  const raw = process.env.MEDIA_WORKER_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname || null;
  } catch {
    return null;
  }
}

function mediaJobBullTimeoutMs(): number {
  const t = Number(process.env.MEDIA_WORKER_TIMEOUT_MS ?? 660_000);
  const base = Number.isFinite(t) && t > 0 ? t : 660_000;
  return base + 60_000;
}

function asyncPollIntervalMs(): number {
  const n = Number(process.env.MEDIA_WORKER_ASYNC_POLL_INTERVAL_MS ?? 500);
  return Number.isFinite(n) && n >= 200 && n <= 30_000 ? n : 500;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

@Injectable()
export class MediaJobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MediaJobsService.name);
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  /** When Redis/BullMQ is unavailable: FIFO ids processed serially (state still in Prisma). */
  private readonly localJobQueue: string[] = [];
  private localQueueDraining = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaWorker: MediaWorkerService,
  ) {}

  onModuleInit(): void {
    const conn = bullmqConnectionOptions();
    if (!conn) {
      this.logger.warn(
        'Media jobs: Redis unavailable — using in-process FIFO queue (set REDIS_URL for BullMQ). Job rows still persist in the database.',
      );
      return;
    }
    try {
      const timeoutMs = mediaJobBullTimeoutMs();
      this.queue = new Queue(QUEUE_NAME, {
        connection: conn,
        defaultJobOptions: {
          attempts: 2,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: { count: 500 },
          removeOnFail: { count: 200 },
        },
      });
      this.worker = new Worker(
        QUEUE_NAME,
        async (job) => {
          const data = job.data as { id: string };
          await this.runProcessor(data.id);
        },
        {
          connection: conn,
          concurrency: 1,
          lockDuration: timeoutMs,
        },
      );
      this.worker.on('failed', (job, err) => {
        this.logger.warn(
          `Media job ${job?.id} Bull failed after DB handling: ${err?.message}`,
        );
      });
      this.logger.log(
        `Media async jobs: BullMQ queue "${QUEUE_NAME}" worker started (concurrency=1, lockDurationMs=${timeoutMs})`,
      );
    } catch (e) {
      this.logger.error(
        `Media async jobs: BullMQ init failed: ${e instanceof Error ? e.message : e}`,
      );
      this.queue = null;
      this.worker = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }

  async createGenerateImageJob(body: unknown) {
    const payload = assertGenerateImagePayload(body);
    const inputMeta = buildMediaJobInputMeta('generate_image', payload);
    const workerTargetHost = parseMediaWorkerHost();

    const row = await this.prisma.mediaGenerationJob.create({
      data: {
        type: 'generate_image',
        status: 'queued',
        workerTargetHost,
        inputPayload: payload as Prisma.InputJsonValue,
        inputMeta: inputMeta as Prisma.InputJsonValue,
      },
    });

    try {
      await this.enqueueMediaJob(row.id);
    } catch (e) {
      await this.prisma.mediaGenerationJob.delete({ where: { id: row.id } }).catch(() => {});
      throw new ServiceUnavailableException(
        `Failed to enqueue media job: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return buildMediaJobSubmitResponse(
      row,
      this.mediaWorker.getMediaWorkerMode(),
    );
  }

  /**
   * Async jobs for video-oriented modes (`text_to_video`, `image_to_video`).
   * Same poll/result contract as {@link createGenerateImageJob}. Worker must understand the payload.
   */
  async createGenerateMediaJob(body: unknown) {
    const payload = assertGenerateMediaPayload(body);
    const workerTargetHost = parseMediaWorkerHost();
    const mode =
      typeof payload.mode === 'string' && payload.mode.trim()
        ? payload.mode.trim()
        : 'text_to_video';
    const inputMeta = buildMediaJobInputMeta(mode, payload);

    const row = await this.prisma.mediaGenerationJob.create({
      data: {
        type: mode,
        status: 'queued',
        workerTargetHost,
        inputPayload: payload as Prisma.InputJsonValue,
        inputMeta: inputMeta as Prisma.InputJsonValue,
      },
    });

    try {
      await this.enqueueMediaJob(row.id);
    } catch (e) {
      await this.prisma.mediaGenerationJob.delete({ where: { id: row.id } }).catch(() => {});
      throw new ServiceUnavailableException(
        `Failed to enqueue media job: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return buildMediaJobSubmitResponse(
      row,
      this.mediaWorker.getMediaWorkerMode(),
    );
  }

  /**
   * Studio unified entry: `POST /media/jobs` with `{ mode, ... }`.
   * Persists canonical `type` = `text_to_image` | `image_to_video` | `text_to_video`.
   */
  async createStudioMediaJob(body: unknown) {
    const { mode, payload } = assertUnifiedStudioMediaJobBody(body);
    const inputMeta = buildMediaJobInputMeta(mode, payload);
    const workerTargetHost = parseMediaWorkerHost();

    const row = await this.prisma.mediaGenerationJob.create({
      data: {
        type: mode,
        status: 'queued',
        workerTargetHost,
        inputPayload: payload as Prisma.InputJsonValue,
        inputMeta: inputMeta as Prisma.InputJsonValue,
      },
    });

    try {
      await this.enqueueMediaJob(row.id);
    } catch (e) {
      await this.prisma.mediaGenerationJob.delete({ where: { id: row.id } }).catch(() => {});
      throw new ServiceUnavailableException(
        `Failed to enqueue media job: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return buildMediaJobSubmitResponse(
      row,
      this.mediaWorker.getMediaWorkerMode(),
    );
  }

  private async enqueueMediaJob(id: string): Promise<void> {
    if (this.queue) {
      await this.queue.add('run', { id }, { jobId: id });
      return;
    }
    this.localJobQueue.push(id);
    this.scheduleLocalQueueDrain();
  }

  private scheduleLocalQueueDrain(): void {
    if (this.localQueueDraining) {
      return;
    }
    this.localQueueDraining = true;
    void (async () => {
      try {
        while (this.localJobQueue.length > 0) {
          const jid = this.localJobQueue.shift()!;
          try {
            await this.runProcessor(jid);
          } catch (e) {
            this.logger.error(
              `media-generate in-process: job ${jid} failed: ${e instanceof Error ? e.message : String(e)}`,
            );
          }
        }
      } finally {
        this.localQueueDraining = false;
        if (this.localJobQueue.length > 0) {
          this.scheduleLocalQueueDrain();
        }
      }
    })();
  }

  getJobStatus(id: string) {
    return this.prisma.mediaGenerationJob
      .findUnique({ where: { id } })
      .then((row) => {
        if (!row) {
          throw new NotFoundException(`Media job not found: ${id}`);
        }
        return buildMediaJobStatusResponse(
          row,
          this.mediaWorker.getMediaWorkerMode(),
        );
      });
  }

  async getJobResult(id: string): Promise<MediaJobResultSuccess> {
    const row = await this.prisma.mediaGenerationJob.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException(`Media job not found: ${id}`);
    }
    if (row.status === 'completed' && row.resultPayload != null) {
      return buildMediaJobResultSuccess(row);
    }
    if (row.status === 'failed') {
      throw new UnprocessableEntityException(buildMediaJobResultFailedBody(row));
    }
    throw new ConflictException(buildMediaJobResultNotReadyBody(row));
  }

  private async runProcessor(id: string): Promise<void> {
    const row = await this.prisma.mediaGenerationJob.findUnique({
      where: { id },
    });
    if (!row) {
      this.logger.warn(`media-generate: missing row ${id}`);
      return;
    }
    if (row.status !== 'queued') {
      this.logger.warn(`media-generate: skip ${id} status=${row.status}`);
      return;
    }

    await this.prisma.mediaGenerationJob.update({
      where: { id },
      data: { status: 'running', startedAt: new Date() },
    });

    const payload = row.inputPayload as Record<string, unknown>;
    try {
      const submission = await this.mediaWorker.submitMediaJobToWorker(
        row.type,
        payload,
      );

      if (submission.kind === 'inline_completed') {
        await this.prisma.mediaGenerationJob.update({
          where: { id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            resultPayload: submission.result as Prisma.InputJsonValue,
          },
        });
        return;
      }

      await this.prisma.mediaGenerationJob.update({
        where: { id },
        data: { workerRemoteJobId: submission.workerJobId },
      });

      const deadline = Date.now() + mediaJobBullTimeoutMs();
      const pollEvery = asyncPollIntervalMs();

      while (Date.now() < deadline) {
        let remote: MediaWorkerRemoteStatus;
        let statusBody: unknown;
        try {
          const snap = await this.mediaWorker.getWorkerJobStatusSnapshot(
            submission.workerJobId,
          );
          remote = snap.status;
          statusBody = snap.body;
        } catch (e) {
          const ser = this.serializeJobError(e);
          await this.prisma.mediaGenerationJob.update({
            where: { id },
            data: {
              status: 'failed',
              completedAt: new Date(),
              errorPayload: ser.errorPayload,
              errorMessage: ser.errorMessage,
              upstreamHttpStatus: ser.upstreamHttpStatus,
            },
          });
          return;
        }

        this.logger.log(
          JSON.stringify({
            event: 'media_jobs.processor.async_poll',
            prismaJobId: id,
            workerJobId: submission.workerJobId,
            remoteStatus: remote,
          }),
        );

        if (remote === 'completed') {
          try {
            const result = await this.mediaWorker.getWorkerJobResult(
              submission.workerJobId,
            );
            await this.prisma.mediaGenerationJob.update({
              where: { id },
              data: {
                status: 'completed',
                completedAt: new Date(),
                resultPayload: result as Prisma.InputJsonValue,
              },
            });
          } catch (e) {
            const ser = this.serializeJobError(e);
            await this.prisma.mediaGenerationJob.update({
              where: { id },
              data: {
                status: 'failed',
                completedAt: new Date(),
                errorPayload: ser.errorPayload,
                errorMessage: ser.errorMessage,
                upstreamHttpStatus: ser.upstreamHttpStatus,
              },
            });
          }
          return;
        }

        if (remote === 'failed') {
          const statusHint =
            this.mediaWorker.failureHintFromStatusBody(statusBody);
          try {
            const errBody = await this.mediaWorker.getWorkerJobResult(
              submission.workerJobId,
            );
            const hintFromResult =
              this.mediaWorker.failureHintFromStatusBody(errBody);
            await this.prisma.mediaGenerationJob.update({
              where: { id },
              data: {
                status: 'failed',
                completedAt: new Date(),
                errorPayload: errBody as Prisma.InputJsonValue,
                errorMessage: (
                  hintFromResult ??
                  statusHint ??
                  'Worker job failed'
                ).slice(0, 1024),
                upstreamHttpStatus: null,
              },
            });
          } catch (e) {
            const ser = this.serializeJobError(e);
            await this.prisma.mediaGenerationJob.update({
              where: { id },
              data: {
                status: 'failed',
                completedAt: new Date(),
                errorPayload: ser.errorPayload,
                errorMessage: (
                  statusHint ?? ser.errorMessage
                ).slice(0, 1024),
                upstreamHttpStatus: ser.upstreamHttpStatus,
              },
            });
          }
          return;
        }

        await delay(pollEvery);
      }

      const ser = this.serializeJobError(
        new GatewayTimeoutException('Workstation async job poll exceeded deadline'),
      );
      await this.prisma.mediaGenerationJob.update({
        where: { id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorPayload: ser.errorPayload,
          errorMessage: ser.errorMessage,
          upstreamHttpStatus: ser.upstreamHttpStatus,
        },
      });
    } catch (e) {
      const ser = this.serializeJobError(e);
      await this.prisma.mediaGenerationJob.update({
        where: { id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorPayload: ser.errorPayload,
          errorMessage: ser.errorMessage,
          upstreamHttpStatus: ser.upstreamHttpStatus,
        },
      });
    }
  }

  private serializeJobError(e: unknown): {
    errorPayload: Prisma.InputJsonValue;
    errorMessage: string;
    upstreamHttpStatus: number | null;
  } {
    if (e instanceof HttpException) {
      const status = e.getStatus();
      const resp = e.getResponse();
      const body =
        typeof resp === 'string'
          ? { message: resp }
          : (resp as Record<string, unknown>);
      const msg =
        typeof resp === 'string'
          ? resp
          : typeof body.message === 'string'
            ? body.message
            : (e as Error).message || 'Http error';
      const payload: Prisma.InputJsonValue = {
        httpStatus: status,
        body: JSON.parse(JSON.stringify(body)) as Prisma.InputJsonValue,
        kind:
          e instanceof GatewayTimeoutException
            ? 'timeout'
            : e instanceof BadGatewayException
              ? 'bad_gateway'
              : e instanceof ServiceUnavailableException
                ? 'service_unavailable'
                : 'http_exception',
      };
      return {
        errorPayload: payload,
        errorMessage: msg.slice(0, 1024),
        upstreamHttpStatus: status >= 400 && status < 600 ? status : null,
      };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return {
      errorPayload: { kind: 'unknown', message: msg },
      errorMessage: msg.slice(0, 1024),
      upstreamHttpStatus: null,
    };
  }
}
