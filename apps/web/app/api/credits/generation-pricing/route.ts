import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public: same costs as debit logic (`GET /credits/generation-pricing` on API). */
export async function GET(req: Request) {
  return proxyJson(req, "/credits/generation-pricing", { method: "GET" });
}
