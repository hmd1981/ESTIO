import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import { PatchMessageTemplateDto } from './dto/patch-message-template.dto';
import { MessageTemplatesService } from './message-templates.service';

@Controller('admin/templates')
@UseGuards(JwtAuthGuard)
export class MessageTemplatesAdminController {
  constructor(private readonly templates: MessageTemplatesService) {}

  @Get()
  findAll() {
    return this.templates.findAll();
  }

  @Post()
  create(@Body() dto: CreateMessageTemplateDto) {
    return this.templates.create(dto);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: PatchMessageTemplateDto) {
    return this.templates.patch(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templates.remove(id);
  }
}
