import { Body, Controller, Post } from '@nestjs/common';
import { CreateLeadPublicDto } from './dto/create-lead-public.dto';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsPublicController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadPublicDto) {
    return this.leadsService.createPublic(dto);
  }
}
