import { Module } from '@nestjs/common';
import { CreditsModule } from '../credits/credits.module';
import { CleanupCronService } from './cleanup-cron.service';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [CreditsModule],
  providers: [CleanupService, CleanupCronService],
  exports: [CleanupService],
})
export class CleanupModule {}
