import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PortfolioShowcase } from "@/components/portfolio/portfolio-showcase";
import { getPortfolioContent } from "@/lib/content/portfolio-index";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const { index } = getPortfolioContent(raw);
  return marketingDetailMetadata(
    { title: index.seoTitle, description: index.seoDescription },
    `/${raw}/work`,
    { locale: raw },
  );
}

export default async function WorkPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  return (
    <MarketingShell>
      <PortfolioShowcase locale={raw} />
    </MarketingShell>
  );
}
