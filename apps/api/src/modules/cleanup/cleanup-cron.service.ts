import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';

@Injectable()
export class CleanupCronService {
  private readonly log = new Logger(CleanupCronService.name);

  constructor(private readonly cleanup: CleanupService) {}

  /** Daily operational cleanup — 04:00 UTC (after studio analytics rollup at 03:00). */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async runScheduledCleanup(): Promise<void> {
    if (process.env.CLEANUP_CRON_ENABLED === 'false') {
      this.log.log('CLEANUP_CRON_ENABLED=false; skipping scheduled cleanup.');
      return;
    }
    const report = await this.cleanup.runDaily({ dryRun: false });
    this.log.log(
      `scheduled cleanup finished: ${JSON.stringify(report.counts)}`,
    );
  }
}
