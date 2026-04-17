import { proxyPaymentsApiRequest } from "@/lib/server/payments-api-proxy";

/** GET /api/payments/:id/status → backend GET /payments/:id/status */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return proxyPaymentsApiRequest(req, [id, "status"]);
}
