import { normalizeMediaJobPlayback } from './media-job-playback.normalize';

describe('normalizeMediaJobPlayback', () => {
  it('extracts https video URL for video kind', () => {
    const p = normalizeMediaJobPlayback('video', {
      video_url: 'https://cdn.example.com/out.mp4',
    });
    expect(p).toEqual({
      kind: 'http_url',
      media: 'video',
      url: 'https://cdn.example.com/out.mp4',
    });
  });

  it('unwraps { result: … } envelope', () => {
    const p = normalizeMediaJobPlayback('image', {
      result: { image_url: 'https://cdn.example.com/x.png' },
    });
    expect(p?.kind).toBe('http_url');
    expect(p).toMatchObject({ media: 'image' });
  });

  it('rejects javascript: URLs', () => {
    expect(
      normalizeMediaJobPlayback('image', {
        url: 'javascript:alert(1)',
      }),
    ).toBeNull();
  });

  it('returns data_url for data:video base64', () => {
    const p = normalizeMediaJobPlayback('video', 'data:video/mp4;base64,AAAA');
    expect(p).toEqual({
      kind: 'data_url',
      media: 'video',
      dataUrl: 'data:video/mp4;base64,AAAA',
    });
  });

  it('builds Comfy /view URL when MEDIA_JOB_VIEW_BASE_URL is set', () => {
    process.env.MEDIA_JOB_VIEW_BASE_URL = 'https://comfy.example';
    const p = normalizeMediaJobPlayback('image', {
      outputs: {
        '9': {
          images: [
            {
              type: 'output',
              filename: 'api_generate_00001_.png',
              subfolder: '',
            },
          ],
        },
      },
    });
    delete process.env.MEDIA_JOB_VIEW_BASE_URL;
    expect(p).toEqual({
      kind: 'http_url',
      media: 'image',
      url: 'https://comfy.example/view?filename=api_generate_00001_.png&type=output&subfolder=',
    });
  });
});
