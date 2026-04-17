import { BadRequestException } from '@nestjs/common';
import {
  assertUnifiedStudioMediaJobBody,
  buildMediaJobInputMeta,
} from './media-job-payload';

describe('assertUnifiedStudioMediaJobBody', () => {
  it('accepts text_to_image with prompt', () => {
    const { mode, payload } = assertUnifiedStudioMediaJobBody({
      mode: 'text_to_image',
      prompt: 'A sunset',
    });
    expect(mode).toBe('text_to_image');
    expect(payload.prompt).toBe('A sunset');
    expect(payload.mode).toBe('text_to_image');
  });

  it('rejects image_to_video without source', () => {
    expect(() =>
      assertUnifiedStudioMediaJobBody({
        mode: 'image_to_video',
        prompt: 'pan',
      }),
    ).toThrow(BadRequestException);
  });

  it('accepts image_to_video with image_url', () => {
    const { mode } = assertUnifiedStudioMediaJobBody({
      mode: 'image_to_video',
      image_url: 'https://example.com/a.png',
    });
    expect(mode).toBe('image_to_video');
  });

  it('accepts text_to_video with prompt', () => {
    const { mode } = assertUnifiedStudioMediaJobBody({
      mode: 'text_to_video',
      prompt: 'Clip subject',
    });
    expect(mode).toBe('text_to_video');
  });
});

describe('buildMediaJobInputMeta', () => {
  it('records imageSourceKey for image_to_video without leaking URL', () => {
    const meta = buildMediaJobInputMeta('image_to_video', {
      image_url: 'https://secret.example/asset',
    });
    expect(meta.imageSourceKey).toBe('image_url');
    expect(JSON.stringify(meta)).not.toContain('secret');
  });
});
