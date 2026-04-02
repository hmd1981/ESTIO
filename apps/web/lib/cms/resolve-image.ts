import { mimeLooksLikeVideo, urlLooksLikeVideo } from "@/lib/cms/media-kind";
import type { CmsVisual, MediaAssetMap } from "@/lib/cms/types";

/** CMS image fields that may use either a direct URL or a media library id. */
export type ImageRef = {
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

function sanitizeImageAltValue(raw: string | undefined): string {
  const alt = raw?.trim() || "";
  if (!alt) return "";
  if (/^Gemini_Generated_Image_/i.test(alt)) return "";
  if (/^[\w-]+\.(png|jpe?g|webp|gif|svg|mp4)$/i.test(alt)) return "";
  return alt;
}

/**
 * Prefer explicit `imageUrl`; otherwise resolve `imageMediaAssetId` via the site bundle map.
 * Alt text: CMS ref first, then map entry.
 */
export function resolveImage(
  ref: ImageRef | null | undefined,
  mediaAssets: MediaAssetMap | null | undefined,
): { url: string; alt: string } | null {
  const direct = ref?.imageUrl?.trim();
  if (direct) {
    return {
      url: direct,
      alt: sanitizeImageAltValue(ref?.imageAlt),
    };
  }
  const id = ref?.imageMediaAssetId?.trim();
  if (!id || !mediaAssets) return null;
  const row = mediaAssets[id];
  const url = row?.url?.trim();
  if (!url) return null;
  const alt =
    sanitizeImageAltValue(ref?.imageAlt) ||
    sanitizeImageAltValue(row.alt) ||
    "";
  return { url, alt };
}

/** Convenience for `CmsVisual`-shaped fields from merge helpers. */
export function resolveCmsVisual(
  v: CmsVisual | null | undefined,
  mediaAssets: MediaAssetMap | null | undefined,
): { url: string; alt: string } | null {
  return resolveImage(
    {
      imageUrl: v?.imageUrl,
      imageAlt: v?.imageAlt,
      imageMediaAssetId: v?.imageMediaAssetId,
    },
    mediaAssets,
  );
}

/** Resolved CMS visual is either a raster image or a video file (same CMS fields). */
export type VisualMedia =
  | { kind: "image"; url: string; alt: string }
  | { kind: "video"; url: string; alt: string };

/**
 * Same as `resolveImage`, but classifies video by URL extension or `mimeType` from the bundle.
 * Lets operators assign a video asset to any “image” field in the CMS.
 */
export function resolveVisualMedia(
  ref: ImageRef | null | undefined,
  mediaAssets: MediaAssetMap | null | undefined,
): VisualMedia | null {
  const flat = resolveImage(ref, mediaAssets);
  if (!flat) return null;
  const id = ref?.imageMediaAssetId?.trim();
  const mime = id ? mediaAssets?.[id]?.mimeType : undefined;
  if (mimeLooksLikeVideo(mime) || urlLooksLikeVideo(flat.url)) {
    return { kind: "video", url: flat.url, alt: flat.alt };
  }
  return { kind: "image", url: flat.url, alt: flat.alt };
}

/** Next/Image: remote or protocol-relative URLs need `unoptimized` unless configured in next.config. */
export function imageNeedsUnoptimized(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//")
  );
}
