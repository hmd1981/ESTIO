/**
 * Rewrite external `api.estio.org/uploads/…` URLs to the admin BFF proxy
 * so thumbnails/previews load through same-origin instead of relying on the
 * external API DNS record.
 */
const UPLOAD_RE = /^https?:\/\/api\.estio\.org\/uploads\//;

export function proxyUploadUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(UPLOAD_RE, "/api/proxy/uploads/");
}
