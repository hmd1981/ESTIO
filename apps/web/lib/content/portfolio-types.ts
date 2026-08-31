export type PortfolioCategory =
  | "platform"
  | "commerce"
  | "media"
  | "fintech"
  | "services"
  | "competition";

export type PortfolioProject = {
  slug: string;
  title: string;
  domain: string;
  url: string;
  category: PortfolioCategory;
  year: string;
  description: string;
  deliverables: string[];
  tags: string[];
  /** Direct hero / OG / uploaded screenshot URL when available. */
  imageUrl?: string;
  imageAlt: string;
  /** How the hero image fits the frame — use `contain` for logos and square artwork. */
  imageFit?: "cover" | "contain";
};

export type PortfolioIndexContent = {
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  h1: string;
  lead: string;
  competitionLead: string;
  categoryLabels: Record<PortfolioCategory, string>;
};

export const portfolioProjectSlugs = [
  "estio-tech",
  "estio-ir",
  "omoney-online",
  "mycafes-app",
  "beenbo-app",
  "omansale-online",
  "omanphoto-com",
  "otofix-services",
  "omanlaw-om",
] as const;

export type PortfolioProjectSlug = (typeof portfolioProjectSlugs)[number];

export function isPortfolioProjectSlug(x: string): x is PortfolioProjectSlug {
  return (portfolioProjectSlugs as readonly string[]).includes(x);
}

export function portfolioScreenshotUrl(url: string): string {
  const bare = url.replace(/^https?:\/\//, "");
  return `https://image.thum.io/get/width/1600/noanimate/https://${bare}`;
}

export function resolvePortfolioImage(project: PortfolioProject): string {
  return project.imageUrl ?? portfolioScreenshotUrl(project.url);
}

export type PortfolioContentBundle = {
  index: PortfolioIndexContent;
  projects: PortfolioProject[];
};