import { BadRequestException } from '@nestjs/common';
import { GENERATE_IMAGE_PROMPT_MAX_LENGTH } from './generate-image-payload';

/** Values accepted on POST /media/jobs/generate-media (video-style jobs). */
export const GENERATE_MEDIA_MODES = ['image_to_video', 'text_to_video'] as const;

export type GenerateMediaRequestMode = (typeof GENERATE_MEDIA_MODES)[number];

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * Validates async **generate-media** jobs (video-capable modes). Extra keys are kept on the object
 * for the worker. Does not replace `assertGenerateImagePayload` (POST /media/jobs/generate-image).
 */
export function assertGenerateMediaPayload(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Body must be a JSON object');
  }
  const o = body as Record<string, unknown>;
  const mode = o.mode;
  if (mode !== 'text_to_video' && mode !== 'image_to_video') {
    throw new BadRequestException(
      'mode must be "text_to_video" or "image_to_video" for this endpoint',
    );
  }

  if (mode === 'text_to_video') {
    if (!isNonEmptyString(o.prompt)) {
      throw new BadRequestException('prompt must be a non-empty string');
    }
    if ((o.prompt as string).length > GENERATE_IMAGE_PROMPT_MAX_LENGTH) {
      throw new BadRequestException(
        `prompt exceeds maximum length (${GENERATE_IMAGE_PROMPT_MAX_LENGTH})`,
      );
    }
    return o;
  }

  // image_to_video
  const urlCandidate =
    (isNonEmptyString(o.image_url) && o.image_url.trim()) ||
    (isNonEmptyString(o.imageUrl) && o.imageUrl.trim()) ||
    (isNonEmptyString(o.source_image_url) && o.source_image_url.trim()) ||
    null;
  const b64 =
    (isNonEmptyString(o.image_base64) && o.image_base64.trim()) ||
    (isNonEmptyString(o.imageBase64) && o.imageBase64.trim()) ||
    null;
  if (!urlCandidate && !b64) {
    throw new BadRequestException(
      'Provide a source image: image_url, imageUrl, source_image_url, image_base64, or imageBase64',
    );
  }
  if (isNonEmptyString(o.prompt) && (o.prompt as string).length > GENERATE_IMAGE_PROMPT_MAX_LENGTH) {
    throw new BadRequestException(
      `prompt exceeds maximum length (${GENERATE_IMAGE_PROMPT_MAX_LENGTH})`,
    );
  }
  return o;
}
