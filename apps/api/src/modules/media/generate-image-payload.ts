import { BadRequestException } from '@nestjs/common';

/** Matches worker contract minimum; extra keys are forwarded unchanged. */
export const GENERATE_IMAGE_PROMPT_MAX_LENGTH = 8000;

/**
 * Validates the minimum contract (`prompt`) and returns the same object reference
 * so all JSON fields are forwarded to the worker.
 */
export function assertGenerateImagePayload(
  body: unknown,
): Record<string, unknown> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new BadRequestException('Body must be a JSON object');
  }
  const o = body as Record<string, unknown>;
  if (typeof o.prompt !== 'string' || !o.prompt.trim()) {
    throw new BadRequestException('prompt must be a non-empty string');
  }
  if (o.prompt.length > GENERATE_IMAGE_PROMPT_MAX_LENGTH) {
    throw new BadRequestException(
      `prompt exceeds maximum length (${GENERATE_IMAGE_PROMPT_MAX_LENGTH})`,
    );
  }
  return o;
}
