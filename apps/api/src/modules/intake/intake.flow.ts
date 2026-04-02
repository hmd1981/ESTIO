import type { CrmServiceType } from '@prisma/client';

export type IntakeQuestion = {
  key: string;
  type: 'single_choice' | 'text' | 'textarea';
  options?: { value: string }[];
};

export type IntakeStep = {
  id: string;
  questions: IntakeQuestion[];
};

function commonQualification(): IntakeStep[] {
  return [
    {
      id: 'budget_timeline',
      questions: [
        {
          key: 'budgetRange',
          type: 'single_choice',
          options: [
            { value: 'UNSPECIFIED' },
            { value: 'UNDER_5K' },
            { value: 'RANGE_5K_25K' },
            { value: 'RANGE_25K_75K' },
            { value: 'RANGE_75K_200K' },
            { value: 'OVER_200K' },
          ],
        },
        {
          key: 'timeline',
          type: 'single_choice',
          options: [
            { value: 'UNSPECIFIED' },
            { value: 'IMMEDIATE' },
            { value: 'WEEKS_1_4' },
            { value: 'MONTHS_1_3' },
            { value: 'MONTHS_3_6' },
            { value: 'MONTHS_6_PLUS' },
          ],
        },
      ],
    },
    {
      id: 'business_context',
      questions: [
        {
          key: 'businessType',
          type: 'single_choice',
          options: [
            { value: 'UNSPECIFIED' },
            { value: 'STARTUP' },
            { value: 'SMB' },
            { value: 'MID_MARKET' },
            { value: 'ENTERPRISE' },
            { value: 'NONPROFIT' },
            { value: 'AGENCY' },
            { value: 'OTHER' },
          ],
        },
        {
          key: 'teamSize',
          type: 'single_choice',
          options: [
            { value: 'UNSPECIFIED' },
            { value: 'SOLO' },
            { value: 'SIZE_2_10' },
            { value: 'SIZE_11_50' },
            { value: 'SIZE_51_PLUS' },
          ],
        },
      ],
    },
    {
      id: 'scope',
      questions: [
        {
          key: 'projectScope',
          type: 'textarea',
        },
      ],
    },
  ];
}

const BRANCH_STEPS: Record<CrmServiceType, IntakeStep[]> = {
  GENERAL: [
    {
      id: 'service_line',
      questions: [
        {
          key: 'serviceType',
          type: 'single_choice',
          options: [
            { value: 'WEB' },
            { value: 'CONTENT' },
            { value: 'CAMPAIGNS' },
            { value: 'AI_CREATIVE' },
            { value: 'ENTERPRISE_AI' },
            { value: 'AUTOMATION' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
  WEB: [
    {
      id: 'web_intent',
      questions: [
        {
          key: 'subServiceType',
          type: 'single_choice',
          options: [
            { value: 'NEW_SITE' },
            { value: 'REDESIGN' },
            { value: 'LANDING_PAGES' },
            { value: 'MULTILINGUAL' },
            { value: 'OTHER' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
  CONTENT: [
    {
      id: 'content_intent',
      questions: [
        {
          key: 'subServiceType',
          type: 'single_choice',
          options: [
            { value: 'ONGOING_CONTENT' },
            { value: 'CAMPAIGN_ASSETS' },
            { value: 'SOCIAL' },
            { value: 'OTHER' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
  CAMPAIGNS: [
    {
      id: 'campaign_intent',
      questions: [
        {
          key: 'subServiceType',
          type: 'single_choice',
          options: [
            { value: 'PAID_SOCIAL' },
            { value: 'PERFORMANCE' },
            { value: 'BRAND_CAMPAIGN' },
            { value: 'OTHER' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
  AI_CREATIVE: [
    {
      id: 'ai_creative_intent',
      questions: [
        {
          key: 'subServiceType',
          type: 'single_choice',
          options: [
            { value: 'GENERATIVE_ASSETS' },
            { value: 'VIDEO_AI' },
            { value: 'BRAND_AI' },
            { value: 'OTHER' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
  ENTERPRISE_AI: [
    {
      id: 'enterprise_intent',
      questions: [
        {
          key: 'subServiceType',
          type: 'single_choice',
          options: [
            { value: 'PRIVATE_LLM' },
            { value: 'KNOWLEDGE_SYSTEM' },
            { value: 'COMPLIANCE' },
            { value: 'OTHER' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
  AUTOMATION: [
    {
      id: 'automation_intent',
      questions: [
        {
          key: 'subServiceType',
          type: 'single_choice',
          options: [
            { value: 'CRM_AUTOMATION' },
            { value: 'OPS_WORKFLOWS' },
            { value: 'INTEGRATIONS' },
            { value: 'OTHER' },
          ],
        },
      ],
    },
    ...commonQualification(),
  ],
};

export function stepsForBranch(branch: CrmServiceType): IntakeStep[] {
  return BRANCH_STEPS[branch] ?? BRANCH_STEPS.GENERAL;
}

export function firstStepKey(branch: CrmServiceType): string {
  const s = stepsForBranch(branch);
  return s[0]?.id ?? 'service_line';
}

export function nextStepId(
  branch: CrmServiceType,
  currentStepId: string,
): string | null {
  const steps = stepsForBranch(branch);
  const idx = steps.findIndex((x) => x.id === currentStepId);
  if (idx < 0 || idx >= steps.length - 1) return null;
  return steps[idx + 1]!.id;
}

export function questionsForStep(
  branch: CrmServiceType,
  stepId: string,
): IntakeQuestion[] {
  const step = stepsForBranch(branch).find((s) => s.id === stepId);
  return step?.questions ?? [];
}
