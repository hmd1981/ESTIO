import { getServerApiBase } from "@/lib/api/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const upstream = `${getServerApiBase()}/uploads/${path.join("/")}`;

  const res = await fetch(upstream, { cache: "no-store" });

  const headers = new Headers();
  const ct = res.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const cl = res.headers.get("content-length");
  if (cl) headers.set("content-length", cl);
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(res.body, {
    status: res.status,
    headers,
  });
}
