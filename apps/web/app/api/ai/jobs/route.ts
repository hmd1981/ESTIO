import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  return proxyJson(
    req,
    "/ai/jobs",
    { method: "POST", body },
    { timeoutMs: 30_000 },
  );
}
