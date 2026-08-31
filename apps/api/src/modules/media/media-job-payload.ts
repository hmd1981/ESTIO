import { BadRequestException } from '@nestjs/common';
import {
  isStudioMediaJobMode,
  STUDIO_MEDIA_JOB_MODES,
  type StudioMediaJobMode,
} from './media-job-modes';
import { GENERATE_IMAGE_PROMPT_MAX_LENGTH } from './generate-image-payload';

const IMAGE_SOURCE_KEYS = [
  'image_url',
  'imageUrl',
  'source_image_url',
  'sourceImageUrl',
  'asset_id',
  'assetId',
  'image_base64',
  'imageBase64',
] as const;

function pickImageSourceKey(body: Record<string, unknown>): string | null {
  for (const k of IMAGE_SOURCE_KEYS) {
    const v = body[k];
    if (typeof v === 'string' && v.trim()) {
      return k;
    }
  }
  return null;
}

function assertNonEmptyPrompt(
  mode: string,
  body: Record<string, unknown>,
): void {
  if (typeof body.prompt !== 'string' || !body.prompt.trim()) {
    throw new BadRequestException(`${mode}: prompt must be a non-empty string`);
  }
  if (body.prompt.length > GENERATE_IMAGE_PROMPT_MAX_LENGTH) {
    throw new BadRequestException(
      `${mode}: prompt exceeds maximum length (${GENERATE_IMAGE_PROMPT_MAX_LENGTH})`,
    );
  }
}

function assertOptionalPromptLength(body: Record<string, unknown>): void {
  if (typeof body.prompt !== 'string') {
    return;
  }
  if (body.prompt.length > GENERATE_IMAGE_PROMPT_MAX_LENGTH) {
    throw new BadRequestException(
      `prompt exceeds maximum length (${GENERATE_IMAGE_PROMPT_MAX_LENGTH})`,
    );
  }
}

/**
 * Validates `POST /media/jobs` Studio body: top-level `mode` plus mode-specific fields.
 * Returns payload to persist (includes `mode` for worker / auditing).
 */
export function assertUnifiedStudioMediaJobBody(body: unknown): {
  mode: StudioMediaJobMode;
  payload: Record<string, unknown>;
} {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Body must be a JSON object');
  }
  const o = body as Record<string, unknown>;
  const modeRaw = o.mode;
  if (typeof modeRaw !== 'string' || !isStudioMediaJobMode(modeRaw.trim())) {
    throw new BadRequestException(
      `mode must be one of: ${STUDIO_MEDIA_JOB_MODES.join(', ')}`,
    );
  }
  const mode = modeRaw.trim() as StudioMediaJobMode;
  const payload = { ...o, mode };

  if (mode === 'text_to_image' || mode === 'text_to_video') {
    assertNonEmptyPrompt(mode, payload);
  } else if (mode === 'image_to_video') {
    if (!pickImageSourceKey(payload)) {
      throw new BadRequestException(
        `image_to_video: provide one of: ${IMAGE_SOURCE_KEYS.join(', ')} (non-empty string)`,
      );
    }
    assertOptionalPromptLength(payload);
  }

  return { mode, payload };
}

/**
 * Safe JSON for `inputMeta` / public status — no prompt text, no image URLs, no secrets.
 */
export function buildMediaJobInputMeta(
  storedType: string,
  body: Record<string, unknown>,
): {
  promptCharLength: number | null;
  bodyKeyCount: number;
  jsonUtf8Bytes: number;
  imageSourceKey: string | null;
} {
  const prompt = body.prompt;
  const routing =
    storedType === 'generate_image' ? 'text_to_image' : storedType;

  const promptCharLength =
    routing === 'image_to_video'
      ? typeof prompt === 'string'
        ? prompt.length
        : null
      : typeof prompt === 'string'
        ? prompt.length
        : null;

  let jsonUtf8Bytes = 0;
  try {
    jsonUtf8Bytes = Buffer.byteLength(JSON.stringify(body), 'utf8');
  } catch {
    jsonUtf8Bytes = -1;
  }

  const imageSourceKey =
    routing === 'image_to_video' ? pickImageSourceKey(body) : null;

  return {
    promptCharLength,
    bodyKeyCount: Object.keys(body).length,
    jsonUtf8Bytes,
    imageSourceKey,
  };
}
