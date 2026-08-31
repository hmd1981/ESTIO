import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { CleanupModule } from './modules/cleanup/cleanup.module';
import { CleanupService } from './modules/cleanup/cleanup.service';

async function main(): Promise<void> {
  const dryRun =
    process.argv.includes('--dry-run') ||
    process.env.CLEANUP_DRY_RUN === 'true';

  const app = await NestFactory.createApplicationContext(CleanupModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const cleanup = app.get(CleanupService);
    const report = await cleanup.runDaily({ dryRun });
    // Structured JSON report for log aggregation / dry-run audits.
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err: unknown) => {
  const logger = new Logger('CleanupCLI');
  logger.error(err instanceof Error ? err.stack : String(err));
  process.exit(1);
});
