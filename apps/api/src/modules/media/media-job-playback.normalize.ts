/**
 * Derives a browser-safe primary media descriptor from raw worker JSON.
 * Does not persist — computed at read time from `resultPayload`.
 *
 * Comfy-style `{ outputs: { … images: [{ filename, subfolder, type }] } }` becomes an `http_url`
 * playback when **`MEDIA_JOB_VIEW_BASE_URL`** is set (and **`MEDIA_JOB_VIEW_PATH`**, default `/view`).
 * Use a **browser-reachable** Comfy origin — never `host.docker.internal`.
 */

export type MediaPlaybackMedia = 'image' | 'video';

export type MediaJobPlaybackDescriptor =
  | {
      kind: 'http_url';
      media: MediaPlaybackMedia;
      url: string;
    }
  | {
      kind: 'data_url';
      media: MediaPlaybackMedia;
      dataUrl: string;
    };

function isSafeHttpMediaUrl(s: string, media: MediaPlaybackMedia): boolean {
  const t = s.trim();
  if (!/^https?:\/\//i.test(t)) {
    return false;
  }
  try {
    const u = new URL(t);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return false;
    }
    if (media === 'video') {
      const p = u.pathname.toLowerCase();
      return (
        p.endsWith('.mp4') ||
        p.endsWith('.webm') ||
        p.endsWith('.mov') ||
        p.endsWith('.m4v') ||
        !/\.[a-z0-9]{1,8}$/i.test(u.pathname)
      );
    }
    return true;
  } catch {
    return false;
  }
}

function isSafeImageDataUrl(s: string): boolean {
  const t = s.trim();
  return (
    t.startsWith('data:image/') &&
    (t.includes(';base64,') || t.startsWith('data:image/svg+xml,'))
  );
}

function isSafeVideoDataUrl(s: string): boolean {
  const t = s.trim();
  return t.startsWith('data:video/') && t.includes(';base64,');
}

function tryHttpUrl(v: unknown, media: MediaPlaybackMedia): string | null {
  if (typeof v !== 'string' || !v.trim()) {
    return null;
  }
  const s = v.trim();
  return isSafeHttpMediaUrl(s, media) ? s : null;
}

function pickImageHttpFromObject(o: Record<string, unknown>): string | null {
  const keys = [
    'image_url',
    'imageUrl',
    'url',
    'output_url',
    'outputUrl',
    'result_url',
    'resultUrl',
    'public_url',
    'publicUrl',
  ];
  for (const k of keys) {
    const u = tryHttpUrl(o[k], 'image');
    if (u) {
      return u;
    }
  }
  const images = o.images;
  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const r = first as Record<string, unknown>;
      const u = tryHttpUrl(r.url, 'image') ?? tryHttpUrl(r.image_url, 'image');
      if (u) {
        return u;
      }
    }
  }
  for (const nested of ['output', 'result', 'image', 'data']) {
    const inner = o[nested];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const u = pickImageHttpFromObject(inner as Record<string, unknown>);
      if (u) {
        return u;
      }
    }
  }
  return null;
}

function pickVideoHttpFromObject(o: Record<string, unknown>): string | null {
  const keys = [
    'video_url',
    'videoUrl',
    'output_url',
    'outputUrl',
    'result_url',
    'resultUrl',
    'url',
    'public_url',
    'publicUrl',
  ];
  for (const k of keys) {
    const u = tryHttpUrl(o[k], 'video');
    if (u) {
      return u;
    }
  }
  const videos = o.videos;
  if (Array.isArray(videos) && videos.length > 0) {
    const first = videos[0];
    if (first && typeof first === 'object' && !Array.isArray(first)) {
      const r = first as Record<string, unknown>;
      const u = tryHttpUrl(r.url, 'video') ?? tryHttpUrl(r.video_url, 'video');
      if (u) {
        return u;
      }
    }
  }
  for (const nested of ['output', 'result', 'data', 'video']) {
    const inner = o[nested];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const u = pickVideoHttpFromObject(inner as Record<string, unknown>);
      if (u) {
        return u;
      }
    }
  }
  return null;
}

function pickImageDataUrl(o: Record<string, unknown>): string | null {
  const b64 = o.image_base64 ?? o.imageBase64;
  if (typeof b64 === 'string' && b64.length > 0) {
    if (b64.startsWith('data:image/')) {
      return isSafeImageDataUrl(b64) ? b64.trim() : null;
    }
    return `data:image/png;base64,${b64}`;
  }
  if (typeof o.url === 'string' && isSafeImageDataUrl(o.url)) {
    return o.url.trim();
  }
  return null;
}

function pickVideoDataUrl(o: Record<string, unknown>): string | null {
  if (typeof o.url === 'string' && isSafeVideoDataUrl(o.url)) {
    return o.url.trim();
  }
  const b64 = o.video_base64 ?? o.videoBase64;
  if (typeof b64 === 'string' && b64.startsWith('data:video/')) {
    return isSafeVideoDataUrl(b64) ? b64.trim() : null;
  }
  return null;
}

