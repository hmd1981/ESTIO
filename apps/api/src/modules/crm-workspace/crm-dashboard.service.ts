import { Injectable } from '@nestjs/common';
import { CrmPipelineStage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CrmDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async snapshot() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [total, newToday, byStage, openTasks, overdueFollowups] =
      await Promise.all([
        this.prisma.lead.count(),
        this.prisma.lead.count({ where: { createdAt: { gte: today } } }),
        this.prisma.lead.groupBy({
          by: ['stage'],
          _count: { id: true },
          where: {
            stage: { notIn: [CrmPipelineStage.LOST, CrmPipelineStage.WON] },
          },
        }),
        this.prisma.leadTask.count({
          where: { status: 'OPEN' },
        }),
        this.prisma.lead.count({
          where: {
            nextFollowUpAt: { lt: new Date() },
            status: { notIn: ['WON', 'LOST'] },
          },
        }),
      ]);

    return {
      totalLeads: total,
      newLeadsToday: newToday,
      pipelineOpenByStage: Object.fromEntries(
        byStage.map((r) => [r.stage, r._count.id]),
      ),
      openTasks,
      overdueFollowups,
    };
  }
}
