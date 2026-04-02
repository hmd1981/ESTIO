/**
 * Server components prefer `API_INTERNAL_URL` (e.g. http://api:4000 in Docker).
 * Browser clients use a same-origin proxy to avoid CORS/network/env drift.
 */
export function getPublicApiBase(): string {
  // In the browser we always hit the admin's own origin, then proxy server-side
  // to the API using `API_INTERNAL_URL`. This avoids CORS and prevents the UI
  // from accidentally talking to 127.0.0.1 on the editor's laptop.
  if (typeof window !== "undefined") {
    return "/api/proxy";
  }

  const internal = process.env.API_INTERNAL_URL?.trim();
  if (internal) return internal.replace(/\/$/, "");

  return (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000").replace(
    /\/$/,
    "",
  );
}