function unwrapResultEnvelope(root: unknown): unknown {
  if (!root || typeof root !== 'object' || Array.isArray(root)) {
    return root;
  }
  const o = root as Record<string, unknown>;
  const inner = o.result;
  if (inner !== undefined && inner !== null) {
    return inner;
  }
  return root;
}

function comfyViewBaseFromEnv(): string {
  return (process.env.MEDIA_JOB_VIEW_BASE_URL ?? '').replace(/\/+$/, '');
}

function comfyViewPathFromEnv(): string {
  const p = (process.env.MEDIA_JOB_VIEW_PATH ?? '/view').trim();
  return p.startsWith('/') ? p : `/${p}`;
}

/**
 * ComfyUI `outputs.<id>.images[]` with `filename` / `subfolder` / `type` only (no URL in JSON).
 * Requires `MEDIA_JOB_VIEW_BASE_URL` pointing at a browser-reachable Comfy (or proxy) origin.
 */
function pickComfyViewImageUrl(
  o: Record<string, unknown>,
  base: string,
  viewPath: string,
): string | null {
  const outs = o.outputs;
  if (outs && typeof outs === 'object' && !Array.isArray(outs)) {
    for (const nodeVal of Object.values(outs as Record<string, unknown>)) {
      if (!nodeVal || typeof nodeVal !== 'object' || Array.isArray(nodeVal)) {
        continue;
      }
      const images = (nodeVal as Record<string, unknown>).images;
      if (!Array.isArray(images)) {
        continue;
      }
      for (const im of images) {
        if (!im || typeof im !== 'object' || Array.isArray(im)) {
          continue;
        }
        const r = im as Record<string, unknown>;
        const fn = r.filename;
        if (typeof fn !== 'string' || !fn.trim()) {
          continue;
        }
        const sub = typeof r.subfolder === 'string' ? r.subfolder : '';
        const ty = typeof r.type === 'string' ? r.type : 'output';
        const q = new URLSearchParams();
        q.set('filename', fn.trim());
        q.set('type', ty);
        q.set('subfolder', sub);
        return `${base}${viewPath}?${q.toString()}`;
      }
    }
  }
  const inner = o.result;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return pickComfyViewImageUrl(
      inner as Record<string, unknown>,
      base,
      viewPath,
    );
  }
  return null;
}

/**
 * Best-effort primary playback URL/data URL for Studio `<img>` / `<video src>`.
 * Returns `null` if only opaque or non-browser-safe values exist — client may still inspect `result`.
 */
export function normalizeMediaJobPlayback(
  mediaKind: 'image' | 'video' | 'unknown',
  rawResult: unknown,
): MediaJobPlaybackDescriptor | null {
  const data = unwrapResultEnvelope(rawResult);

  if (typeof data === 'string') {
    const s = data.trim();
    if (mediaKind === 'video' || isSafeVideoDataUrl(s)) {
      if (isSafeHttpMediaUrl(s, 'video')) {
        return { kind: 'http_url', media: 'video', url: s };
      }
      if (isSafeVideoDataUrl(s)) {
        return { kind: 'data_url', media: 'video', dataUrl: s };
      }
    }
    if (isSafeHttpMediaUrl(s, 'image')) {
      return { kind: 'http_url', media: 'image', url: s };
    }
    if (isSafeImageDataUrl(s)) {
      return { kind: 'data_url', media: 'image', dataUrl: s };
    }
    return null;
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }
  const o = data as Record<string, unknown>;

  const preferVideo = mediaKind === 'video';
  const preferImage = mediaKind === 'image';

  if (preferVideo || mediaKind === 'unknown') {
    const vHttp = pickVideoHttpFromObject(o);
    if (vHttp) {
      return { kind: 'http_url', media: 'video', url: vHttp };
    }
    const vData = pickVideoDataUrl(o);
    if (vData) {
      return { kind: 'data_url', media: 'video', dataUrl: vData };
    }
  }

  if (preferImage || mediaKind === 'unknown') {
    const iHttp = pickImageHttpFromObject(o);
    if (iHttp) {
      return { kind: 'http_url', media: 'image', url: iHttp };
    }
    const iData = pickImageDataUrl(o);
    if (iData) {
      return { kind: 'data_url', media: 'image', dataUrl: iData };
    }
    const comfyBase = comfyViewBaseFromEnv();
    if (comfyBase) {
      const comfy = pickComfyViewImageUrl(o, comfyBase, comfyViewPathFromEnv());
      if (comfy && isSafeHttpMediaUrl(comfy, 'image')) {
        return { kind: 'http_url', media: 'image', url: comfy };
      }
    }
  }

  return null;
}
