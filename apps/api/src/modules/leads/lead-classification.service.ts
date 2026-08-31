import { Injectable } from '@nestjs/common';
import type {
  CrmServiceType,
  CrmPipelineStage,
  CrmLeadStatus,
} from '@prisma/client';

export type LeadClassification = 'READY' | 'CLARIFY' | 'REJECT';

export type ClassificationResult = {
  classification: LeadClassification;
  reason: string;
  missingFields: string[];
  nextAction: 'SCHEDULE_SCOPING_CALL' | 'SEND_CLARIFICATION' | 'SEND_DECLINE';
  suggestedStage: CrmPipelineStage;
  suggestedStatus: CrmLeadStatus;
  responseTemplateKey: string;
  urgency: 'IMMEDIATE' | 'SAME_DAY' | 'NEXT_BUSINESS_DAY';
  dealPath: string | null;
};

type ClassificationInput = {
  score: number;
  serviceType: CrmServiceType;
  budgetRange: string;
  timeline: string;
  businessType: string;
  teamSize: string;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  whatsapp: string | null;
  projectScope: string | null;
  message: string | null;
  source: string;
};

const ENTERPRISE_TYPES: CrmServiceType[] = ['ENTERPRISE_AI', 'AUTOMATION'];
const MINIMUM_SCOPE_LENGTH = 40;

@Injectable()
export class LeadClassificationService {
  classify(input: ClassificationInput): ClassificationResult {
    const missing = this.findMissingFields(input);
    const isEnterprise = ENTERPRISE_TYPES.includes(input.serviceType);
    const hasScope = this.hasSufficientScope(input);
    const hasContact = Boolean(input.phone?.trim() || input.whatsapp?.trim());
    const hasCompany = Boolean(input.company?.trim());

    if (this.shouldReject(input)) {
      return {
        classification: 'REJECT',
        reason: this.rejectReason(input),
        missingFields: missing,
        nextAction: 'SEND_DECLINE',
        suggestedStage: 'INBOX',
        suggestedStatus: 'NEW',
        responseTemplateKey: isEnterprise
          ? 'decline-enterprise'
          : 'decline-general',
        urgency: 'SAME_DAY',
        dealPath: null,
      };
    }

    if (this.isReady(input, missing)) {
      return {
        classification: 'READY',
        reason: 'Qualification complete. Scope defined. Contact available.',
        missingFields: [],
        nextAction: 'SCHEDULE_SCOPING_CALL',
        suggestedStage: 'DISCOVERY',
        suggestedStatus: 'CONTACTED',
        responseTemplateKey: isEnterprise
          ? 'ready-enterprise'
          : 'ready-general',
        urgency: input.score >= 60 ? 'IMMEDIATE' : 'SAME_DAY',
        dealPath: this.resolveDealPath(input.serviceType),
      };
    }

    return {
      classification: 'CLARIFY',
      reason: `Missing: ${missing.join(', ')}. Scope insufficient for qualification.`,
      missingFields: missing,
      nextAction: 'SEND_CLARIFICATION',
      suggestedStage: 'INBOX',
      suggestedStatus: 'NEW',
      responseTemplateKey: isEnterprise
        ? 'clarify-enterprise'
        : 'clarify-general',
      urgency: 'SAME_DAY',
      dealPath: this.resolveDealPath(input.serviceType),
    };
  }

  private shouldReject(input: ClassificationInput): boolean {
    if (input.score <= 8) return true;

    const isEnterprise = ENTERPRISE_TYPES.includes(input.serviceType);
    if (isEnterprise) {
      const hasNoScope = !input.projectScope?.trim() && !input.message?.trim();
      const hasNoCompany = !input.company?.trim();
      if (hasNoScope && hasNoCompany) return true;
    }

    return false;
  }

  private rejectReason(input: ClassificationInput): string {
    if (input.score <= 8) {
      return 'Score below qualification threshold. Insufficient information to proceed.';
    }
    return 'Enterprise path requires named systems, internal owner, and scope definition. None provided.';
  }

  private isReady(input: ClassificationInput, missing: string[]): boolean {
    if (missing.length > 1) return false;
    if (input.score < 25) return false;
    if (!this.hasSufficientScope(input)) return false;
    if (!input.company?.trim()) return false;
    return true;
  }

  private hasSufficientScope(input: ClassificationInput): boolean {
    const scope = input.projectScope?.trim() || '';
    const message = input.message?.trim() || '';
    const combined = scope.length + message.length;
    return combined >= MINIMUM_SCOPE_LENGTH;
  }

  private findMissingFields(input: ClassificationInput): string[] {
    const missing: string[] = [];
    const isEnterprise = ENTERPRISE_TYPES.includes(input.serviceType);

    if (!input.company?.trim()) missing.push('company');
    if (!input.phone?.trim() && !input.whatsapp?.trim())
      missing.push('contact_method');
    if (!this.hasSufficientScope(input)) missing.push('project_scope');
    if (input.budgetRange === 'UNSPECIFIED') missing.push('budget_range');
    if (input.timeline === 'UNSPECIFIED') missing.push('timeline');

    if (isEnterprise) {
      if (!input.jobTitle?.trim()) missing.push('job_title');
    }

    return missing;
  }

  private resolveDealPath(serviceType: CrmServiceType): string | null {
    switch (serviceType) {
      case 'ENTERPRISE_AI':
        return 'GOVERNED_RETRIEVAL';
      case 'AUTOMATION':
        return 'WORKFLOW_AUTOMATION';
      case 'WEB':
        return 'PLATFORM_BUILD';
      case 'CONTENT':
      case 'CAMPAIGNS':
        return 'CONTENT_PROGRAMME';
      case 'AI_CREATIVE':
        return 'AI_CREATIVE_PRODUCTION';
      default:
        return null;
    }
  }
}
