import { mediaJobCreditCost } from '../media/media-job-cost';

/**
 * Centralized, auditable generation pricing for API + UI.
 * Costs match {@link mediaJobCreditCost} (env PHASE2_COST_* per mode).
 */
export type GenerationPricingMode =
  'text_to_image' | 'image_to_video' | 'text_to_video' | 'generate_image';

const MODES: GenerationPricingMode[] = [
  'text_to_image',
  'image_to_video',
  'text_to_video',
  'generate_image',
];

export function getGenerationPricingDto(): {
  currency: 'credits';
  version: number;
  modes: Record<string, { credits: number; envKey: string }>;
  tiers: {
    preview: null;
    standard: null;
    premium: null;
    note: string;
  };
  modifiers: {
    durationSeconds: null;
    resolution: null;
    model: null;
    note: string;
  };
} {
  const envKeys: Record<GenerationPricingMode, string> = {
    text_to_image: 'PHASE2_COST_TEXT_TO_IMAGE',
    image_to_video: 'PHASE2_COST_IMAGE_TO_VIDEO',
    text_to_video: 'PHASE2_COST_TEXT_TO_VIDEO',
    generate_image: 'PHASE2_COST_GENERATE_IMAGE',
  };
  const modes: Record<string, { credits: number; envKey: string }> = {};
  for (const m of MODES) {
    modes[m] = { credits: mediaJobCreditCost(m), envKey: envKeys[m] };
  }
  return {
    currency: 'credits',
    version: 1,
    modes,
    tiers: {
      preview: null,
      standard: null,
      premium: null,
      note: 'Tier multipliers are reserved; not applied in billing until configured.',
    },
    modifiers: {
      durationSeconds: null,
      resolution: null,
      model: null,
      note: 'Reserved for future per-duration/resolution/model surcharges.',
    },
  };
}
