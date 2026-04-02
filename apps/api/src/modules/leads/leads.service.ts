import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type {
  CrmLeadStatus,
  CrmPipelineStage,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AutomationService } from '../automation/automation.service';
import { SalesSettingsService } from '../sales-settings/sales-settings.service';
import type { CreateLeadResponse } from './contracts/leads.port';
import type { CreateLeadCompleteInput } from './types/create-lead-complete.input';
import type { CreateLeadPublicDto } from './dto/create-lead-public.dto';
import type { CreateLeadNoteDto } from './dto/create-lead-note.dto';
import type { CreateLeadTaskDto } from './dto/create-lead-task.dto';
import type { PatchLeadAdminDto } from './dto/patch-lead-admin.dto';
import type { PatchLeadStageDto } from './dto/patch-lead-stage.dto';
import type { PatchLeadStatusDto } from './dto/patch-lead-status.dto';
import { LeadScoringService } from './lead-scoring.service';
import { resolveServiceType } from './lib/legacy-service-interest';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: LeadScoringService,
    private readonly automation: AutomationService,
    private readonly salesSettings: SalesSettingsService,
  ) {}

  async createPublic(dto: CreateLeadPublicDto): Promise<CreateLeadResponse> {
    const serviceType = resolveServiceType({
      serviceType: dto.serviceType,
      legacyServiceInterest: dto.serviceInterest,
    });
    return this.createInternal({
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim(),
      whatsapp: dto.whatsapp?.trim(),
      company: dto.company?.trim(),
      jobTitle: dto.jobTitle?.trim(),
      country: dto.country?.trim(),
      city: dto.city?.trim(),
      serviceType,
      subServiceType: dto.subServiceType?.trim(),
      projectScope: dto.projectScope?.trim(),
      message: dto.message?.trim(),
      source: dto.source,
      locale: dto.locale,
      referrer: dto.referrer?.trim(),
      landingPage: dto.landingPage?.trim(),
      campaignSource: dto.campaignSource?.trim(),
      campaignMedium: dto.campaignMedium?.trim(),
      campaignName: dto.campaignName?.trim(),
      budgetRange: 'UNSPECIFIED',
      timeline: 'UNSPECIFIED',
      businessType: 'UNSPECIFIED',
      teamSize: 'UNSPECIFIED',
    });
  }

  /** Intake completion + internal qualified creates. */
  async createQualified(input: CreateLeadCompleteInput): Promise<CreateLeadResponse> {
    return this.createInternal(input);
  }

  private async createInternal(
    input: CreateLeadCompleteInput,
  ): Promise<CreateLeadResponse> {
    const settings = await this.salesSettings.get();
    const scored = this.scoring.compute(
      {
        serviceType: input.serviceType,
        budgetRange: input.budgetRange,
        timeline: input.timeline,
        teamSize: input.teamSize,
        businessType: input.businessType,
        phone: input.phone,
        whatsapp: input.whatsapp,
        company: input.company,
        jobTitle: input.jobTitle,
        country: input.country,
        city: input.city,
        projectScope: input.projectScope,
      },
      settings.scoringRules,
    );

    const lead = await this.prisma.lead.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        company: input.company ?? null,
        jobTitle: input.jobTitle ?? null,
        country: input.country ?? null,
        city: input.city ?? null,
        serviceType: input.serviceType,
        subServiceType: input.subServiceType ?? null,
        businessType: input.businessType,
        teamSize: input.teamSize,
        budgetRange: input.budgetRange,
        timeline: input.timeline,
        projectScope: input.projectScope ?? null,
        message: input.message ?? null,
        source: input.source,
        locale: input.locale ?? null,
        referrer: input.referrer ?? null,
        landingPage: input.landingPage ?? null,
        campaignSource: input.campaignSource ?? null,
        campaignMedium: input.campaignMedium ?? null,
        campaignName: input.campaignName ?? null,
        score: scored.score,
        priority: scored.priority,
        scoreBreakdown: scored.breakdown as Prisma.InputJsonValue,
        status: 'NEW',
        stage: 'INBOX',
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'CREATED',
        payload: { source: input.source, serviceType: input.serviceType },
      },
    });

    await this.automation.onNewLead(lead.id);

    this.logger.log(
      `Lead created id=${lead.id} source=${lead.source} service=${lead.serviceType} score=${lead.score}`,
    );

    return {
      ok: true,
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
    };
  }

  findAllAdmin(filter?: {
    status?: CrmLeadStatus;
    stage?: CrmPipelineStage;
    q?: string;
  }) {
    const where: Prisma.LeadWhereInput = {};
    if (filter?.status) where.status = filter.status;
    if (filter?.stage) where.stage = filter.stage;
    if (filter?.q?.trim()) {
      const q = filter.q.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        answers: { orderBy: { createdAt: 'asc' } },
        notes: { orderBy: { createdAt: 'desc' }, take: 100 },
        activities: { orderBy: { createdAt: 'desc' }, take: 200 },
        tasks: { orderBy: [{ status: 'asc' }, { dueAt: 'asc' }], take: 100 },
        assignments: { orderBy: { assignedAt: 'desc' }, take: 30 },
        proposals: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!lead) throw new NotFoundException(`Lead not found: ${id}`);
    return lead;
  }

  async updateAdmin(id: string, dto: PatchLeadAdminDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Lead not found: ${id}`);

    if (dto.ownerUserId !== undefined) {
      const owner = dto.ownerUserId?.trim() || null;
      if (owner) {
        const u = await this.prisma.crmUser.findUnique({ where: { id: owner } });
        if (!u || !u.isActive) {
          throw new BadRequestException('Invalid ownerUserId');
        }
      }
    }

    const settings = await this.salesSettings.get();
    if (
      dto.status === 'LOST' &&
      settings.lostReasonWhenLostRequired &&
      (dto.lostReason === undefined || dto.lostReason === 'UNSPECIFIED')
    ) {
      throw new BadRequestException(
        'lostReason is required when marking a lead as LOST',
      );
    }

    const data = this.patchDtoToPrisma(dto);
    const rescore =
      dto.serviceType !== undefined ||
      dto.budgetRange !== undefined ||
      dto.timeline !== undefined ||
      dto.teamSize !== undefined ||
      dto.businessType !== undefined ||
      dto.phone !== undefined ||
      dto.whatsapp !== undefined ||
      dto.company !== undefined ||
      dto.jobTitle !== undefined ||
      dto.country !== undefined ||
      dto.city !== undefined ||
      dto.projectScope !== undefined;

    let nextScore = existing.score;
    let nextPriority = existing.priority;
    let nextBreakdown = existing.scoreBreakdown;

    if (rescore) {
      delete (data as { score?: unknown }).score;
      delete (data as { priority?: unknown }).priority;
      delete (data as { scoreBreakdown?: unknown }).scoreBreakdown;
      const merged = {
        serviceType: dto.serviceType ?? existing.serviceType,
        budgetRange: dto.budgetRange ?? existing.budgetRange,
        timeline: dto.timeline ?? existing.timeline,
        teamSize: dto.teamSize ?? existing.teamSize,
        businessType: dto.businessType ?? existing.businessType,
        phone: dto.phone ?? existing.phone,
        whatsapp: dto.whatsapp ?? existing.whatsapp,
        company: dto.company ?? existing.company,
        jobTitle: dto.jobTitle ?? existing.jobTitle,
        country: dto.country ?? existing.country,
        city: dto.city ?? existing.city,
        projectScope: dto.projectScope ?? existing.projectScope,
      };
      const s = this.scoring.compute(merged, settings.scoringRules);
      nextScore = s.score;
      nextPriority = s.priority;
      nextBreakdown = s.breakdown as object;
      Object.assign(data, {
        score: nextScore,
        priority: nextPriority,
        scoreBreakdown: nextBreakdown as Prisma.InputJsonValue,
      });
    }

    try {
      const ownerChanged =
        dto.ownerUserId !== undefined && dto.ownerUserId !== existing.ownerUserId;
      const updated = await this.prisma.lead.update({
        where: { id },
        data,
      });
      await this.automation.appendActivity(id, 'FIELD_UPDATED', {
        fields: Object.keys(dto),
      });
      if (ownerChanged) {
        await this.prisma.leadAssignment.create({
          data: {
            leadId: id,
            assigneeUserId: dto.ownerUserId || null,
            assignedBy: 'admin',
          },
        });
        await this.automation.appendActivity(id, 'FIELD_UPDATED', {
          fields: ['ownerUserId'],
          to: dto.ownerUserId ?? null,
        });
      }
      if (dto.status === 'LOST') {
        await this.automation.enforceLostReason(
          id,
          (dto.lostReason ?? updated.lostReason) as string,
          settings.lostReasonWhenLostRequired,
        );
      }
      return this.findOne(id);
    } catch {
      throw new NotFoundException(`Lead not found: ${id}`);
    }
  }

  async patchStage(id: string, dto: PatchLeadStageDto) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Lead not found: ${id}`);
    const syncStatus = this.automation.mapStageToStatusOnWinLoss(dto.stage);
    const data: Prisma.LeadUpdateInput = { stage: dto.stage };
    if (syncStatus) data.status = syncStatus;
    const updated = await this.prisma.lead.update({ where: { id }, data });
    await this.automation.appendActivity(id, 'STAGE_CHANGED', {
      from: existing.stage,
      to: dto.stage,
    });
    if (syncStatus) {
      await this.automation.appendActivity(id, 'STATUS_CHANGED', {
        to: syncStatus,
      });
    }
    return this.findOne(id);
  }

  async patchStatus(id: string, dto: PatchLeadStatusDto) {
    const settings = await this.salesSettings.get();
    if (
      dto.status === 'LOST' &&
      settings.lostReasonWhenLostRequired &&
      (!dto.lostReason || dto.lostReason === 'UNSPECIFIED')
    ) {
      throw new BadRequestException(
        'lostReason is required when marking a lead as LOST',
      );
    }
    const data: Prisma.LeadUpdateInput = { status: dto.status };
    if (dto.lostReason !== undefined) data.lostReason = dto.lostReason;
    if (dto.status === 'WON' || dto.status === 'LOST') {
      data.stage = dto.status === 'WON' ? 'WON' : 'LOST';
    }
    await this.prisma.lead.update({ where: { id }, data });
    await this.automation.appendActivity(id, 'STATUS_CHANGED', {
      to: dto.status,
    });
    if (dto.status === 'LOST') {
      await this.automation.enforceLostReason(
        id,
        (dto.lostReason ?? 'UNSPECIFIED') as string,
        settings.lostReasonWhenLostRequired,
      );
    }
    return this.findOne(id);
  }

  async addNote(id: string, dto: CreateLeadNoteDto) {
    await this.ensureLead(id);
    await this.prisma.leadNote.create({
      data: {
        leadId: id,
        body: dto.body.trim(),
        authorLabel: dto.authorLabel?.trim(),
      },
    });
    await this.automation.appendActivity(id, 'NOTE_ADDED', {});
    return this.findOne(id);
  }

  async addTask(id: string, dto: CreateLeadTaskDto) {
    await this.ensureLead(id);
    await this.prisma.leadTask.create({
      data: {
        leadId: id,
        title: dto.title.trim(),
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
      },
    });
    await this.automation.appendActivity(id, 'TASK_CREATED', {
      title: dto.title,
    });
    return this.findOne(id);
  }

  async listActivities(id: string) {
    await this.ensureLead(id);
    return this.prisma.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
      take: 300,
    });
  }

  async bulkUpsertAnswers(
    leadId: string,
    answers: Record<string, string>,
    questionMetadata?: Record<string, string>,
  ) {
    await this.ensureLead(leadId);
    const entries = Object.entries(answers);
    for (const [questionKey, value] of entries) {
      await this.prisma.leadAnswer.create({
        data: {
          leadId,
          questionKey,
          valueJson: { v: value, meta: questionMetadata?.[questionKey] },
        },
      });
    }
  }

  private patchDtoToPrisma(dto: PatchLeadAdminDto): Prisma.LeadUpdateInput {
    const data: Prisma.LeadUpdateInput = {};
    const assign = <K extends keyof PatchLeadAdminDto>(key: K) => {
      const v = dto[key];
      if (v !== undefined)
        (data as Record<string, unknown>)[key as string] = v;
    };
    assign('fullName');
    assign('email');
    assign('phone');
    assign('whatsapp');
    assign('company');
    assign('jobTitle');
    assign('country');
    assign('city');
    assign('serviceType');
    assign('subServiceType');
    assign('businessType');
    assign('teamSize');
    assign('budgetRange');
    assign('timeline');
    if (dto.projectScope !== undefined) data.projectScope = dto.projectScope;
    if (dto.message !== undefined) data.message = dto.message;
    assign('status');
    assign('stage');
    assign('score');
    assign('priority');
    if (dto.ownerUserId !== undefined) data.ownerUserId = dto.ownerUserId;
    if (dto.lastContactedAt !== undefined) {
      data.lastContactedAt =
        dto.lastContactedAt === null ? null : new Date(dto.lastContactedAt);
    }
    if (dto.nextFollowUpAt !== undefined) {
      data.nextFollowUpAt =
        dto.nextFollowUpAt === null ? null : new Date(dto.nextFollowUpAt);
    }
    assign('lostReason');
    if (dto.wonValue !== undefined) {
      data.wonValue = dto.wonValue === null ? null : dto.wonValue;
    }
    assign('source');
    assign('locale');
    if (dto.referrer !== undefined) data.referrer = dto.referrer;
    if (dto.landingPage !== undefined) data.landingPage = dto.landingPage;
    return data;
  }

  private async ensureLead(id: string) {
    const exists = await this.prisma.lead.count({ where: { id } });
    if (!exists) throw new NotFoundException(`Lead not found: ${id}`);
  }
}
