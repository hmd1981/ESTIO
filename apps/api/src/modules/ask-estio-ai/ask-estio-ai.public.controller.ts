import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AiStudioAskDto } from './dto/ai-studio-ask.dto';
import { AskInteractionDto } from './dto/ask-interaction.dto';
import { AskEstioAiService } from './ask-estio-ai.service';

@Controller('public/ai-studio')
export class AskEstioAiPublicController {
  constructor(private readonly svc: AskEstioAiService) {}

  @Post('ask')
  async ask(@Body() dto: AiStudioAskDto, @Req() req: Request) {
    try {
      return await this.svc.ask(dto, req);
    } catch (e) {
      if (e instanceof HttpException) throw e;
      throw new HttpException(
        { error: 'ask_failed' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('ask-interaction')
  async interaction(@Body() dto: AskInteractionDto) {
    return this.svc.recordInteraction(dto);
  }
}
