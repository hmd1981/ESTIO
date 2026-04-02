/**
 * Enterprise marketing sections stored in `Page.sections` for slug `enterprise`.
 * Keep in sync with `apps/web/lib/cms/types.ts` and merge layer.
 */
export const ENTERPRISE_PROOF_KEYS = [
  "enterpriseDecisionSummary",
  "enterpriseProofEngine",
  "enterpriseFit",
  "enterprisePractice",
  "enterpriseProof",
  "enterpriseCaseStudies",
  "enterpriseDiagrams",
  "enterpriseRoi",
  "enterpriseDealEntry",
] as const;

export type EnterpriseProofSectionKey = (typeof ENTERPRISE_PROOF_KEYS)[number];
