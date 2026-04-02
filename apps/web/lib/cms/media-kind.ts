/** Detect video from URL path (query-stripped) or MIME type from media library. */

const VIDEO_EXT = /\.(mp4|webm|ogg|ogv|m4v|mov)(\?|$)/i;

export function urlLooksLikeVideo(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  const path = url.split("?")[0] ?? "";
  return VIDEO_EXT.test(path);
}

export function mimeLooksLikeVideo(mime: string | undefined): boolean {
  return !!mime?.trim().toLowerCase().startsWith("video/");
}

export function inferVideoMimeType(url: string): string | undefined {
  const clean = url.split("?")[0]?.toLowerCase() ?? "";
  if (clean.endsWith(".webm")) return "video/webm";
  if (clean.endsWith(".ogg") || clean.endsWith(".ogv")) return "video/ogg";
  if (
    clean.endsWith(".mp4") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".mov")
  )
    return "video/mp4";
  return undefined;
}
