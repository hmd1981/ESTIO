import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { LeadTaskStatus } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../automation/automation.service';

@Controller('admin/tasks')
@UseGuards(JwtAuthGuard)
export class CrmTasksAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automation: AutomationService,
  ) {}

  @Get()
  list(@Query('status') statusRaw?: string) {
    const status =
      statusRaw &&
      Object.values(LeadTaskStatus).includes(statusRaw as LeadTaskStatus)
        ? (statusRaw as LeadTaskStatus)
        : undefined;
    return this.prisma.leadTask.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
      take: 300,
      include: {
        lead: {
          select: {
            id: true,
            fullName: true,
            email: true,
            stage: true,
            serviceType: true,
          },
        },
      },
    });
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body()
    dto: {
      status?: 'OPEN' | 'DONE' | 'CANCELLED';
      dueAt?: string | null;
    },
  ) {
    const row = await this.prisma.leadTask.findUnique({ where: { id } });
    if (!row) {
      // Mirror other controllers: 404 via NotFoundException (kept simple here).
      return { ok: false, error: 'Task not found' };
    }

    const data: { status?: LeadTaskStatus; dueAt?: Date | null; completedAt?: Date | null } =
      {};
    if (dto.status && Object.values(LeadTaskStatus).includes(dto.status as LeadTaskStatus)) {
      data.status = dto.status as LeadTaskStatus;
      data.completedAt = dto.status === 'DONE' ? new Date() : null;
    }
    if (dto.dueAt !== undefined) {
      data.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    }

    const updated = await this.prisma.leadTask.update({
      where: { id },
      data,
      include: { lead: { select: { id: true } } },
    });

    if (updated.lead?.id) {
      if (data.status === 'DONE') {
        await this.automation.appendActivity(updated.lead.id, 'TASK_COMPLETED', {
          taskId: updated.id,
          title: updated.title,
        });
      } else if (data.status) {
        await this.automation.appendActivity(updated.lead.id, 'FIELD_UPDATED', {
          fields: ['task.status'],
          taskId: updated.id,
          to: data.status,
        });
      }
    }

    return updated;
  }
}
