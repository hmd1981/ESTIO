import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/layout/container";
import { SectionHighlightFrame } from "@/components/section-highlight/section-highlight-frame";
import { ResourceCardGrid } from "@/components/resources/resource-card-grid";
import {
  getResourcesIndexContent,
  listAllResourceArticles,
} from "@/lib/content/resources-index";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const index = getResourcesIndexContent(raw);
  return marketingDetailMetadata(
    { title: index.seoTitle, description: index.seoDescription },
    `/${raw}/resources`,
    { locale: raw },
  );
}

export default async function ResourcesPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const index = getResourcesIndexContent(raw);
  const articles = listAllResourceArticles(raw);

  return (
    <MarketingShell>
      <SectionHighlightFrame
        as="section"
        sectionId="intro"
        className="border-b border-[var(--border)] bg-[var(--surface)]"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-28">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {index.kicker}
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.75rem]">
            {index.h1}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
            {index.lead}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            {raw === "ar"
              ? "يكتبها فريق التسليم في مسقط وفق معايير تحرير معلنة — لا ترجمات رقيقة ولا صفحات وُجدت للإعلان فقط."
              : "Written by the Muscat delivery team under published editorial standards — not thin translations, not pages built only to host ads."}{" "}
            <a
              href={withLocale("/resources/editorial-standards", raw)}
              className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
            >
              {raw === "ar" ? "معايير التحرير" : "Editorial standards"}
            </a>
          </p>
        </Container>
      </SectionHighlightFrame>

      <SectionHighlightFrame
        as="section"
        sectionId="articles"
        className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20"
      >
        <Container as="div">
          <ResourceCardGrid articles={articles} locale={raw} />
        </Container>
      </SectionHighlightFrame>
    </MarketingShell>
  );
}
