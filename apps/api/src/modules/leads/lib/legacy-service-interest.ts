import type { CrmServiceType } from '@prisma/client';

/** Legacy website/API values → CRM service line (stable enums). */
const LEGACY_MAP: Record<string, CrmServiceType> = {
  WEB_DESIGN_DEVELOPMENT: 'WEB',
  CONTENT_CAMPAIGNS: 'CONTENT',
  AI_CREATIVE: 'AI_CREATIVE',
  ENTERPRISE_AI: 'ENTERPRISE_AI',
  UNSURE: 'GENERAL',
};

export function resolveServiceType(input: {
  serviceType?: CrmServiceType;
  legacyServiceInterest?: string;
}): CrmServiceType {
  if (input.serviceType) return input.serviceType;
  const key = input.legacyServiceInterest?.trim().toUpperCase();
  if (key && LEGACY_MAP[key]) return LEGACY_MAP[key]!;
  return 'GENERAL';
}
