import { BadRequestException } from '@nestjs/common';
import type { MediaJobRoutingKind } from './media-job-modes';

/** Optional fields forwarded to the worker when present (worker may ignore unknown keys). */
const GENERATE_MEDIA_PASSTHROUGH_KEYS = [
  'negative_prompt',
  'duration_seconds',
  'duration',
  'seed',
  'motion_strength',
  'width',
  'height',
  'fps',
  'num_frames',
] as const;

const DATA_IMAGE_B64_PREFIX = /^data:image\/[a-z0-9.+-]+;base64,/i;

export function stripDataUrlBase64(raw: string): string {
  const t = raw.trim();
  if (DATA_IMAGE_B64_PREFIX.test(t)) {
    return t.replace(DATA_IMAGE_B64_PREFIX, '');
  }
  return t;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/**
 * True when hostname should not be fetched server-side (basic SSRF mitigation).
 */
export function isBlockedImageFetchHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h === 'metadata.google.internal'
  ) {
    return true;
  }
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4.test(h)) {
    return false;
  }
  const parts = h.split('.').map((x) => Number(x));
  if (parts.some((n) => Number.isNaN(n) || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10) {
    return true;
  }
  if (a === 127) {
    return true;
  }
  if (a === 0) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  return false;
}

export function pickHttpsImageUrlForFetch(
  body: Record<string, unknown>,
): string | null {
  const candidates = [
    body.image_url,
    body.imageUrl,
    body.source_image_url,
    body.sourceImageUrl,
  ];
  for (const c of candidates) {
    if (!isNonEmptyString(c)) {
      continue;
    }
    try {
      const u = new URL(c.trim());
      if (u.protocol !== 'http:' && u.protocol !== 'https:') {
        continue;
      }
      if (isBlockedImageFetchHostname(u.hostname)) {
        continue;
      }
      return c.trim();
    } catch {
      continue;
    }
  }
  return null;
}

/**
 * Whether the payload already carries base64 image bytes Estio can map to `source_image_b64`.
 */
export function hasMappableSourceImageB64(body: Record<string, unknown>): boolean {
  return pickRawSourceImageB64(body) !== undefined;
}

function pickRawSourceImageB64(body: Record<string, unknown>): string | undefined {
  const candidates = [
    body.source_image_b64,
    body.sourceImageB64,
    body.image_base64,
    body.imageBase64,
  ];
  for (const c of candidates) {
    if (isNonEmptyString(c)) {
      return c.trim();
    }
  }
  return undefined;
}

function copyPassthrough(
  from: Record<string, unknown>,
  to: Record<string, unknown>,
): void {
  for (const k of GENERATE_MEDIA_PASSTHROUGH_KEYS) {
    const v = from[k];
    if (v === undefined || v === null) {
      continue;
    }
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean'
    ) {
      to[k] = v;
    }
  }
}

/**
 * Build the JSON body for `POST /generate-media` (ComfyUI Media Worker API v2+).
 * Preserves top-level `mode` and maps Estio field names to the worker contract.
 */
export function buildGenerateMediaWireBody(
  routing: Extract<MediaJobRoutingKind, 'image_to_video' | 'text_to_video'>,
  body: Record<string, unknown>,
): Record<string, unknown> {
  if (routing === 'text_to_video') {
    if (!isNonEmptyString(body.prompt)) {
      throw new BadRequestException(
        'text_to_video: prompt must be a non-empty string',
      );
    }
    const out: Record<string, unknown> = {
      mode: 'text_to_video',
      prompt: body.prompt.trim(),
    };
    copyPassthrough(body, out);
    return out;
  }

  const out: Record<string, unknown> = { mode: 'image_to_video' };
  const rawB64 = pickRawSourceImageB64(body);
  if (rawB64) {
    out.source_image_b64 = stripDataUrlBase64(rawB64);
  }
  if (typeof body.prompt === 'string') {
    out.prompt = body.prompt;
  }
  copyPassthrough(body, out);
  if (typeof out.source_image_b64 !== 'string' || !out.source_image_b64.trim()) {
    throw new BadRequestException(
      'Image-to-video requires source_image_b64 or image_base64 (or a fetchable http(s) image URL).',
    );
  }
  return out;
}
