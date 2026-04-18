import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: Request,
  context: { params: Promise<{ paymentRef: string }> },
) {
  const { paymentRef } = await context.params;
  return proxyJson(
    req,
    `/payments/${encodeURIComponent(paymentRef)}/status`,
    { method: "GET" },
  );
}
