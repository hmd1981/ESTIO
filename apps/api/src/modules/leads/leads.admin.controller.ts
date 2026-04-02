import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CrmLeadStatus,
  CrmPipelineStage,
} from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import { CreateLeadTaskDto } from './dto/create-lead-task.dto';
import { PatchLeadAdminDto } from './dto/patch-lead-admin.dto';
import { PatchLeadStageDto } from './dto/patch-lead-stage.dto';
import { PatchLeadStatusDto } from './dto/patch-lead-status.dto';
import { LeadsService } from './leads.service';

@Controller('admin/leads')
@UseGuards(JwtAuthGuard)
export class LeadsAdminController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  findAll(
    @Query('status') statusRaw?: string,
    @Query('stage') stageRaw?: string,
    @Query('q') q?: string,
  ) {
    const status =
      statusRaw &&
      Object.values(CrmLeadStatus).includes(statusRaw as CrmLeadStatus)
        ? (statusRaw as CrmLeadStatus)
        : undefined;
    const stage =
      stageRaw &&
      Object.values(CrmPipelineStage).includes(stageRaw as CrmPipelineStage)
        ? (stageRaw as CrmPipelineStage)
        : undefined;
    return this.leadsService.findAllAdmin({
      status,
      stage,
      q: q?.trim() || undefined,
    });
  }

  @Get(':id/activities')
  activities(@Param('id') id: string) {
    return this.leadsService.listActivities(id);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body() dto: CreateLeadNoteDto) {
    return this.leadsService.addNote(id, dto);
  }

  @Post(':id/tasks')
  addTask(@Param('id') id: string, @Body() dto: CreateLeadTaskDto) {
    return this.leadsService.addTask(id, dto);
  }

  @Patch(':id/stage')
  patchStage(@Param('id') id: string, @Body() dto: PatchLeadStageDto) {
    return this.leadsService.patchStage(id, dto);
  }

  @Patch(':id/status')
  patchStatus(@Param('id') id: string, @Body() dto: PatchLeadStatusDto) {
    return this.leadsService.patchStatus(id, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: PatchLeadAdminDto) {
    return this.leadsService.updateAdmin(id, dto);
  }
}
