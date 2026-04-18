import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  return proxyJson(
    req,
    "/payments/create",
    { method: "POST", body },
    { forwardAuth: true },
  );
}
