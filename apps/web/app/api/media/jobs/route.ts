import { proxyJson } from "@/lib/bff-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Same-origin BFF for media job submit so we can attach the wallet JWT
 * (held in browser localStorage) without leaking it to a cross-origin
 * fetch. Forwards Authorization header on through to the API; the API
 * decides whether auth is required (PHASE2_ENFORCE_AUTH).
 */
export async function POST(req: Request) {
  const body = await req.text();
  return proxyJson(
    req,
    "/media/jobs",
    { method: "POST", body },
    { forwardAuth: true },
  );
}
