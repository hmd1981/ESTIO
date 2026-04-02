import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MediaAdminController } from './media.admin.controller';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';

@Module({
  imports: [AuthModule],
  controllers: [MediaController, MediaAdminController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
