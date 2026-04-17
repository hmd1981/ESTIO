import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MediaAdminController } from './media.admin.controller';
import { MediaController } from './media.controller';
import { MediaJobsController } from './media-jobs.controller';
import { MediaJobsService } from './media-jobs.service';
import { MediaWorkerService } from './media-worker.service';
import { MediaService } from './media.service';

@Module({
  imports: [AuthModule, HttpModule],
  controllers: [
    MediaController,
    MediaJobsController,
    MediaAdminController,
  ],
  providers: [MediaService, MediaWorkerService, MediaJobsService],
  exports: [MediaService],
})
export class MediaModule {}
