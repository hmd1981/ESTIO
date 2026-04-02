import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  AutomationRunStatus,
  AutomationRunType,
  CrmLeadStatus,
  CrmPipelineStage,
  LeadActivityType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SalesSettingsService } from '../sales-settings/sales-settings.service';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SalesSettingsService,
  ) {}

  /** Run after a lead is persisted — acknowledgement + default assignment. */
  async onNewLead(leadId: string) {
    const settings = await this.settings.get();
    const owner = settings.defaultOwnerUserId?.trim();

    if (owner) {
      await this.prisma.leadAssignment.create({
        data: {
          leadId,
          assigneeUserId: owner,
          assignedBy: 'automation',
        },
      });
      await this.prisma.lead.update({
        where: { id: leadId },
        data: { ownerUserId: owner },
      });
      await this.logRun({
        leadId,
        type: 'ASSIGNMENT',
        status: 'SUCCESS',
        message: `Assigned to default owner ${owner}`,
      });
    } else {
      await this.logRun({
        leadId,
        type: 'ASSIGNMENT',
        status: 'SKIPPED',
        message: 'No defaultOwnerUserId configured',
      });
    }

    await this.logRun({
      leadId,
      type: 'NEW_LEAD_ACK',
      status: 'SUCCESS',
      message: 'Lead recorded; notify channel from sales playbook.',
    });
  }

  async logRun(input: {
    leadId?: string | null;
    taskId?: string | null;
    type: AutomationRunType;
    status: AutomationRunStatus;
    message?: string;
    payload?: object;
  }) {
    return this.prisma.automationRun.create({
      data: {
        leadId: input.leadId ?? undefined,
        taskId: input.taskId ?? undefined,
        type: input.type,
        status: input.status,
        message: input.message?.slice(0, 2000),
        payload: input.payload as object | undefined,
      },
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hourlyChecks() {
    const settings = await this.settings.get();
    const now = new Date();
    const staleBefore = new Date(now);
    staleBefore.setDate(staleBefore.getDate() - settings.staleLeadDays);

    const stale = await this.prisma.lead.findMany({
      where: {
        status: { notIn: ['WON', 'LOST'] },
        stage: { notIn: ['WON', 'LOST'] },
        updatedAt: { lt: staleBefore },
      },
      take: 50,
      select: { id: true },
    });

    for (const row of stale) {
      await this.logRun({
        leadId: row.id,
        type: 'STALE_LEAD',
        status: 'SUCCESS',
        message: `No update in ${settings.staleLeadDays} days`,
      });
      await this.prisma.leadActivity.create({
        data: {
          leadId: row.id,
          type: 'AUTOMATION',
          payload: { kind: 'STALE_LEAD' },
        },
      });
    }

    const overdueFollowups = await this.prisma.lead.findMany({
      where: {
        nextFollowUpAt: { lt: now },
        status: { notIn: ['WON', 'LOST'] },
      },
      take: 50,
      select: { id: true },
    });

    for (const row of overdueFollowups) {
      await this.logRun({
        leadId: row.id,
        type: 'FOLLOWUP_DUE',
        status: 'SUCCESS',
        message: 'nextFollowUpAt passed',
      });
    }

    const proposalStale = new Date(now);
    proposalStale.setDate(
      proposalStale.getDate() - settings.proposalFollowUpDays,
    );
    const proposals = await this.prisma.proposalRecord.findMany({
      where: {
        status: 'SENT',
        sentAt: { lt: proposalStale },
      },
      take: 30,
      select: { id: true, leadId: true, reference: true },
    });

    for (const p of proposals) {
      await this.logRun({
        leadId: p.leadId,
        type: 'PROPOSAL_FOLLOWUP',
        status: 'SUCCESS',
        message: `Proposal ${p.reference} awaiting follow-up`,
        payload: { proposalId: p.id },
      });
    }

    this.logger.debug(
      `Automation hourly: stale=${stale.length} followups=${overdueFollowups.length} proposals=${proposals.length}`,
    );
  }

  /** Call from lead patch when moving to LOST. */
  async enforceLostReason(
    leadId: string,
    lostReason: string,
    settingsLostRequired: boolean,
  ) {
    if (!settingsLostRequired) return;
    if (lostReason === 'UNSPECIFIED') {
      await this.logRun({
        leadId,
        type: 'LOST_REASON_ENFORCE',
        status: 'FAILED',
        message: 'Lost reason required before closing as LOST',
      });
    } else {
      await this.logRun({
        leadId,
        type: 'LOST_REASON_ENFORCE',
        status: 'SUCCESS',
        message: `Lost reason recorded: ${lostReason}`,
      });
    }
  }

  mapStageToStatusOnWinLoss(stage: CrmPipelineStage): CrmLeadStatus | null {
    if (stage === 'WON') return 'WON';
    if (stage === 'LOST') return 'LOST';
    return null;
  }

  async appendActivity(
    leadId: string,
    type: LeadActivityType,
    payload?: object,
  ) {
    return this.prisma.leadActivity.create({
      data: {
        leadId,
        type,
        payload: payload as object | undefined,
      },
    });
  }
}
