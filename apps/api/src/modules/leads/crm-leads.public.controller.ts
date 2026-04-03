import { Body, Controller, Post } from '@nestjs/common';
import { CreateLeadFromAiStudioDto } from './dto/create-lead-from-ai-studio.dto';
import { LeadsService } from './leads.service';

@Controller('crm/leads')
export class CrmLeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post('from-ai-studio')
  createFromAiStudio(@Body() dto: CreateLeadFromAiStudioDto) {
    return this.leadsService.createFromAiStudio(dto);
  }
}
