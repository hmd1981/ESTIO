/**
 * ComfyUI stores saved images as `{ filename, subfolder, type }` under `outputs.<nodeId>.images[]`.
 * Browsers need an HTTP URL — typically Comfy's `GET /view?filename=…&type=…&subfolder=…`.
 *
 * Set `NEXT_PUBLIC_MEDIA_JOB_VIEW_BASE_URL` to the **browser-reachable** origin (public Comfy,
 * or your API if you use `GET /media/comfy-view` — see deploy/env.prod.example option B).
 * No trailing slash. Path defaults to `/view`; use `/media/comfy-view` when proxying via the API.
 */

export function mediaJobViewBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_MEDIA_JOB_VIEW_BASE_URL ?? "").replace(
    /\/+$/,
    "",
  );
}

export function mediaJobViewPath(): string {
  const p = (process.env.NEXT_PUBLIC_MEDIA_JOB_VIEW_PATH ?? "/view").trim();
  return p.startsWith("/") ? p : `/${p}`;
}

/** First Comfy output image → `/view?…` URL, or null if no base or no outputs. */
export function buildComfyViewImageUrl(
  root: unknown,
  baseUrl: string,
  viewPath = "/view",
): string | null {
  const base = baseUrl.replace(/\/+$/, "");
  const path = viewPath.startsWith("/") ? viewPath : `/${viewPath}`;
  if (!base) return null;

  const fromRecord = (o: Record<string, unknown>): string | null => {
    const outs = o.outputs;
    if (outs && typeof outs === "object" && !Array.isArray(outs)) {
      const u = firstImageInOutputs(outs as Record<string, unknown>, base, path);
      if (u) return u;
    }
    const inner = o.result;
    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
      return fromRecord(inner as Record<string, unknown>);
    }
    return null;
  };

  if (!root || typeof root !== "object" || Array.isArray(root)) {
    return null;
  }
  return fromRecord(root as Record<string, unknown>);
}

function firstImageInOutputs(
  outs: Record<string, unknown>,
  base: string,
  viewPath: string,
): string | null {
  for (const nodeVal of Object.values(outs)) {
    if (!nodeVal || typeof nodeVal !== "object" || Array.isArray(nodeVal)) {
      continue;
    }
    const images = (nodeVal as Record<string, unknown>).images;
    if (!Array.isArray(images)) {
      continue;
    }
    for (const im of images) {
      if (!im || typeof im !== "object" || Array.isArray(im)) {
        continue;
      }
      const r = im as Record<string, unknown>;
      const fn = r.filename;
      if (typeof fn !== "string" || !fn.trim()) {
        continue;
      }
      const sub = typeof r.subfolder === "string" ? r.subfolder : "";
      const ty = typeof r.type === "string" ? r.type : "output";
      const q = new URLSearchParams();
      q.set("filename", fn.trim());
      q.set("type", ty);
      q.set("subfolder", sub);
      return `${base}${viewPath}?${q.toString()}`;
    }
  }
  return null;
}
