import { Injectable } from '@nestjs/common';
import type {
  CrmBudgetRange,
  CrmBusinessType,
  CrmPriority,
  CrmServiceType,
  CrmTeamSize,
  CrmTimeline,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';

export type ScoreRules = {
  serviceWeight: Partial<Record<CrmServiceType, number>>;
  budgetWeight: Partial<Record<CrmBudgetRange, number>>;
  timelineWeight: Partial<Record<CrmTimeline, number>>;
  teamSizeWeight: Partial<Record<CrmTeamSize, number>>;
  businessTypeWeight: Partial<Record<CrmBusinessType, number>>;
  completenessFieldPts: Record<string, number>;
  maxScore: number;
};

const DEFAULT_RULES: ScoreRules = {
  serviceWeight: {
    ENTERPRISE_AI: 18,
    AUTOMATION: 16,
    AI_CREATIVE: 12,
    WEB: 10,
    CONTENT: 8,
    CAMPAIGNS: 8,
    GENERAL: 4,
  },
  budgetWeight: {
    UNSPECIFIED: 0,
    UNDER_5K: 4,
    RANGE_5K_25K: 10,
    RANGE_25K_75K: 16,
    RANGE_75K_200K: 20,
    OVER_200K: 24,
  },
  timelineWeight: {
    UNSPECIFIED: 0,
    MONTHS_6_PLUS: 4,
    MONTHS_3_6: 8,
    MONTHS_1_3: 12,
    WEEKS_1_4: 16,
    IMMEDIATE: 20,
  },
  teamSizeWeight: {
    UNSPECIFIED: 0,
    SOLO: 2,
    SIZE_2_10: 6,
    SIZE_11_50: 10,
    SIZE_51_PLUS: 14,
  },
  businessTypeWeight: {
    UNSPECIFIED: 0,
    STARTUP: 4,
    SMB: 6,
    AGENCY: 6,
    NONPROFIT: 4,
    MID_MARKET: 12,
    ENTERPRISE: 18,
    OTHER: 3,
  },
  completenessFieldPts: {
    phone: 4,
    whatsapp: 4,
    company: 4,
    jobTitle: 3,
    country: 2,
    city: 2,
    projectScope: 5,
  },
  maxScore: 100,
};

export type LeadScoreInput = {
  serviceType: CrmServiceType;
  budgetRange: CrmBudgetRange;
  timeline: CrmTimeline;
  teamSize: CrmTeamSize;
  businessType: CrmBusinessType;
  phone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  country?: string | null;
  city?: string | null;
  projectScope?: string | null;
};

@Injectable()
export class LeadScoringService {
  compute(
    lead: LeadScoreInput,
    rulesJson?: Prisma.JsonValue | null,
  ): {
    score: number;
    priority: CrmPriority;
    breakdown: Record<string, number>;
  } {
    const rules = this.mergeRules(rulesJson);
    const breakdown: Record<string, number> = {};

    const sSvc = rules.serviceWeight[lead.serviceType] ?? 0;
    breakdown.serviceType = sSvc;

    const sBd = rules.budgetWeight[lead.budgetRange] ?? 0;
    breakdown.budgetRange = sBd;

    const sTl = rules.timelineWeight[lead.timeline] ?? 0;
    breakdown.timeline = sTl;

    const sTm = rules.teamSizeWeight[lead.teamSize] ?? 0;
    breakdown.teamSize = sTm;

    const sBt = rules.businessTypeWeight[lead.businessType] ?? 0;
    breakdown.businessType = sBt;

    let complete = 0;
    if (lead.phone?.trim()) complete += rules.completenessFieldPts.phone ?? 0;
    if (lead.whatsapp?.trim())
      complete += rules.completenessFieldPts.whatsapp ?? 0;
    if (lead.company?.trim())
      complete += rules.completenessFieldPts.company ?? 0;
    if (lead.jobTitle?.trim())
      complete += rules.completenessFieldPts.jobTitle ?? 0;
    if (lead.country?.trim())
      complete += rules.completenessFieldPts.country ?? 0;
    if (lead.city?.trim()) complete += rules.completenessFieldPts.city ?? 0;
    if (lead.projectScope?.trim())
      complete += rules.completenessFieldPts.projectScope ?? 0;
    breakdown.completeness = complete;

    let score = Math.round(sSvc + sBd + sTl + sTm + sBt + complete);
    const cap = rules.maxScore ?? 100;
    if (score > cap) score = cap;

    return {
      score,
      priority: this.priorityBucket(score),
      breakdown,
    };
  }

  private priorityBucket(score: number): CrmPriority {
    if (score >= 82) return 'STRATEGIC';
    if (score >= 60) return 'HIGH';
    if (score >= 35) return 'MEDIUM';
    return 'LOW';
  }

  private mergeRules(rulesJson?: Prisma.JsonValue | null): ScoreRules {
    if (
      !rulesJson ||
      typeof rulesJson !== 'object' ||
      Array.isArray(rulesJson)
    ) {
      return DEFAULT_RULES;
    }
    const r = rulesJson as Partial<ScoreRules>;
    return {
      ...DEFAULT_RULES,
      ...r,
      serviceWeight: { ...DEFAULT_RULES.serviceWeight, ...r.serviceWeight },
      budgetWeight: { ...DEFAULT_RULES.budgetWeight, ...r.budgetWeight },
      timelineWeight: { ...DEFAULT_RULES.timelineWeight, ...r.timelineWeight },
      teamSizeWeight: { ...DEFAULT_RULES.teamSizeWeight, ...r.teamSizeWeight },
      businessTypeWeight: {
        ...DEFAULT_RULES.businessTypeWeight,
        ...r.businessTypeWeight,
      },
      completenessFieldPts: {
        ...DEFAULT_RULES.completenessFieldPts,
        ...r.completenessFieldPts,
      },
    };
  }
}
