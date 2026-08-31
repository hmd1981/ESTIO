import { cache } from "react";
import type { AppLocale } from "@/lib/i18n/config";
import { getServerApiBase } from "@/lib/api/server";
import type { ServiceDetailContent } from "@/lib/content/types";

export type ApiService = {
  slug: string;
  locale: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  status: string;
  detailBlocks: unknown;
};

/** Dedupes `generateMetadata` + page for the same slug/locale in one request. */
export const fetchPublishedServiceBySlug = cache(
  async function fetchPublishedServiceBySlug(
    slug: string,
    locale: AppLocale,
  ): Promise<ApiService | null> {
    try {
      const base = getServerApiBase();
      const url = `${base}/services/by-slug/${encodeURIComponent(slug)}?locale=${locale}`;
      const r = await fetch(url, {
        next: {
          revalidate: 300,
          tags: [`public-site:${locale}`, `service:${locale}:${slug}`],
        },
        signal: AbortSignal.timeout(8_000),
      });
      if (!r.ok) return null;
      const service = (await r.json()) as ApiService;
      if (process.env.NODE_ENV === "development") {
        console.info("[cms] service detail", {
          locale,
          slug,
          title: service.title,
          status: service.status,
        });
      }
      return service;
    } catch {
      return null;
    }
  },
);

function pickStrings(key: string, blocks: Record<string, unknown>): string[] {
  const v = blocks[key];
  return Array.isArray(v) && v.every((x) => typeof x === "string")
    ? (v as string[])
    : [];
}

function pickProcess(
  blocks: Record<string, unknown>,
): ServiceDetailContent["process"] {
  const v = blocks.process;
  if (!Array.isArray(v)) return undefined;
  const out: { step: string; description: string }[] = [];
  for (const item of v) {
    if (
      item &&
      typeof item === "object" &&
      "step" in item &&
      "description" in item &&
      typeof (item as { step: unknown }).step === "string" &&
      typeof (item as { description: unknown }).description === "string"
    ) {
      out.push({
        step: (item as { step: string }).step,
        description: (item as { description: string }).description,
      });
    }
  }
  return out.length ? out : undefined;
}

function pickHeroVisual(
  blocks: Record<string, unknown>,
): ServiceDetailContent["heroVisual"] | undefined {
  const v = blocks.heroVisual;
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  const imageUrl = typeof o.imageUrl === "string" ? o.imageUrl.trim() : "";
  const imageAlt = typeof o.imageAlt === "string" ? o.imageAlt.trim() : "";
  const imageMediaAssetId =
    typeof o.imageMediaAssetId === "string"
      ? o.imageMediaAssetId.trim()
      : "";
  if (!imageUrl && !imageMediaAssetId) return undefined;
  const out: NonNullable<ServiceDetailContent["heroVisual"]> = {};
  if (imageUrl) out.imageUrl = imageUrl;
  if (imageAlt) out.imageAlt = imageAlt;
  if (imageMediaAssetId) out.imageMediaAssetId = imageMediaAssetId;
  return out;
}

function pickCta(
  blocks: Record<string, unknown>,
  fallback: ServiceDetailContent["cta"],
): ServiceDetailContent["cta"] {
  const v = blocks.cta;
  if (!v || typeof v !== "object") return fallback;
  const o = v as Record<string, unknown>;
  return {
    headline:
      typeof o.headline === "string" ? o.headline : fallback.headline,
    body: typeof o.body === "string" ? o.body : fallback.body,
    href: typeof o.href === "string" ? o.href : fallback.href,
    buttonLabel:
      typeof o.buttonLabel === "string"
        ? o.buttonLabel
        : fallback.buttonLabel,
  };
}

/**
 * Merge CMS/API row with static fallback for missing structured blocks.
 */
export function mapApiServiceToDetailContent(
  row: ApiService,
  fallback: ServiceDetailContent,
): ServiceDetailContent {
  const blocks =
    row.detailBlocks && typeof row.detailBlocks === "object"
      ? (row.detailBlocks as Record<string, unknown>)
      : {};

  const capabilities = pickStrings("capabilities", blocks);
  const idealClients = pickStrings("idealClients", blocks);
  const deliverables = pickStrings("deliverables", blocks);
  const process = pickProcess(blocks);
  const cta = pickCta(blocks, fallback.cta);
  const heroFromCms = pickHeroVisual(blocks);

  const cap =
    capabilities.length > 0 ? capabilities : fallback.capabilities;
  const ideal =
    idealClients.length > 0 ? idealClients : fallback.idealClients;
  const del =
    deliverables.length > 0 ? deliverables : fallback.deliverables;
  const proc = process ?? fallback.process;
  const heroVisual = heroFromCms ?? fallback.heroVisual;

  return {
    slug: row.slug,
    title: row.title,
    summary: row.shortDescription,
    longDescription: row.longDescription || undefined,
    seo: {
      title: `${row.title}  - Estio`,
      description: row.shortDescription.slice(0, 300),
    },
    breadcrumbParents: fallback.breadcrumbParents,
    capabilities: cap,
    idealClients: ideal,
    deliverables: del,
    process: proc,
    additionalSections: fallback.additionalSections,
    cta,
    secondaryCta: fallback.secondaryCta,
    heroVisual,
  };
}
