import { proxyMediaApiRequest } from "@/lib/server/media-api-proxy";

/**
 * Explicit route so `POST /api/media/jobs/:id/upgrade` always proxies to Nest
 * `POST /media/jobs/:id/upgrade` (avoids collisions with older catch-all / jobs-only handlers).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  return proxyMediaApiRequest(req, ["jobs", id, "upgrade"]);
}
