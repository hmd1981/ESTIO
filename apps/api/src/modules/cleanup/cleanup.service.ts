import { existsSync } from 'node:fs';
import { readdir, stat, unlink } from 'node:fs/promises';
import { basename, join, sep } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { bullmqConnectionOptions } from '../ai-jobs/redis-connection';
import { CreditsService } from '../credits/credits.service';
import { PrismaService } from '../../prisma/prisma.service';
import { loadCleanupConfig } from './cleanup.config';
import {
  assertDeletableFile,
  buildApprovedFileRoots,
} from './cleanup-path-guard';
import type {
  CleanupCategoryCounts,
  CleanupReport,
  CleanupRunOptions,
} from './cleanup.types';

const ORPHAN_NAME_PREFIX = /^(preview|sample|temp)-/i;
const MAX_DETAIL_LINES = 40;

function emptyCounts(): CleanupCategoryCounts {
  return {
    tempFilesDeleted: 0,
    orphanAssetsDeleted: 0,
    stuckJobsFailed: 0,
    authTokensDeleted: 0,
    portalSessionsExpired: 0,
    paymentsMarkedExpired: 0,
    logFilesRotated: 0,
    analyticsEventsDeleted: 0,
    askEventsDeleted: 0,
    intakeSessionsDeleted: 0,
    automationRunsDeleted: 0,
    redisQueueJobsCleaned: 0,
  };
}

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly credits: CreditsService,
  ) {}

  /** Idempotent daily cleanup — safe to re-run after interruption. */
  async runDaily(opts: CleanupRunOptions = {}): Promise<CleanupReport> {
    const dryRun = opts.dryRun === true;
    const startedAt = new Date();
    const config = loadCleanupConfig();
    const approvedRoots = buildApprovedFileRoots(process.cwd());
    const counts = emptyCounts();
    const details: string[] = [];
    const skipped: string[] = [];

    skipped.push(
      'Admin/wallet JWT sessions are stateless (no DB rows); portal IntakeSession cleanup runs separately.',
    );
    skipped.push(
      'No OTP/magic-link/password-reset tables in schema; SiweNonce covers temporary wallet auth.',
    );

    await this.cleanTempFiles(config, approvedRoots, dryRun, counts, details);
    await this.cleanOrphanPreviewFiles(
      config,
      approvedRoots,
      dryRun,
      counts,
      details,
    );
    await this.recoverStuckMediaJobs(config, dryRun, counts, details);
    await this.expireAuthTokens(config, dryRun, counts, details);
    await this.expireIntakeSessions(config, dryRun, counts, details);
    await this.expirePendingPayments(config, dryRun, counts, details);
    await this.rotateApplicationLogs(
      config,
      approvedRoots,
      dryRun,
      counts,
      details,
      skipped,
    );
    await this.purgeAnalyticsEvents(config, dryRun, counts, details);
    await this.purgeAskEvents(config, dryRun, counts, details);
    await this.purgeAutomationRuns(config, dryRun, counts, details);
    await this.cleanRedisQueues(dryRun, counts, details);

    const finishedAt = new Date();
    const report: CleanupReport = {
      dryRun,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      counts,
      details,
      skipped,
    };

    this.logger.log(
      JSON.stringify({
        event: 'cleanup_daily_complete',
        dryRun,
        counts,
        durationMs: report.durationMs,
      }),
    );

    return report;
  }

  private pushDetail(details: string[], line: string): void {
    if (details.length < MAX_DETAIL_LINES) {
      details.push(line);
    }
  }

  private hoursAgo(hours: number): Date {
    return new Date(Date.now() - hours * 3_600_000);
  }

  private daysAgo(days: number): Date {
    return new Date(Date.now() - days * 86_400_000);
  }

  private async listFilesRecursive(dir: string): Promise<string[]> {
    if (!existsSync(dir)) return [];
    const out: string[] = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        out.push(...(await this.listFilesRecursive(full)));
      } else if (ent.isFile()) {
        out.push(full);
      }
    }
    return out;
  }

  private async cleanTempFiles(
    config: ReturnType<typeof loadCleanupConfig>,
    approvedRoots: string[],
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.hoursAgo(config.tempFileHours);
    const tempDirs = config.allowlistedUploadAbsDirs.filter(
      (d) =>
        d.endsWith(`${sep}tmp`) ||
        d.endsWith(`${sep}.temp`) ||
        d.includes(`${sep}tmp${sep}`) ||
        d.includes(`${sep}.temp${sep}`),
    );

    for (const dir of tempDirs) {
      const files = await this.listFilesRecursive(dir);
      for (const file of files) {
        assertDeletableFile(file, approvedRoots);
        const st = await stat(file);
        if (st.mtime >= cutoff) continue;
        if (dryRun) {
          counts.tempFilesDeleted++;
          this.pushDetail(details, `[dry-run] temp file: ${file}`);
          continue;
        }
        await unlink(file);
        counts.tempFilesDeleted++;
        this.pushDetail(details, `deleted temp file: ${file}`);
      }
    }
  }

  private async loadReferencedUploadBasenames(): Promise<Set<string>> {
    const assets = await this.prisma.mediaAsset.findMany({
      select: { fileName: true },
    });
    const refs = new Set(assets.map((a) => a.fileName));

    const jobs = await this.prisma.mediaGenerationJob.findMany({
      where: { status: 'completed', resultPayload: { not: Prisma.DbNull } },
      select: { resultPayload: true },
    });
    for (const job of jobs) {
      const raw = JSON.stringify(job.resultPayload ?? {});
      for (const asset of assets) {
        if (raw.includes(asset.fileName)) {
          refs.add(asset.fileName);
        }
      }
      const matches = raw.match(/[\w-]+\.(png|jpe?g|webp|gif|mp4|webm)/gi);
      if (matches) {
        for (const m of matches) refs.add(basename(m));
      }
    }
    return refs;
  }

  private async cleanOrphanPreviewFiles(
    config: ReturnType<typeof loadCleanupConfig>,
    approvedRoots: string[],
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.hoursAgo(config.orphanAssetHours);
    const orphanDirs = config.allowlistedUploadAbsDirs.filter(
      (d) =>
        d.endsWith(`${sep}previews`) ||
        d.endsWith(`${sep}samples`) ||
        d.includes(`${sep}previews${sep}`) ||
        d.includes(`${sep}samples${sep}`),
    );
    const referenced = await this.loadReferencedUploadBasenames();

    for (const dir of orphanDirs) {
      const files = await this.listFilesRecursive(dir);
      for (const file of files) {
        assertDeletableFile(file, approvedRoots);
        const name = basename(file);
        if (!ORPHAN_NAME_PREFIX.test(name)) continue;
        if (referenced.has(name)) continue;
        const st = await stat(file);
        if (st.mtime >= cutoff) continue;

        if (dryRun) {
          counts.orphanAssetsDeleted++;
          this.pushDetail(details, `[dry-run] orphan asset: ${file}`);
          continue;
        }
        await unlink(file);
        counts.orphanAssetsDeleted++;
        this.pushDetail(details, `deleted orphan asset: ${file}`);
      }
    }
  }

  private async refundJobIfDebited(jobId: string): Promise<void> {
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
        `Cleanup refund failed for job ${jobId}: ${(e as Error).message}`,
      );
    }
  }

  private async recoverStuckMediaJobs(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.hoursAgo(config.stuckJobHours);
    const stuck = await this.prisma.mediaGenerationJob.findMany({
      where: {
        status: { in: ['queued', 'running'] },
        OR: [
          { startedAt: { lt: cutoff } },
          { AND: [{ startedAt: null }, { createdAt: { lt: cutoff } }] },
        ],
      },
      select: { id: true, status: true },
    });

    for (const job of stuck) {
      if (dryRun) {
        counts.stuckJobsFailed++;
        this.pushDetail(
          details,
          `[dry-run] would fail stuck job ${job.id} (${job.status})`,
        );
        continue;
      }
      await this.prisma.mediaGenerationJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage:
            'Recovered by daily cleanup: exceeded stuck-job threshold',
          errorPayload: {
            code: 'CLEANUP_STUCK_JOB',
            previousStatus: job.status,
          },
        },
      });
      await this.refundJobIfDebited(job.id);
      counts.stuckJobsFailed++;
      this.pushDetail(details, `failed stuck job: ${job.id}`);
    }
  }

  private async expireAuthTokens(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.hoursAgo(config.authTokenHours);
    const where = {
      OR: [
        { expiresAt: { lt: new Date() } },
        { consumedAt: { not: null, lt: cutoff } },
      ],
    };

    if (dryRun) {
      const n = await this.prisma.siweNonce.count({ where });
      counts.authTokensDeleted = n;
      if (n > 0) {
        this.pushDetail(
          details,
          `[dry-run] would delete ${n} SiweNonce row(s)`,
        );
      }
      return;
    }

    const result = await this.prisma.siweNonce.deleteMany({ where });
    counts.authTokensDeleted = result.count;
    if (result.count > 0) {
      this.pushDetail(details, `deleted ${result.count} SiweNonce row(s)`);
    }
  }

  private async expireIntakeSessions(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.daysAgo(7);
    const where = {
      completedAt: null,
      createdAt: { lt: cutoff },
    };

    if (dryRun) {
      const n = await this.prisma.intakeSession.count({ where });
      counts.portalSessionsExpired = n;
      counts.intakeSessionsDeleted = n;
      if (n > 0) {
        this.pushDetail(
          details,
          `[dry-run] would delete ${n} stale IntakeSession row(s)`,
        );
      }
      return;
    }

    const result = await this.prisma.intakeSession.deleteMany({ where });
    counts.portalSessionsExpired = result.count;
    counts.intakeSessionsDeleted = result.count;
    if (result.count > 0) {
      this.pushDetail(
        details,
        `deleted ${result.count} stale IntakeSession row(s)`,
      );
    }
  }

  private async expirePendingPayments(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.daysAgo(config.paymentPendingDays);
    const where = {
      status: 'pending' as const,
      createdAt: { lt: cutoff },
    };

    if (dryRun) {
      const n = await this.prisma.payment.count({ where });
      counts.paymentsMarkedExpired = n;
      if (n > 0) {
        this.pushDetail(
          details,
          `[dry-run] would mark ${n} Payment row(s) expired (no deletes)`,
        );
      }
      return;
    }

    const result = await this.prisma.payment.updateMany({
      where,
      data: { status: 'expired' },
    });
    counts.paymentsMarkedExpired = result.count;
    if (result.count > 0) {
      this.pushDetail(
        details,
        `marked ${result.count} Payment row(s) expired (rows retained)`,
      );
    }
  }

  private async rotateApplicationLogs(
    config: ReturnType<typeof loadCleanupConfig>,
    approvedRoots: string[],
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
    skipped: string[],
  ): Promise<void> {
    if (!existsSync(config.logsDir)) {
      skipped.push(
        `Log directory missing (${config.logsDir}); skipped log rotation.`,
      );
      return;
    }

    const normalCutoff = this.daysAgo(config.logRetentionDays);
    const errorCutoff = this.daysAgo(config.logRetentionDays * 2);
    const files = await this.listFilesRecursive(config.logsDir);

    for (const file of files) {
      if (!file.endsWith('.log')) continue;
      assertDeletableFile(file, approvedRoots);
      const name = basename(file);
      const isError = /error/i.test(name);
      const cutoff = isError ? errorCutoff : normalCutoff;
      const st = await stat(file);
      if (st.mtime >= cutoff) continue;

      if (dryRun) {
        counts.logFilesRotated++;
        this.pushDetail(details, `[dry-run] would remove log: ${file}`);
        continue;
      }
      await unlink(file);
      counts.logFilesRotated++;
      this.pushDetail(details, `removed log: ${file}`);
    }
  }

  private async purgeAnalyticsEvents(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.daysAgo(config.analyticsRetentionDays);
    const where = { createdAt: { lt: cutoff } };

    if (dryRun) {
      const n = await this.prisma.studioEvent.count({ where });
      counts.analyticsEventsDeleted = n;
      if (n > 0) {
        this.pushDetail(
          details,
          `[dry-run] would delete ${n} StudioEvent row(s) older than retention`,
        );
      }
      return;
    }

    const result = await this.prisma.studioEvent.deleteMany({ where });
    counts.analyticsEventsDeleted = result.count;
    if (result.count > 0) {
      this.pushDetail(details, `deleted ${result.count} StudioEvent row(s)`);
    }
  }

  private async purgeAskEvents(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.daysAgo(config.analyticsRetentionDays);
    const where = { createdAt: { lt: cutoff } };

    if (dryRun) {
      const n = await this.prisma.aiStudioAskEvent.count({ where });
      counts.askEventsDeleted = n;
      if (n > 0) {
        this.pushDetail(
          details,
          `[dry-run] would delete ${n} AiStudioAskEvent row(s)`,
        );
      }
      return;
    }

    const result = await this.prisma.aiStudioAskEvent.deleteMany({ where });
    counts.askEventsDeleted = result.count;
    if (result.count > 0) {
      this.pushDetail(
        details,
        `deleted ${result.count} AiStudioAskEvent row(s)`,
      );
    }
  }

  private async purgeAutomationRuns(
    config: ReturnType<typeof loadCleanupConfig>,
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const cutoff = this.daysAgo(config.logRetentionDays);
    const where = { createdAt: { lt: cutoff } };

    if (dryRun) {
      const n = await this.prisma.automationRun.count({ where });
      counts.automationRunsDeleted = n;
      if (n > 0) {
        this.pushDetail(
          details,
          `[dry-run] would delete ${n} AutomationRun row(s)`,
        );
      }
      return;
    }

    const result = await this.prisma.automationRun.deleteMany({ where });
    counts.automationRunsDeleted = result.count;
    if (result.count > 0) {
      this.pushDetail(details, `deleted ${result.count} AutomationRun row(s)`);
    }
  }

  private async cleanRedisQueues(
    dryRun: boolean,
    counts: CleanupCategoryCounts,
    details: string[],
  ): Promise<void> {
    const conn = bullmqConnectionOptions();
    if (!conn) {
      details.push('Redis unavailable; skipped BullMQ queue clean.');
      return;
    }

    const graceMs = 86_400_000;
    const queueNames = ['media-generate', 'ai-jobs'];

    for (const name of queueNames) {
      const queue = new Queue(name, { connection: conn });
      try {
        if (dryRun) {
          const completed = await queue.getJobs(['completed'], 0, 200);
          const failed = await queue.getJobs(['failed'], 0, 200);
          const old = [...completed, ...failed].filter((j) => {
            const t = j.finishedOn ?? j.timestamp ?? 0;
            return Date.now() - t > graceMs;
          });
          counts.redisQueueJobsCleaned += old.length;
          if (old.length > 0) {
            this.pushDetail(
              details,
              `[dry-run] would clean ${old.length} BullMQ job(s) from ${name}`,
            );
          }
        } else {
          const removedCompleted = await queue.clean(
            graceMs,
            1000,
            'completed',
          );
          const removedFailed = await queue.clean(graceMs, 1000, 'failed');
          const n = removedCompleted.length + removedFailed.length;
          counts.redisQueueJobsCleaned += n;
          if (n > 0) {
            this.pushDetail(details, `cleaned ${n} BullMQ job(s) from ${name}`);
          }
        }
      } finally {
        await queue.close();
      }
    }
  }
}
