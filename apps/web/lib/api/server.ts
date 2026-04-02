/** Server-side API base (Docker service name on the internal network). */
export function getServerApiBase(): string {
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:4000"
  ).replace(/\/$/, "");
}
