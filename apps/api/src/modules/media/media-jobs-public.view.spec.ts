import type { MediaGenerationJob } from '@prisma/client';
import { buildMediaJobResultSuccess } from './media-jobs-public.view';

describe('buildMediaJobResultSuccess (playback normalization)', () => {
  let prevViewBase: string | undefined;
  let prevViewPath: string | undefined;

  beforeEach(() => {
    prevViewBase = process.env.MEDIA_JOB_VIEW_BASE_URL;
    prevViewPath = process.env.MEDIA_JOB_VIEW_PATH;
  });

  afterEach(() => {
    if (prevViewBase === undefined) {
      delete process.env.MEDIA_JOB_VIEW_BASE_URL;
    } else {
      process.env.MEDIA_JOB_VIEW_BASE_URL = prevViewBase;
    }
    if (prevViewPath === undefined) {
      delete process.env.MEDIA_JOB_VIEW_PATH;
    } else {
      process.env.MEDIA_JOB_VIEW_PATH = prevViewPath;
    }
  });

  const baseRow = {
    id: 'j1',
    type: 'text_to_image',
    status: 'completed',
    createdAt: new Date(),
    startedAt: new Date(),
    completedAt: new Date(),
    inputPayload: {},
    inputMeta: {},
    errorPayload: null,
    errorMessage: null,
    upstreamHttpStatus: null,
    workerRemoteJobId: null,
    workerTargetHost: null,
  } as unknown as MediaGenerationJob;

  it('fills playback from Comfy filenames when MEDIA_JOB_VIEW_BASE_URL is set', () => {
    process.env.MEDIA_JOB_VIEW_BASE_URL = 'https://comfy.public.example';
    process.env.MEDIA_JOB_VIEW_PATH = '/view';
    const row = {
      ...baseRow,
      resultPayload: {
        result: {
          outputs: {
            '9': {
              images: [
                {
                  type: 'output',
                  filename: 'out.png',
                  subfolder: '',
                },
              ],
            },
          },
        },
      },
    } as unknown as MediaGenerationJob;

    const out = buildMediaJobResultSuccess(row);

    expect(out.playback).toEqual({
      kind: 'http_url',
      media: 'image',
      url: 'https://comfy.public.example/view?filename=out.png&type=output&subfolder=',
    });
  });

  it('returns direct https image_url in playback when present', () => {
    const row = {
      ...baseRow,
      resultPayload: {
        image_url: 'https://cdn.example.com/x.png',
      },
    } as unknown as MediaGenerationJob;

    const out = buildMediaJobResultSuccess(row);
    expect(out.playback).toEqual({
      kind: 'http_url',
      media: 'image',
      url: 'https://cdn.example.com/x.png',
    });
  });
});
