import {
  buildGenerateMediaWireBody,
  hasMappableSourceImageB64,
  isBlockedImageFetchHostname,
  pickHttpsImageUrlForFetch,
  stripDataUrlBase64,
} from './media-worker-generate-media.adapter';

describe('media-worker-generate-media.adapter', () => {
  describe('stripDataUrlBase64', () => {
    it('strips data:image prefix', () => {
      expect(stripDataUrlBase64('data:image/png;base64,QUJD')).toBe('QUJD');
    });
    it('returns raw when no prefix', () => {
      expect(stripDataUrlBase64('  QUJD  ')).toBe('QUJD');
    });
  });

  describe('isBlockedImageFetchHostname', () => {
    it('blocks loopback and RFC1918-style literals', () => {
      expect(isBlockedImageFetchHostname('localhost')).toBe(true);
      expect(isBlockedImageFetchHostname('127.0.0.1')).toBe(true);
      expect(isBlockedImageFetchHostname('10.0.0.1')).toBe(true);
      expect(isBlockedImageFetchHostname('192.168.1.1')).toBe(true);
      expect(isBlockedImageFetchHostname('172.20.0.1')).toBe(true);
      expect(isBlockedImageFetchHostname('169.254.0.1')).toBe(true);
    });
    it('allows public hosts', () => {
      expect(isBlockedImageFetchHostname('example.com')).toBe(false);
      expect(isBlockedImageFetchHostname('cdn.example.org')).toBe(false);
    });
  });

  describe('pickHttpsImageUrlForFetch', () => {
    it('returns null for blocked hosts', () => {
      expect(
        pickHttpsImageUrlForFetch({ image_url: 'http://127.0.0.1/x.png' }),
      ).toBeNull();
    });
    it('returns https URL when allowed', () => {
      expect(
        pickHttpsImageUrlForFetch({
          image_url: 'https://example.com/a.png',
        }),
      ).toBe('https://example.com/a.png');
    });
  });

  describe('hasMappableSourceImageB64', () => {
    it('detects Estio base64 keys', () => {
      expect(hasMappableSourceImageB64({ image_base64: 'abc' })).toBe(true);
      expect(hasMappableSourceImageB64({ source_image_b64: 'x' })).toBe(true);
      expect(hasMappableSourceImageB64({ prompt: 'x' })).toBe(false);
    });
  });

  describe('buildGenerateMediaWireBody', () => {
    it('maps image_to_video Estio payload to worker contract', () => {
      const wire = buildGenerateMediaWireBody('image_to_video', {
        mode: 'image_to_video',
        prompt: 'pan left',
        image_base64: 'QUJD',
        duration_seconds: 5,
        motion_strength: 0.4,
      });
      expect(wire).toEqual({
        mode: 'image_to_video',
        prompt: 'pan left',
        source_image_b64: 'QUJD',
        duration_seconds: 5,
        motion_strength: 0.4,
      });
    });

    it('builds text_to_video body with mode and prompt', () => {
      expect(
        buildGenerateMediaWireBody('text_to_video', {
          mode: 'text_to_video',
          prompt: 'ocean waves',
          duration_seconds: 3,
        }),
      ).toEqual({
        mode: 'text_to_video',
        prompt: 'ocean waves',
        duration_seconds: 3,
      });
    });
  });
});
