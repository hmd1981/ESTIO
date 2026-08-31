import { getServerApiBase } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const upstream = `${getServerApiBase()}/uploads/${path.join("/")}`;

  try {
    const res = await fetch(upstream, {
      cache: "force-cache",
      next: { revalidate: 60 * 60 * 24 * 7 },
      signal: AbortSignal.timeout(12_000),
    });

    const headers = new Headers();
    const ct = res.headers.get("content-type");
    if (ct) headers.set("content-type", ct);
    const cl = res.headers.get("content-length");
    if (cl) headers.set("content-length", cl);
    // Never pin error responses in the browser/CDN — a missing file would
    // otherwise stay 404 for a year.
    headers.set(
      "cache-control",
      res.ok
        ? "public, max-age=31536000, immutable"
        : "no-store",
    );

    return new Response(res.body, {
      status: res.status,
      headers,
    });
  } catch {
    return new Response("Upload upstream unavailable", {
      status: 502,
      headers: { "cache-control": "no-store" },
    });
  }
}
