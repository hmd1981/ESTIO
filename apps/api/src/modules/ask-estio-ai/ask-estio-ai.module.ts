import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AskEstioAiAdminController } from './ask-estio-ai.admin.controller';
import { AskEstioAiPublicController } from './ask-estio-ai.public.controller';
import { AskEstioAiRateLimitService } from './ask-estio-ai-rate-limit.service';
import { AskEstioAiService } from './ask-estio-ai.service';
import { DeepseekAskClient } from './deepseek-ask.client';

@Module({
  imports: [PrismaModule],
  controllers: [AskEstioAiPublicController, AskEstioAiAdminController],
  providers: [AskEstioAiService, AskEstioAiRateLimitService, DeepseekAskClient],
  exports: [AskEstioAiService],
})
export class AskEstioAiModule {}
