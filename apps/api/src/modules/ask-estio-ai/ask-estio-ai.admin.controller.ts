import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AskEstioAiService } from './ask-estio-ai.service';

@Controller('admin/ask-estio-ai')
@UseGuards(JwtAuthGuard)
export class AskEstioAiAdminController {
  constructor(private readonly svc: AskEstioAiService) {}

  @Get('summary')
  summary(@Query('days') days?: string) {
    const n = Number(days);
    return this.svc.getAdminSummary(Number.isFinite(n) ? n : 30);
  }

  @Get('insights')
  insights(@Query('days') days?: string) {
    const n = Number(days);
    return this.svc.getAdminInsights(Number.isFinite(n) ? n : 30);
  }
}
