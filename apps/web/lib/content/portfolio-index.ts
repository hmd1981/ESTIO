import type { AppLocale } from "@/lib/i18n/config";
import type { PortfolioContentBundle } from "./portfolio-types";
import { getPortfolioContentEn } from "./portfolio";
import { getPortfolioContentAr } from "./portfolio-ar";

export function getPortfolioContent(locale: AppLocale): PortfolioContentBundle {
  return locale === "ar" ? getPortfolioContentAr() : getPortfolioContentEn();
}

export {
  portfolioProjectSlugs,
  isPortfolioProjectSlug,
  resolvePortfolioImage,
  portfolioScreenshotUrl,
} from "./portfolio-types";
export type {
  PortfolioProject,
  PortfolioCategory,
  PortfolioIndexContent,
} from "./portfolio-types";
