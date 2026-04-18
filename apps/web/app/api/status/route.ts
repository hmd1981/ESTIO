/**
 * Same-origin BFF for the GPU/system availability signal.
 *
 * Forwards `GET /api/status` to the ESTIO API `GET /status`. The upstream
 * response is small JSON (`{ gpu: { online, lastCheckedAt, latencyMs, reason } }`)
 * and is already cached server-side (`STATUS_PROBE_TTL_MS`, default 10s), so we
 * additionally hint browsers/CDN to cache for a short window to keep the front
 * page snappy without lying about staleness for too long.
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function GET(req: Request): Promise<Response> {
  const upstreamBase = (
    process.env.API_INTERNAL_URL ?? "http://api:4000"
  ).trim();
  const url = new URL(req.url);
  const qs = url.search ?? "";
  const upstreamUrl = `${joinUrl(upstreamBase, "status")}${qs}`;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const body = await upstream.text();
    const headers = new Headers();
    const ct = upstream.headers.get("content-type");
    if (ct) headers.set("content-type", ct);
    headers.set("cache-control", "public, max-age=5, s-maxage=5");
    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unreachable";
    return new Response(
      JSON.stringify({
        gpu: {
          online: false,
          lastCheckedAt: new Date().toISOString(),
          latencyMs: null,
          reason: `bff_${reason.slice(0, 80)}`,
        },
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      },
    );
  }
}
