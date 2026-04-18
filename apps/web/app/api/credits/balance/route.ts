import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return proxyJson(
    req,
    "/credits/balance",
    { method: "GET" },
    { forwardAuth: true },
  );
}
