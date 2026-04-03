/**
 * Google only allows framing from specific embed URLs. Share links (maps.app.goo.gl),
 * place URLs, or bare google.com break the iframe ("refused to connect" / blank).
 */
export function isAllowedGoogleMapsEmbedUrl(url: string): boolean {
  const raw = url.trim();
  if (!raw.startsWith("https://")) return false;
  try {
    const u = new URL(raw);
    const host = u.hostname.toLowerCase();
    const path = u.pathname;
    if (path.startsWith("/maps/embed")) {
      return (
        host === "www.google.com" ||
        host === "google.com" ||
        host === "maps.google.com"
      );
    }
    return false;
  } catch {
    return false;
  }
}
