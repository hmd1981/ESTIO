/**
 * Per-mode credit cost for a media job submit. Defaults are conservative; the
 * operator overrides via env (`PHASE2_COST_<MODE_UPPERCASED>`). All costs are
 * positive integers in the same unit as the credit ledger (1 credit = the
 * smallest billable thing).
 *
 * Why per-mode rather than per-second-of-GPU? Customers buy credits in
 * round numbers; "one image = 1 credit, one short video = 5 credits" is
 * obvious in the UI and easy to refund deterministically. If we ever want
 * a usage-based model we'd add a metering pass on top, not replace this.
 */

export type MediaJobMode =
  'text_to_image' | 'image_to_video' | 'text_to_video' | 'generate_image';

const DEFAULTS: Record<MediaJobMode, number> = {
  text_to_image: 1,
  generate_image: 1,
  image_to_video: 5,
  text_to_video: 5,
};

const ENV_KEYS: Record<MediaJobMode, string> = {
  text_to_image: 'PHASE2_COST_TEXT_TO_IMAGE',
  generate_image: 'PHASE2_COST_GENERATE_IMAGE',
  image_to_video: 'PHASE2_COST_IMAGE_TO_VIDEO',
  text_to_video: 'PHASE2_COST_TEXT_TO_VIDEO',
};

export function mediaJobCreditCost(mode: string): number {
  const m = (mode in DEFAULTS ? mode : 'generate_image') as MediaJobMode;
  const raw = process.env[ENV_KEYS[m]]?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0 && n < 1_000) return Math.floor(n);
  }
  return DEFAULTS[m];
}
