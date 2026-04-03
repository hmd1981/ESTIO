/** CMS page slugs aggregated into `public/site` bundle for the marketing app. */
export const MARKETING_PAGE_SLUGS = [
  'home',
  'services',
  'enterprise',
  'about',
  'contact',
  'faq',
  'ai-studio',
] as const;

export type MarketingPageSlug = (typeof MARKETING_PAGE_SLUGS)[number];

export function isMarketingPageSlug(s: string): s is MarketingPageSlug {
  return (MARKETING_PAGE_SLUGS as readonly string[]).includes(s);
}
