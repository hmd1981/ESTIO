/**
 * Tiny shared helper for same-origin BFF route handlers that proxy to the
 * NestJS API. Centralizes timeouts, header-forwarding rules, and error
 * shape so each route file stays a 5-line declaration.
 */

const DEFAULT_TIMEOUT_MS = 12_000;

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function upstreamBase(): string {
  return (process.env.API_INTERNAL_URL ?? "http://api:4000").trim();
}

interface ProxyOptions {
  /** Forward the incoming `Authorization: Bearer …` header to the API. Off by
   * default — only enable on routes that depend on a wallet session. */
  forwardAuth?: boolean;
  /** Browser/CDN cache-control hint for the response. Defaults to no-store. */
  cacheControl?: string;
  /** Override the default 12s timeout. */
  timeoutMs?: number;
}

export async function proxyJson(
  req: Request,
  upstreamPath: string,
  init: RequestInit,
  options: ProxyOptions = {},
): Promise<Response> {
  const url = new URL(req.url);
  const qs = url.search ?? "";
  const target = `${joinUrl(upstreamBase(), upstreamPath)}${qs}`;
  const headers = new Headers({ accept: "application/json" });
  if (init.body != null && !(init.headers instanceof Headers)) {
    headers.set("content-type", "application/json");
  }
  if (options.forwardAuth) {
    const auth = req.headers.get("authorization");
    if (auth) headers.set("authorization", auth);
  }
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) headers.set("x-forwarded-for", forwarded);
  const realIp = req.headers.get("x-real-ip");
  if (realIp) headers.set("x-real-ip", realIp);

  try {
    const upstream = await fetch(target, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
    const body = await upstream.text();
    const out = new Headers();
    const ct = upstream.headers.get("content-type");
    if (ct) out.set("content-type", ct);
    out.set("cache-control", options.cacheControl ?? "no-store");
    return new Response(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unreachable";
    return new Response(
      JSON.stringify({ error: `bff_${reason.slice(0, 80)}` }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
