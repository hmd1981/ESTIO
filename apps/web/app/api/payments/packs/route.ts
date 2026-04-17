import { proxyPaymentsApiRequest } from "@/lib/server/payments-api-proxy";

/** GET /api/payments/packs → backend GET /payments/packs */
export function GET(req: Request) {
  return proxyPaymentsApiRequest(req, ["packs"]);
}
