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
import { CreditsService } from '../credits/credits.service';
import { assertGenerateImagePayload } from './generate-image-payload';
import { mediaJobCreditCost } from './media-job-cost';
import {
  assertUnifiedStudioMediaJobBody,
  buildMediaJobInputMeta,
} from './media-job-payload';
import { assertGenerateMediaPayload } from './generate-media-payload';
import type { MediaWorkerRemoteStatus } from './media-worker.contract';
import { MediaWorkerService } from './media-worker.service';
import { StatusService } from '../status/status.service';
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
    private readonly status: StatusService,
    private readonly credits: CreditsService,
  ) {}

  /**
   * Phase 2: insert the MediaGenerationJob row AND debit the user's credits in
   * a single Prisma transaction. Either both succeed or neither does — a
   * failed debit (insufficient balance) reliably means we have no orphan job
   * row, and a failed insert reliably means we haven't taken the credits.
   *
   * If `userId` is null (PHASE2_ENFORCE_AUTH=false and the request is
   * anonymous), no debit happens and behaviour matches Phase 1. The
   * subsequent refund-on-failure helper is also a no-op for anonymous jobs.
   */
  private async createJobRowWithDebit(
    data: Prisma.MediaGenerationJobCreateInput,
    mode: string,
    userId: string | null,
  ): Promise<{
    id: string;
    debitedAmount: number;
    balanceAfter: number | null;
  }> {
    if (!userId) {
      const row = await this.prisma.mediaGenerationJob.create({ data });
      return { id: row.id, debitedAmount: 0, balanceAfter: null };
    }
    const cost = mediaJobCreditCost(mode);
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.mediaGenerationJob.create({ data });
      const debit = await this.credits.debitForJob(
        { userId, jobId: row.id, amount: cost },
        tx,
      );
      return {
        id: row.id,
        debitedAmount: cost,
        balanceAfter: debit.balanceAfter,
      };
    });
  }

  /**
   * Phase 4: quote for UI — same cost rules as submit; read-only balance check.
   */
  async getPreflightQuote(mode: string, userId: string) {
    const normalized =
      typeof mode === 'string' && mode.trim() ? mode.trim() : 'text_to_image';
    const cost = mediaJobCreditCost(normalized);
    const balance = await this.credits.getBalance(userId);
    const sufficient = balance >= cost;
    return {
      mode: normalized,
      costCredits: cost,
      balance,
      sufficient,
      shortfall: sufficient ? 0 : cost - balance,
      currency: 'credits' as const,
    };
  }

  /** Refund a previously-debited job. Idempotent via the ledger unique index. */
  private async refundJobIfDebited(jobId: string): Promise<void> {
    // Find the original debit row to know the user + amount. If there was no
    // debit (anonymous job), this is a clean no-op.
    const debit = await this.prisma.creditLedger.findFirst({
      where: {
        refType: 'job',
        refId: jobId,
        reason: { in: ['job_debit', 'generation_debit'] },
      },
    });
    if (!debit) return;
    try {
      await this.credits.refundJob({
        userId: debit.userId,
        jobId,
        amount: -debit.delta,
      });
    } catch (e) {
      this.logger.warn(
        `Failed to refund job ${jobId}: ${(e as Error).message}`,
      );
    }
  }

  /**
   * Fast-fail submit precheck. When the cached worker probe says offline, we
   * reject with **503 `WORKER_OFFLINE`** in <1ms instead of letting Axios
   * burn 60s+ on a tunnel timeout. Web maps this to the offline banner.
   */
  private assertWorkerOnlineForSubmit(): void {
    if (this.status.isWorkerOnlineFast()) return;
    throw new ServiceUnavailableException({
      code: 'WORKER_OFFLINE',
      message: 'GPU services are temporarily offline. Please try again later.',
      reason: this.status.lastReason() ?? 'unreachable',
    });
  }

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
          const maxAttempts = job.opts?.attempts ?? 1;
          const isLastAttempt = job.attemptsMade + 1 >= maxAttempts;
          await this.runProcessor(data.id, { isLastAttempt });
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

  async createGenerateImageJob(body: unknown, userId: string) {
    this.assertWorkerOnlineForSubmit();
    const payload = assertGenerateImagePayload(body);
    const inputMeta = buildMediaJobInputMeta('generate_image', payload);
    const workerTargetHost = parseMediaWorkerHost();

    const { id, debitedAmount, balanceAfter } =
      await this.createJobRowWithDebit(
        {
          type: 'generate_image',
          status: 'queued',
          workerTargetHost,
          inputPayload: payload as Prisma.InputJsonValue,
          inputMeta: inputMeta,
        },
        'generate_image',
        userId,
      );
    const row = await this.prisma.mediaGenerationJob.findUniqueOrThrow({
      where: { id },
    });

    try {
      await this.enqueueMediaJob(row.id);
    } catch (e) {
      await this.refundJobIfDebited(row.id);
      await this.prisma.mediaGenerationJob
        .delete({ where: { id: row.id } })
        .catch(() => {});
      throw new ServiceUnavailableException(
        `Failed to enqueue media job: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return buildMediaJobSubmitResponse(
      row,
      this.mediaWorker.getMediaWorkerMode(),
      {
        debited: debitedAmount,
        balanceAfter,
      },
    );
  }

  /**
   * Async jobs for video-oriented modes (`text_to_video`, `image_to_video`).
   * Same poll/result contract as {@link createGenerateImageJob}. Worker must understand the payload.
   */
  async createGenerateMediaJob(body: unknown, userId: string) {
    this.assertWorkerOnlineForSubmit();
    const payload = assertGenerateMediaPayload(body);
    const workerTargetHost = parseMediaWorkerHost();
    const mode =
      typeof payload.mode === 'string' && payload.mode.trim()
        ? payload.mode.trim()
        : 'text_to_video';
    const inputMeta = buildMediaJobInputMeta(mode, payload);

    const { id, debitedAmount, balanceAfter } =
      await this.createJobRowWithDebit(
        {
          type: mode,
          status: 'queued',
          workerTargetHost,
          inputPayload: payload as Prisma.InputJsonValue,
          inputMeta: inputMeta,
        },
        mode,
        userId,
      );
    const row = await this.prisma.mediaGenerationJob.findUniqueOrThrow({
      where: { id },
    });

    try {
      await this.enqueueMediaJob(row.id);
    } catch (e) {
      await this.refundJobIfDebited(row.id);
      await this.prisma.mediaGenerationJob
        .delete({ where: { id: row.id } })
        .catch(() => {});
      throw new ServiceUnavailableException(
        `Failed to enqueue media job: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return buildMediaJobSubmitResponse(
      row,
      this.mediaWorker.getMediaWorkerMode(),
      {
        debited: debitedAmount,
        balanceAfter,
      },
    );
  }

  /**
   * Studio unified entry: `POST /media/jobs` with `{ mode, ... }`.
   * Persists canonical `type` = `text_to_image` | `image_to_video` | `text_to_video`.
   */
  async createStudioMediaJob(body: unknown, userId: string) {
    this.assertWorkerOnlineForSubmit();
    const { mode, payload } = assertUnifiedStudioMediaJobBody(body);
    const inputMeta = buildMediaJobInputMeta(mode, payload);
    const workerTargetHost = parseMediaWorkerHost();

    const { id, debitedAmount, balanceAfter } =
      await this.createJobRowWithDebit(
        {
          type: mode,
          status: 'queued',
          workerTargetHost,
          inputPayload: payload as Prisma.InputJsonValue,
          inputMeta: inputMeta,
        },
        mode,
        userId,
      );
    const row = await this.prisma.mediaGenerationJob.findUniqueOrThrow({
      where: { id },
    });

    try {
      await this.enqueueMediaJob(row.id);
    } catch (e) {
      await this.refundJobIfDebited(row.id);
      await this.prisma.mediaGenerationJob
        .delete({ where: { id: row.id } })
        .catch(() => {});
      throw new ServiceUnavailableException(
        `Failed to enqueue media job: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return buildMediaJobSubmitResponse(
      row,
      this.mediaWorker.getMediaWorkerMode(),
      {
        debited: debitedAmount,
        balanceAfter,
      },
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
            await this.runProcessor(jid, { isLastAttempt: true });
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
      throw new UnprocessableEntityException(
        buildMediaJobResultFailedBody(row),
      );
    }
    throw new ConflictException(buildMediaJobResultNotReadyBody(row));
  }

  /**
   * Mark a job as terminally failed AND refund the user's credits (idempotent).
   * Use this anywhere we'd previously written `status: 'failed'` directly so
   * the refund can never be skipped on a new code path.
   */
  private async markJobFailed(
    id: string,
    ser: {
      errorPayload: Prisma.InputJsonValue;
      errorMessage: string;
      upstreamHttpStatus: number | null;
    },
  ): Promise<void> {
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
    await this.refundJobIfDebited(id);
  }

  /**
   * Process one media generation job.
   *
   * Retry policy: when {@link submitMediaJobToWorker} throws a transient
   * connection error (gateway timeout, worker unreachable, or precheck
   * `WORKER_OFFLINE`) AND we are not on the last Bull attempt, the row is
   * reset to `queued` and the error is rethrown so Bull's `attempts: 2`
   * retry kicks in. All other failures are persisted as terminal `failed`
   * (current behaviour preserved). Polling-stage failures are NOT retried
   * here because the workstation already has a remote job id and a retry
   * would orphan it; we mark failed inline as before.
   */
  private async runProcessor(
    id: string,
    opts: { isLastAttempt: boolean } = { isLastAttempt: true },
  ): Promise<void> {
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
          await this.markJobFailed(id, this.serializeJobError(e));
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
            await this.markJobFailed(id, this.serializeJobError(e));
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
            await this.markJobFailed(id, {
              errorPayload: errBody as Prisma.InputJsonValue,
              errorMessage: (
                hintFromResult ??
                statusHint ??
                'Worker job failed'
              ).slice(0, 1024),
              upstreamHttpStatus: null,
            });
          } catch (e) {
            const ser = this.serializeJobError(e);
            await this.markJobFailed(id, {
              ...ser,
              errorMessage: (statusHint ?? ser.errorMessage).slice(0, 1024),
            });
          }
          return;
        }

        await delay(pollEvery);
      }

      const ser = this.serializeJobError(
        new GatewayTimeoutException(
          'Workstation async job poll exceeded deadline',
        ),
      );
      await this.markJobFailed(id, ser);
    } catch (e) {
      if (this.isTransientSubmitError(e) && !opts.isLastAttempt) {
        await this.prisma.mediaGenerationJob.update({
          where: { id },
          data: { status: 'queued', startedAt: null },
        });
        this.logger.warn(
          `media-generate: transient submit failure for ${id} (${e instanceof Error ? e.message : String(e)}) — rethrowing for Bull retry`,
        );
        throw e;
      }
      await this.markJobFailed(id, this.serializeJobError(e));
    }
  }

  private isTransientSubmitError(e: unknown): boolean {
    if (e instanceof GatewayTimeoutException) return true;
    if (e instanceof BadGatewayException) {
      const msg = (e.message || '').toLowerCase();
      if (
        msg.includes('cannot reach') ||
        msg.includes('econnrefused') ||
        msg.includes('econnreset')
      ) {
        return true;
      }
    }
    if (e instanceof ServiceUnavailableException) {
      const resp = e.getResponse();
      if (resp && typeof resp === 'object') {
        const code = (resp as Record<string, unknown>).code;
        if (code === 'WORKER_OFFLINE') return true;
      }
    }
    return false;
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
