import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin/automation-runs')
@UseGuards(JwtAuthGuard)
export class AutomationRunsAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('leadId') leadId?: string) {
    return this.prisma.automationRun.findMany({
      where: leadId ? { leadId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        lead: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }
}
