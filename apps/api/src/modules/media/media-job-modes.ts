/**
 * Canonical Studio media job kinds (Prisma `MediaGenerationJob.type`).
 *
 * Legacy: `generate_image` is kept for `POST /media/jobs/generate-image` and maps to the
 * same worker routing as `text_to_image`.
 */
export const STUDIO_MEDIA_JOB_MODES = [
  'text_to_image',
  'image_to_video',
  'text_to_video',
] as const;

export type StudioMediaJobMode = (typeof STUDIO_MEDIA_JOB_MODES)[number];

export function isStudioMediaJobMode(s: string): s is StudioMediaJobMode {
  return (STUDIO_MEDIA_JOB_MODES as readonly string[]).includes(s);
}

/** Maps persisted `type` to worker HTTP routing bucket (sync + async submit paths). */
export type MediaJobRoutingKind =
  'text_to_image' | 'image_to_video' | 'text_to_video';

export function routingKindFromStoredJobType(
  storedType: string,
): MediaJobRoutingKind {
  if (storedType === 'generate_image' || storedType === 'text_to_image') {
    return 'text_to_image';
  }
  if (storedType === 'image_to_video') {
    return 'image_to_video';
  }
  if (storedType === 'text_to_video') {
    return 'text_to_video';
  }
  return 'text_to_image';
}

/** UI / result envelope hint (additive fields on status + result responses). */
export function publicMediaKindFromStoredType(
  storedType: string,
): 'image' | 'video' | 'unknown' {
  const k = routingKindFromStoredJobType(storedType);
  if (k === 'text_to_image') {
    return 'image';
  }
  if (k === 'image_to_video' || k === 'text_to_video') {
    return 'video';
  }
  return 'unknown';
}
