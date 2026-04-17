import { proxyPaymentsApiRequest } from "@/lib/server/payments-api-proxy";

/** POST /api/payments/create → backend POST /payments/create */
export function POST(req: Request) {
  return proxyPaymentsApiRequest(req, ["create"]);
}
