/**
 * AI Studio — Workstation API Service Contracts
 *
 * Forward-compatible definitions for routing AI Studio leads
 * to the workstation production pipeline. `subServiceType` on the
 * Lead model (VARCHAR 128) is the routing key.
 *
 * No schema migration needed — contracts map directly to existing fields.
 */

export type AiStudioServiceContract = {
  customerFacingName: string;
  internalSlug: string;
  crmServiceType: 'AI_CREATIVE';
  subServiceTypes: string[];
  intakeFields: string[];
  deliveryOutputs: string[];
  reviewStep: string;
  revisionStep: string;
};

export const AI_STUDIO_CONTRACTS: AiStudioServiceContract[] = [
  {
    customerFacingName: 'AI Image Production',
    internalSlug: 'ai-studio-image',
    crmServiceType: 'AI_CREATIVE',
    subServiceTypes: [
      'HERO_VISUALS',
      'CAMPAIGN_PACK',
      'SOCIAL_PACK',
      'PRODUCT_VISUALS',
      'CHARACTER_CREATION',
    ],
    intakeFields: [
      'outputType',
      'volume',
      'brandDirectionRef',
      'targetChannels',
      'deliveryTimeline',
      'revisionExpectations',
    ],
    deliveryOutputs: [
      'High-resolution image files (PNG/JPEG/TIFF)',
      'Organised asset library with naming convention',
      'Style reference documentation',
      'Brand usage guidelines',
    ],
    reviewStep:
      'Sample direction reviewed against brand brief before production scales.',
    revisionStep:
      'One structured revision round included. Additional rounds scoped separately.',
  },
  {
    customerFacingName: 'AI Video Production',
    internalSlug: 'ai-studio-video',
    crmServiceType: 'AI_CREATIVE',
    subServiceTypes: [
      'PROMO_VIDEO',
      'IMAGE_TO_VIDEO',
      'SOCIAL_REELS',
      'MOTION_LOOPS',
    ],
    intakeFields: [
      'outputType',
      'duration',
      'volume',
      'brandDirectionRef',
      'targetChannels',
      'deliveryTimeline',
      'revisionExpectations',
    ],
    deliveryOutputs: [
      'Final video files (MP4/MOV) in specified resolutions',
      'Platform-optimised exports (vertical, square, landscape)',
      'Motion asset library with naming convention',
      'Style reference documentation',
    ],
    reviewStep:
      'Motion samples reviewed against brand direction before full production.',
    revisionStep:
      'One structured revision round included. Additional rounds scoped separately.',
  },
  {
    customerFacingName: 'Brand AI Packs',
    internalSlug: 'ai-studio-brand',
    crmServiceType: 'AI_CREATIVE',
    subServiceTypes: [
      'BRAND_VISUAL_SYSTEM',
      'PROMPT_PRESETS',
      'CONSISTENCY_PACK',
      'DIRECTION_PACK',
    ],
    intakeFields: [
      'outputType',
      'existingBrandAssets',
      'targetChannels',
      'consistencyObjectives',
      'deliveryTimeline',
    ],
    deliveryOutputs: [
      'Brand-aligned style preset library',
      'Documented prompt architecture',
      'Visual reference and mood board documentation',
      'Asset consistency guidelines and quality benchmarks',
    ],
    reviewStep:
      'Preset system and sample outputs reviewed against existing brand identity.',
    revisionStep:
      'One revision round on the pack structure and outputs included.',
  },
];

/** All AI Studio sub-service type values for validation. */
export const AI_STUDIO_SUB_SERVICE_TYPES = AI_STUDIO_CONTRACTS.flatMap(
  (c) => c.subServiceTypes,
);

/** Check if a subServiceType belongs to AI Studio. */
export function isAiStudioSubService(subServiceType: string): boolean {
  return AI_STUDIO_SUB_SERVICE_TYPES.includes(subServiceType);
}

/** Get the contract for a given sub-service type. */
export function getContractForSubService(
  subServiceType: string,
): AiStudioServiceContract | undefined {
  return AI_STUDIO_CONTRACTS.find((c) =>
    c.subServiceTypes.includes(subServiceType),
  );
}
