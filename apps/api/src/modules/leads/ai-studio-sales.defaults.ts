import type { CrmPipelineStage, CrmPriority } from '@prisma/client';

export const AI_STUDIO_INTENTS = ['images', 'video', 'brand'] as const;
export type AiStudioIntent = (typeof AI_STUDIO_INTENTS)[number];

export const DEFAULT_INTENT_MAPPING: Record<AiStudioIntent, string> = {
  images: 'AI Image Production',
  video: 'Short-form AI Video',
  brand: 'Brand AI Pack',
};

export const DEFAULT_PRIORITY_MAPPING: Record<AiStudioIntent, string> = {
  video: 'high',
  brand: 'high',
  images: 'medium',
};

export const DEFAULT_ROUTING_MAPPING: Record<AiStudioIntent, string> = {
  images: 'sales',
  video: 'sales',
  brand: 'owner',
};

export const DEFAULT_PRICING_HINTS: Record<AiStudioIntent, string> = {
  images: 'Starting from $150',
  video: 'Starting from $300',
  brand: 'Custom pricing',
};

/** Settings UI / seed keys → persisted CRM pipeline enum */
export const SETTINGS_STAGE_TO_PIPELINE: Record<string, CrmPipelineStage> = {
  NEW: 'INBOX',
  QUALIFIED: 'DISCOVERY',
  PROPOSAL_SENT: 'PROPOSAL',
  NEGOTIATION: 'NEGOTIATION',
  WON: 'WON',
  LOST: 'LOST',
  INBOX: 'INBOX',
  DISCOVERY: 'DISCOVERY',
  PROPOSAL: 'PROPOSAL',
};

export function mapSettingsStageToPipeline(
  key: string | null | undefined,
): CrmPipelineStage {
  if (!key?.trim()) return 'INBOX';
  const k = key.trim().toUpperCase();
  return SETTINGS_STAGE_TO_PIPELINE[k] ?? 'INBOX';
}

/**
 * Brand AI pack = high-ticket: skip INBOX and open in DISCOVERY
 * (sales-facing label in settings map: QUALIFIED).
 */
export const AI_STUDIO_BRAND_FAST_TRACK_STAGE: CrmPipelineStage = 'DISCOVERY';

export function resolveAiStudioInitialPipelineStage(
  intent: AiStudioIntent,
  settingsDefaultStageKey: string,
): CrmPipelineStage {
  if (intent === 'brand') {
    return AI_STUDIO_BRAND_FAST_TRACK_STAGE;
  }
  return mapSettingsStageToPipeline(settingsDefaultStageKey);
}

export function mapHintPriorityToCrm(
  hint: string | null | undefined,
): CrmPriority {
  const h = (hint ?? '').toLowerCase();
  if (h === 'high') return 'HIGH';
  if (h === 'low') return 'LOW';
  if (h === 'medium') return 'MEDIUM';
  return 'MEDIUM';
}

export function readStringRecord(json: unknown): Record<string, string> {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(json as Record<string, unknown>)) {
    if (typeof v === 'string' && v.trim()) out[k] = v;
  }
  return out;
}
