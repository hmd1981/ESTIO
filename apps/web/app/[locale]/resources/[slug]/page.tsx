import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { ResourceArticleBody } from "@/components/resources/resource-article-body";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import {
  getResourceArticleBySlug,
  isResourceSlug,
  resourceSlugs,
} from "@/lib/content/resources-index";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale, locales } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    resourceSlugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isResourceSlug(slug)) return {};
  const article = getResourceArticleBySlug(slug, raw);
  if (!article) return {};
  return marketingDetailMetadata(
    { title: article.title, description: article.description },
    `/${raw}/resources/${slug}`,
    { locale: raw },
  );
}

export default async function ResourceArticlePage({ params }: Props) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isResourceSlug(slug)) notFound();
  const article = getResourceArticleBySlug(slug, raw);
  if (!article) notFound();

  return (
    <MarketingShell>
      <ArticleJsonLd article={article} locale={raw} />
      <ResourceArticleBody article={article} locale={raw} />
    </MarketingShell>
  );
}
