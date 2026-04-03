import type { CrmPipelineStage } from '@prisma/client';

export type DealGate = {
  stage: CrmPipelineStage;
  label: string;
  requiredFields: string[];
  requiredConditions: string[];
  blockedWithout: string[];
};

/**
 * Defines the gates a deal must pass through.
 * Each stage has explicit prerequisites — no stage transition without them.
 */
export const DEAL_FLOW_GATES: DealGate[] = [
  {
    stage: 'INBOX',
    label: 'Intake',
    requiredFields: ['fullName', 'email', 'serviceType'],
    requiredConditions: ['Lead created with minimum fields'],
    blockedWithout: [],
  },
  {
    stage: 'DISCOVERY',
    label: 'Scope validation',
    requiredFields: ['company', 'projectScope', 'serviceType'],
    requiredConditions: [
      'Classification is READY or CLARIFY resolved',
      'First response sent',
      'Scoping call scheduled or scope document requested',
    ],
    blockedWithout: [
      'company',
      'project_scope',
      'contact_method',
    ],
  },
  {
    stage: 'PROPOSAL',
    label: 'Proposal',
    requiredFields: ['company', 'projectScope', 'budgetRange', 'timeline'],
    requiredConditions: [
      'Scoping call completed or scope document reviewed',
      'Systems in scope confirmed',
      'Internal owner identified',
      'Phase-one acceptance criteria defined',
    ],
    blockedWithout: [
      'budget_range',
      'timeline',
      'scoping_call_completed',
    ],
  },
  {
    stage: 'NEGOTIATION',
    label: 'Negotiation',
    requiredFields: ['company', 'projectScope', 'budgetRange', 'timeline'],
    requiredConditions: [
      'Proposal sent and acknowledged',
      'Commercial terms under discussion',
      'Decision-maker identified and engaged',
    ],
    blockedWithout: [
      'proposal_sent',
    ],
  },
  {
    stage: 'WON',
    label: 'Closed — won',
    requiredFields: ['wonValue'],
    requiredConditions: [
      'Contract signed or PO received',
      'Engagement value recorded',
    ],
    blockedWithout: [
      'won_value',
    ],
  },
  {
    stage: 'LOST',
    label: 'Closed — lost',
    requiredFields: ['lostReason'],
    requiredConditions: [
      'Lost reason documented',
    ],
    blockedWithout: [
      'lost_reason',
    ],
  },
];

export function getGateForStage(stage: CrmPipelineStage): DealGate | undefined {
  return DEAL_FLOW_GATES.find((g) => g.stage === stage);
}

/**
 * Validates whether a lead has the required fields to enter a stage.
 * Returns missing field names or empty array if gate passes.
 */
export function validateStageGate(
  stage: CrmPipelineStage,
  lead: Record<string, unknown>,
): string[] {
  const gate = getGateForStage(stage);
  if (!gate) return [];

  const missing: string[] = [];
  for (const field of gate.requiredFields) {
    const value = lead[field];
    if (value === null || value === undefined || value === '' || value === 'UNSPECIFIED') {
      missing.push(field);
    }
  }
  return missing;
}

/** Human-readable summary of what the next stage requires. */
export function nextStageRequirements(currentStage: CrmPipelineStage): string {
  const order: CrmPipelineStage[] = [
    'INBOX',
    'DISCOVERY',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
  ];
  const idx = order.indexOf(currentStage);
  if (idx < 0 || idx >= order.length - 1) return '';
  const next = order[idx + 1]!;
  const gate = getGateForStage(next);
  if (!gate) return '';
  return [
    `To advance to ${gate.label}:`,
    ...gate.requiredConditions.map((c) => `  — ${c}`),
  ].join('\n');
}
