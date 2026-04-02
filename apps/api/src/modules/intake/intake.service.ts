import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CrmBudgetRange,
  CrmBusinessType,
  CrmLeadSource,
  CrmServiceType,
  CrmTeamSize,
  CrmTimeline,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LeadsService } from '../leads/leads.service';
import type { IntakeAnswerDto } from './dto/intake-answer.dto';
import type { IntakeCompleteDto } from './dto/intake-complete.dto';
import type { IntakeStartDto } from './dto/intake-start.dto';
import {
  firstStepKey,
  nextStepId,
  questionsForStep,
  stepsForBranch,
} from './intake.flow';

function pickEnum<T extends string>(allowed: readonly T[], v: string, fallback: T): T {
  return allowed.includes(v as T) ? (v as T) : fallback;
}

const BUDGETS = Object.values(CrmBudgetRange);
const TIMELINES = Object.values(CrmTimeline);
const BIZ = Object.values(CrmBusinessType);
const TEAMS = Object.values(CrmTeamSize);
const SERVICES = Object.values(CrmServiceType);

@Injectable()
export class IntakeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly leads: LeadsService,
  ) {}

  async start(dto: IntakeStartDto) {
    const branch = dto.branch ?? 'GENERAL';
    const stepKey = firstStepKey(branch);
    const session = await this.prisma.intakeSession.create({
      data: {
        branch,
        stepKey,
        answersJson: {},
      },
    });
    return {
      sessionId: session.id,
      branch,
      stepKey,
      questions: questionsForStep(branch, stepKey),
      done: false,
    };
  }

  async answer(body: IntakeAnswerDto) {
    const session = await this.prisma.intakeSession.findUnique({
      where: { id: body.sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.completedAt) {
      throw new BadRequestException('Session already completed');
    }

    let branch = session.branch;
    const mergedAnswers = {
      ...(session.answersJson as Record<string, string>),
      ...body.answers,
    };
    const qs = questionsForStep(branch, session.stepKey);
    for (const q of qs) {
      const val = mergedAnswers[q.key];
      if (val === undefined || String(val).trim() === '') {
        throw new BadRequestException(`Missing answer for ${q.key}`);
      }
    }

    if (branch === 'GENERAL' && session.stepKey === 'service_line') {
      const sel = mergedAnswers.serviceType;
      branch = pickEnum(SERVICES, sel, 'GENERAL');
    }

    let nxt: string | null;
    if (
      session.branch === 'GENERAL' &&
      session.stepKey === 'service_line' &&
      branch !== 'GENERAL'
    ) {
      nxt = stepsForBranch(branch)[0]?.id ?? null;
    } else {
      nxt = nextStepId(branch, session.stepKey);
    }

    const nextStepKey = nxt ?? '_done';

    await this.prisma.intakeSession.update({
      where: { id: session.id },
      data: {
        branch,
        answersJson: mergedAnswers,
        stepKey: nextStepKey,
      },
    });

    if (!nxt) {
      return {
        sessionId: session.id,
        branch,
        stepKey: '_done',
        questions: [] as ReturnType<typeof questionsForStep>,
        done: true,
      };
    }

    return {
      sessionId: session.id,
      branch,
      stepKey: nxt,
      questions: questionsForStep(branch, nxt),
      done: false,
    };
  }

  async complete(dto: IntakeCompleteDto) {
    const session = await this.prisma.intakeSession.findUnique({
      where: { id: dto.sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.completedAt) {
      throw new BadRequestException('Session already completed');
    }
    if (session.stepKey !== '_done') {
      throw new BadRequestException('Complete all intake steps first');
    }

    const answers = session.answersJson as Record<string, string>;
    let branch = session.branch;
    if (branch === 'GENERAL' && answers.serviceType) {
      branch = pickEnum(SERVICES, answers.serviceType, 'GENERAL');
    }

    const budgetRange = pickEnum(
      BUDGETS,
      answers.budgetRange ?? 'UNSPECIFIED',
      'UNSPECIFIED',
    );
    const timeline = pickEnum(
      TIMELINES,
      answers.timeline ?? 'UNSPECIFIED',
      'UNSPECIFIED',
    );
    const businessType = pickEnum(
      BIZ,
      answers.businessType ?? 'UNSPECIFIED',
      'UNSPECIFIED',
    );
    const teamSize = pickEnum(
      TEAMS,
      answers.teamSize ?? 'UNSPECIFIED',
      'UNSPECIFIED',
    );

    const created = await this.leads.createQualified({
      fullName: dto.fullName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim(),
      whatsapp: dto.whatsapp?.trim(),
      company: dto.company?.trim(),
      jobTitle: dto.jobTitle?.trim(),
      country: dto.country?.trim(),
      city: dto.city?.trim(),
      serviceType: branch,
      subServiceType: answers.subServiceType?.trim() || null,
      businessType,
      teamSize,
      budgetRange,
      timeline,
      projectScope: answers.projectScope?.trim() || null,
      message: null,
      source: 'INTAKE' as CrmLeadSource,
      locale: dto.locale ?? null,
      referrer: undefined,
      landingPage: undefined,
    });

    const lead = await this.prisma.lead.findUnique({
      where: { id: created.id },
    });
    if (!lead) throw new Error('Lead persistence failed');

    await this.leads.bulkUpsertAnswers(lead.id, answers);

    await this.prisma.intakeSession.update({
      where: { id: session.id },
      data: {
        completedAt: new Date(),
        leadId: lead.id,
        branch,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'INTAKE_COMPLETED',
        payload: { sessionId: session.id },
      },
    });

    return {
      ok: true,
      leadId: lead.id,
      score: lead.score,
      priority: lead.priority,
      serviceType: lead.serviceType,
      summary: {
        headline: 'Thank you — Estio will review your brief.',
        score: lead.score,
        priority: lead.priority,
      },
    };
  }
}
