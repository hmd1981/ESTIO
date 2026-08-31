import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return proxyJson(
    req,
    "/studio-analytics/optimize",
    { method: "GET" },
    { cacheControl: "public, max-age=30, s-maxage=30" },
  );
}
