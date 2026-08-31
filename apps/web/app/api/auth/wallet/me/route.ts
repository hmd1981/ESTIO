import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  return proxyJson(
    req,
    "/auth/wallet/me",
    { method: "GET" },
    { forwardAuth: true },
  );
}
