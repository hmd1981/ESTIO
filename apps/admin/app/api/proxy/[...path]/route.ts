function joinUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function pickHeaders(inHeaders: Headers): Headers {
  const h = new Headers();
  const allow = new Set([
    "authorization",
    "x-estio-admin-token",
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
  const url = new URL(req.url);
  const qs = url.search ?? "";
  const upstreamUrl = `${joinUrl(upstreamBase, path.join("/"))}${qs}`;

  const headers = pickHeaders(req.headers);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstreamInit: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: "manual",
  };
  if (hasBody && req.body != null) {
    upstreamInit.duplex = "half";
  }

  const upstreamResp = await fetch(upstreamUrl, upstreamInit);

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
