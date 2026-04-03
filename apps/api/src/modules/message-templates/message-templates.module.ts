import { Module, type OnModuleInit } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MessageTemplatesAdminController } from './message-templates.admin.controller';
import { MessageTemplatesService } from './message-templates.service';

@Module({
  imports: [AuthModule],
  controllers: [MessageTemplatesAdminController],
  providers: [MessageTemplatesService],
  exports: [MessageTemplatesService],
})
export class MessageTemplatesModule implements OnModuleInit {
  constructor(private readonly service: MessageTemplatesService) {}

  async onModuleInit() {
    await this.service.seedDefaults();
  }
}
