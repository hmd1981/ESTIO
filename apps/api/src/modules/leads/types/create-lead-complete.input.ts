import type {
  CrmBudgetRange,
  CrmBusinessType,
  CrmLeadSource,
  CrmServiceType,
  CrmTeamSize,
  CrmTimeline,
  Prisma,
  SiteLocale,
} from '@prisma/client';

export type CreateLeadCompleteInput = {
  fullName: string;
  email: string;
  phone?: string | null;
  whatsapp?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  country?: string | null;
  city?: string | null;
  serviceType: CrmServiceType;
  subServiceType?: string | null;
  /** AI Studio funnel key when area of interest is AI_STUDIO */
  studioIntent?: string | null;
  /** Human offer line (e.g. AI Image Production) */
  offerType?: string | null;
  businessType: CrmBusinessType;
  teamSize: CrmTeamSize;
  budgetRange: CrmBudgetRange;
  timeline: CrmTimeline;
  projectScope?: string | null;
  message?: string | null;
  source: CrmLeadSource;
  locale?: SiteLocale | null;
  referrer?: string | null;
  landingPage?: string | null;
  campaignSource?: string | null;
  campaignMedium?: string | null;
  campaignName?: string | null;
  crmMetadata?: Prisma.InputJsonValue | null;
};
