import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

type Payload = {
  secret?: string;
  tags?: string[];
  paths?: string[];
};

type PathSpec = { path: string; type?: "page" | "layout" };

function pathSpecsFromTag(tag: string): PathSpec[] {
  const publicSite = /^public-site:(en|ar)$/u.exec(tag);
  if (publicSite) {
    const locale = publicSite[1];
    return [
      { path: `/${locale}`, type: "layout" },
      { path: `/${locale}` },
      { path: `/${locale}/about` },
      { path: `/${locale}/contact` },
      { path: `/${locale}/services` },
      { path: `/${locale}/enterprise` },
      { path: `/${locale}/faq` },
    ];
  }

  const service = /^service:(en|ar):(.+)$/u.exec(tag);
  if (!service) return [];
  const [, locale, slug] = service;
  const detailPath =
    slug === "enterprise"
      ? `/${locale}/enterprise`
      : slug === "private-ai"
        ? `/${locale}/enterprise/private-ai`
        : slug === "automation"
          ? `/${locale}/enterprise/automation`
          : `/${locale}/services/${slug}`;
  return [ { path: detailPath } ];
}

export async function POST(req: Request) {
  let body: Payload | null = null;
  try {
    body = (await req.json()) as Payload;
  } catch {
    body = null;
  }

  const expected = process.env.REVALIDATE_SECRET?.trim();
  if (!expected || body?.secret?.trim() !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tags = Array.isArray(body?.tags) ? body!.tags!.filter(Boolean) : [];
  const explicitPaths = Array.isArray(body?.paths)
    ? body.paths.filter((path): path is string => Boolean(path?.trim()))
    : [];
  if (tags.length === 0 && explicitPaths.length === 0) {
    return NextResponse.json(
      { ok: false, error: "tags or paths is required" },
      { status: 400 },
    );
  }

  for (const t of tags) {
    revalidateTag(t, "max");
  }

  const pathSpecs = new Map<string, PathSpec>();
  for (const path of explicitPaths) {
    pathSpecs.set(`page:${path}`, { path });
  }
  for (const tag of tags) {
    for (const spec of pathSpecsFromTag(tag)) {
      pathSpecs.set(`${spec.type ?? "page"}:${spec.path}`, spec);
    }
  }
  for (const spec of pathSpecs.values()) {
    revalidatePath(spec.path, spec.type);
  }

  return NextResponse.json({
    ok: true,
    revalidated: {
      tags,
      paths: Array.from(pathSpecs.values()).map((spec) => ({
        path: spec.path,
        type: spec.type ?? "page",
      })),
    },
  });
}

