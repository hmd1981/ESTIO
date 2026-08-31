export type ResourceArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type ResourceArticle = {
  slug: string;
  title: string;
  description: string;
  kicker: string;
  publishedAt: string;
  updatedAt: string;
  readMinutes: number;
  tags: string[];
  sections: ResourceArticleSection[];
  relatedServiceHref?: string;
  relatedServiceLabel?: string;
};

export type ResourcesIndexContent = {
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  h1: string;
  lead: string;
};

export const resourceSlugs = [
  "gcc-hospitality-ai-visuals",
  "bilingual-website-launch-gcc",
  "ai-imagery-vs-photography",
  "enterprise-private-ai-governance",
  "gcc-retail-content-campaigns",
  "brand-ai-reference-pack",
  "gcc-whatsapp-campaign-assets",
  "briefing-ai-creative-vendor",
  "arabic-rtl-website-failures",
  "estio-delivery-scoping",
  "editorial-standards",
] as const;

export type ResourceSlug = (typeof resourceSlugs)[number];

export function isResourceSlug(x: string): x is ResourceSlug {
  return (resourceSlugs as readonly string[]).includes(x);
}
