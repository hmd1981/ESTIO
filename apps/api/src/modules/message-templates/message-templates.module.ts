import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MessageTemplatesAdminController } from './message-templates.admin.controller';
import { MessageTemplatesService } from './message-templates.service';

@Module({
  imports: [AuthModule],
  controllers: [MessageTemplatesAdminController],
  providers: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
