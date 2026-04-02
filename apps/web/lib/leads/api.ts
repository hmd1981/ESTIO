/** Mirrors API `CrmLeadSource` — JSON only, never localized labels. */
export type LeadSource =
  | "HOMEPAGE"
  | "CONTACT"
  | "SERVICE_PAGE"
  | "INTAKE"
  | "REFERRAL"
  | "PARTNER"
  | "OTHER";

/**
 * Legacy website values for service line; API maps to `CrmServiceType`.
 * Prefer sending `serviceType` (WEB, CONTENT, …) when the client is updated.
 */
export type LeadServiceInterest =
  | "WEB_DESIGN_DEVELOPMENT"
  | "CONTENT_CAMPAIGNS"
  | "AI_CREATIVE"
  | "ENTERPRISE_AI"
  | "UNSURE";
