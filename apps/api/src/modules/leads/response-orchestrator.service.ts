import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ClassificationResult } from './lead-classification.service';

type LeadSnapshot = {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  serviceType: string;
  subServiceType: string | null;
  source: string;
};

export type RenderedResponse = {
  channel: 'EMAIL' | 'WHATSAPP';
  subject: string | null;
  body: string;
  templateKey: string;
};

const FIRST_NAME_PATTERN = /\{\{firstName\}\}/g;
const COMPANY_PATTERN = /\{\{company\}\}/g;
const SERVICE_PATTERN = /\{\{serviceType\}\}/g;
const MISSING_PATTERN = /\{\{missingFields\}\}/g;
const DEAL_PATH_PATTERN = /\{\{dealPath\}\}/g;
const REASON_PATTERN = /\{\{reason\}\}/g;

@Injectable()
export class ResponseOrchestratorService {
  private readonly logger = new Logger(ResponseOrchestratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async orchestrate(
    lead: LeadSnapshot,
    classification: ClassificationResult,
  ): Promise<{
    responses: RenderedResponse[];
    tasksCreated: string[];
  }> {
    const responses = await this.renderResponses(lead, classification);
    const tasksCreated = await this.createTasks(lead, classification);

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        type: 'AUTOMATION',
        payload: {
          kind: 'CLASSIFICATION',
          classification: classification.classification,
          reason: classification.reason,
          missingFields: classification.missingFields,
          nextAction: classification.nextAction,
          dealPath: classification.dealPath,
          responseTemplateKey: classification.responseTemplateKey,
          urgency: classification.urgency,
          responsesRendered: responses.length,
          tasksCreated: tasksCreated.length,
        },
      },
    });

    await this.prisma.leadNote.create({
      data: {
        leadId: lead.id,
        body: this.buildClassificationNote(classification, responses),
        authorLabel: 'system',
      },
    });

    return { responses, tasksCreated };
  }

  private async renderResponses(
    lead: LeadSnapshot,
    classification: ClassificationResult,
  ): Promise<RenderedResponse[]> {
    const templates = await this.prisma.messageTemplate.findMany({
      where: { name: { startsWith: classification.responseTemplateKey } },
    });

    if (templates.length === 0) {
      const fallback = this.buildFallbackResponse(lead, classification);
      return [fallback];
    }

    return templates.map((tpl) => ({
      channel: tpl.channel as 'EMAIL' | 'WHATSAPP',
      subject: this.interpolate(tpl.subject ?? null, lead, classification),
      body: this.interpolate(tpl.body, lead, classification),
      templateKey: tpl.name,
    }));
  }

  private interpolate(
    text: string | null,
    lead: LeadSnapshot,
    classification: ClassificationResult,
  ): string {
    if (!text) return '';
    const firstName = lead.fullName.split(/\s+/)[0] ?? lead.fullName;
    return text
      .replace(FIRST_NAME_PATTERN, firstName)
      .replace(COMPANY_PATTERN, lead.company ?? '—')
      .replace(SERVICE_PATTERN, this.formatServiceType(lead.serviceType))
      .replace(MISSING_PATTERN, classification.missingFields.join(', '))
      .replace(DEAL_PATH_PATTERN, classification.dealPath ?? '—')
      .replace(REASON_PATTERN, classification.reason);
  }

  private formatServiceType(raw: string): string {
    const map: Record<string, string> = {
      ENTERPRISE_AI: 'Governed Retrieval / Private AI',
      AUTOMATION: 'Workflow Automation',
      WEB: 'Platform Design & Deployment',
      CONTENT: 'Content Operations',
      CAMPAIGNS: 'Campaign Execution',
      AI_CREATIVE: 'Governed AI Creative',
      GENERAL: 'General',
    };
    return map[raw] ?? raw;
  }

  private async createTasks(
    lead: LeadSnapshot,
    classification: ClassificationResult,
  ): Promise<string[]> {
    const tasks: { title: string; dueHours: number }[] = [];

    switch (classification.nextAction) {
      case 'SCHEDULE_SCOPING_CALL':
        tasks.push(
          {
            title: `Send scoping-call confirmation to ${lead.fullName}`,
            dueHours: classification.urgency === 'IMMEDIATE' ? 2 : 8,
          },
          {
            title: `Prepare scope-validation document for ${lead.company ?? lead.fullName}`,
            dueHours: 24,
          },
        );
        break;

      case 'SEND_CLARIFICATION':
        tasks.push(
          {
            title: `Send clarification request: missing ${classification.missingFields.join(', ')}`,
            dueHours: 4,
          },
          {
            title: `Follow up if no response within 48h from ${lead.fullName}`,
            dueHours: 52,
          },
        );
        break;

      case 'SEND_DECLINE':
        tasks.push({
          title: `Send decline response to ${lead.fullName} — ${classification.reason}`,
          dueHours: 8,
        });
        break;
    }

    const created: string[] = [];
    for (const task of tasks) {
      const due = new Date();
      due.setHours(due.getHours() + task.dueHours);
      const record = await this.prisma.leadTask.create({
        data: {
          leadId: lead.id,
          title: task.title,
          dueAt: due,
        },
      });
      created.push(record.id);

      await this.prisma.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'TASK_CREATED',
          payload: { title: task.title, source: 'classification_automation' },
        },
      });
    }

    return created;
  }

  private buildFallbackResponse(
    lead: LeadSnapshot,
    classification: ClassificationResult,
  ): RenderedResponse {
    const firstName = lead.fullName.split(/\s+/)[0] ?? lead.fullName;

    switch (classification.classification) {
      case 'READY':
        return {
          channel: 'EMAIL',
          subject: `Estio — Scope confirmed: ${this.formatServiceType(lead.serviceType)}`,
          body: [
            `${firstName},`,
            '',
            `Your submission has been classified under ${this.formatServiceType(lead.serviceType)}.`,
            '',
            'Scope validation:',
            `— Service path: ${classification.dealPath ?? this.formatServiceType(lead.serviceType)}`,
            `— Organisation: ${lead.company ?? '—'}`,
            `— Classification: READY for scoping`,
            '',
            'Next step: We will send a scoping-call slot within the next business day. The call will cover:',
            '1. Confirm systems in scope (read/write)',
            '2. Validate internal owner and change-approval path',
            '3. Define phase-one acceptance criteria',
            '',
            'If you cannot confirm these during the call, the engagement pauses until prerequisites are met.',
            '',
            'Estio — Scoped Delivery',
          ].join('\n'),
          templateKey: 'fallback-ready',
        };

      case 'CLARIFY':
        return {
          channel: 'EMAIL',
          subject: `Estio — Clarification required before qualification proceeds`,
          body: [
            `${firstName},`,
            '',
            `Your submission under ${this.formatServiceType(lead.serviceType)} has been received but cannot proceed to qualification without the following:`,
            '',
            ...classification.missingFields.map((f) => `— ${this.formatFieldName(f)}`),
            '',
            'We do not schedule calls or produce proposals without these inputs. This is not a formality — incomplete briefs produce wrong scopes.',
            '',
            'Reply to this message with the missing items. If you cannot supply them within 5 business days, the submission will be archived.',
            '',
            'Estio — Scoped Delivery',
          ].join('\n'),
          templateKey: 'fallback-clarify',
        };

      case 'REJECT':
        return {
          channel: 'EMAIL',
          subject: `Estio — Submission declined`,
          body: [
            `${firstName},`,
            '',
            `Your enquiry does not meet the qualification threshold for a scoped engagement.`,
            '',
            `Reason: ${classification.reason}`,
            '',
            'This is not a capacity issue. It is a fit decision. We decline submissions that lack sufficient definition to produce a responsible scope and fee.',
            '',
            'If your requirements change — specifically, if you can name systems, an internal owner, and a bounded workflow — you are welcome to resubmit.',
            '',
            'Estio — Scoped Delivery',
          ].join('\n'),
          templateKey: 'fallback-decline',
        };
    }
  }

  private formatFieldName(field: string): string {
    const map: Record<string, string> = {
      company: 'Company / organisation name',
      contact_method: 'Phone or WhatsApp number',
      project_scope: 'Written scope: systems, outcomes, constraints (minimum 40 characters)',
      budget_range: 'Budget range indication',
      timeline: 'Expected timeline',
      job_title: 'Job title / role of submitter',
    };
    return map[field] ?? field;
  }

  private buildClassificationNote(
    classification: ClassificationResult,
    responses: RenderedResponse[],
  ): string {
    const lines = [
      `[AUTO-CLASSIFICATION] ${classification.classification}`,
      `Reason: ${classification.reason}`,
      `Next action: ${classification.nextAction}`,
      `Urgency: ${classification.urgency}`,
      `Deal path: ${classification.dealPath ?? 'N/A'}`,
      `Suggested stage: ${classification.suggestedStage}`,
      `Suggested status: ${classification.suggestedStatus}`,
      `Missing fields: ${classification.missingFields.length > 0 ? classification.missingFields.join(', ') : 'None'}`,
      `Response template: ${classification.responseTemplateKey}`,
      `Responses rendered: ${responses.length} (${responses.map((r) => r.channel).join(', ')})`,
    ];
    return lines.join('\n');
  }
}
