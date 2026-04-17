import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AiJobsService } from './ai-jobs.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';

@Controller('ai')
export class AiJobsController {
  constructor(private readonly aiJobs: AiJobsService) {}

  @Post('jobs')
  create(@Body() dto: CreateAiJobDto, @Req() req: Request) {
    const forwarded = req.headers['x-forwarded-for'];
    const fromForwarded =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0]?.trim()
        : Array.isArray(forwarded)
          ? forwarded[0]?.trim()
          : undefined;
    const ip = fromForwarded || req.ip || req.socket?.remoteAddress;
    return this.aiJobs.createJob(dto, ip);
  }

  @Get('jobs/:id')
  get(@Param('id') id: string) {
    return this.aiJobs.getJob(id);
  }
}
