function joinUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function pickHeaders(inHeaders: Headers): Headers {
  const h = new Headers();
  const allow = new Set([
    "authorization",
    "content-type",
    "accept",
    "accept-language",
    "cookie",
    "user-agent",
  ]);
  for (const [k, v] of inHeaders.entries()) {
    if (allow.has(k.toLowerCase())) h.set(k, v);
  }
  return h;
}

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const upstreamBase = (process.env.API_INTERNAL_URL ?? "http://api:4000").trim();
  const upstreamUrl = joinUrl(upstreamBase, path.join("/"));

  const headers = pickHeaders(req.headers);

  const upstreamResp = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
    // Node.js fetch requires this when streaming a request body (e.g. multipart uploads).
    // TS in the DOM lib doesn't include it, so cast narrowly.
    duplex: "half",
    redirect: "manual",
  } as RequestInit & { duplex: "half" });

  const outHeaders = new Headers(upstreamResp.headers);
  // Avoid leaking hop-by-hop headers and ensure correct content-length handling.
  outHeaders.delete("content-encoding");
  outHeaders.delete("transfer-encoding");

  return new Response(upstreamResp.body, {
    status: upstreamResp.status,
    statusText: upstreamResp.statusText,
    headers: outHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
