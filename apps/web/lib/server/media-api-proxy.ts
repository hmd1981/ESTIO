/**
 * Forward `/api/media/...` to Nest `GET|POST /media/...` (see `app/api/media/*`).
 */

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function pickHeaders(inHeaders: Headers): Headers {
  const h = new Headers();
  const allow = new Set([
    "content-type",
    "accept",
    "accept-language",
    "authorization",
    "cookie",
    "user-agent",
  ]);
  for (const [k, v] of inHeaders.entries()) {
    if (allow.has(k.toLowerCase())) h.set(k, v);
  }
  return h;
}

/**
 * @param pathSegments e.g. `['jobs', 'uuid', 'upgrade']` → `/media/jobs/uuid/upgrade`
 */
export async function proxyMediaApiRequest(
  req: Request,
  pathSegments: string[],
): Promise<Response> {
  const upstreamBase = (process.env.API_INTERNAL_URL ?? "http://api:4000").trim();
  const url = new URL(req.url);
  const qs = url.search ?? "";
  const upstreamUrl = `${joinUrl(upstreamBase, ["media", ...pathSegments].join("/"))}${qs}`;

  const headers = pickHeaders(req.headers);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstreamInit: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: "manual",
    signal: AbortSignal.timeout(60_000),
  };
  if (hasBody && req.body != null) {
    upstreamInit.duplex = "half";
  }

  try {
    const upstreamResp = await fetch(upstreamUrl, upstreamInit);

    const outHeaders = new Headers(upstreamResp.headers);
    outHeaders.delete("content-encoding");
    outHeaders.delete("transfer-encoding");

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      statusText: upstreamResp.statusText,
      headers: outHeaders,
    });
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unreachable";
    return new Response(
      JSON.stringify({ error: `media_bff_${reason.slice(0, 80)}` }),
      {
        status: 502,
        headers: { "content-type": "application/json", "cache-control": "no-store" },
      },
    );
  }
}
