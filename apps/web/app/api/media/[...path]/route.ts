import { proxyMediaApiRequest } from "@/lib/server/media-api-proxy";

/**
 * Same-origin proxy to the Nest API under `/media/...`
 * (e.g. `POST /api/media/jobs`, `GET /api/media/jobs/:id/result`).
 * Upgrade is also handled by `app/api/media/jobs/[id]/upgrade/route.ts` for explicit routing.
 */
async function handle(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxyMediaApiRequest(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
