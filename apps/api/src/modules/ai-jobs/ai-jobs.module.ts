import { Module } from '@nestjs/common';
import { WorkstationModule } from '../workstation/workstation.module';
import { AiJobsController } from './ai-jobs.controller';
import { AiJobsRateLimitService } from './ai-jobs-rate-limit.service';
import { AiJobsService } from './ai-jobs.service';

@Module({
  imports: [WorkstationModule],
  controllers: [AiJobsController],
  providers: [AiJobsService, AiJobsRateLimitService],
  exports: [AiJobsService],
})
export class AiJobsModule {}
