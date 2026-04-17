import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHighlightFrame } from "@/components/section-highlight/section-highlight-frame";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/layout/container";
import { getSiteBundle } from "@/lib/cms/fetch-site";
import type { MarketingPageSectionsCMS } from "@/lib/cms/types";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.faq?.sections ?? {}) as MarketingPageSectionsCMS;
  const m = getMessages(raw).faq;
  const title = cms.seoTitle ?? m.seoTitle;
  const description = cms.seoDescription ?? m.seoDescription;
  return marketingDetailMetadata({ title, description }, `/${raw}/faq`);
}

export default async function FaqPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.faq?.sections ?? {}) as MarketingPageSectionsCMS;
  const m = getMessages(raw).faq;
  const kicker = cms.kicker ?? m.kicker;
  const h1 = cms.title ?? m.h1;
  const lead = cms.lead ?? m.lead;

  const fromCms = (cms.items ?? [])
    .filter((i) => i.visible !== false)
    .map((i, idx) => ({
      id: String(i.id ?? idx),
      title: String(i.title ?? ""),
      body: String(i.body ?? ""),
    }))
    .filter((i) => i.title || i.body);
  const items =
    fromCms.length > 0
      ? fromCms
      : m.items.map((it, idx) => ({
          id: String(idx),
          title: it.title,
          body: it.body,
        }));

  return (
    <MarketingShell>
      <SectionHighlightFrame
        as="section"
        sectionId="intro"
        fallbackHighlight={cms._meta?.highlightSection}
        className="border-b border-[var(--border)] bg-[var(--surface)]"
        data-estio-section="intro"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-28">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {kicker}
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.75rem]">
            {h1}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
            {lead}
          </p>
        </Container>
      </SectionHighlightFrame>

      <SectionHighlightFrame
        as="section"
        sectionId="items"
        fallbackHighlight={cms._meta?.highlightSection}
        className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20"
        data-estio-section="items"
      >
        <Container as="div" className="max-w-4xl">
          {items.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              {raw === "ar" ? "لا توجد عناصر بعد." : "No items yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((it) => (
                <details
                  key={it.id}
                  className="group rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
                >
                  <summary className="cursor-pointer list-none font-display text-base font-semibold text-[var(--text)]">
                    {it.title}
                  </summary>
                  <div className="mt-3 text-sm leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
                    {it.body}
                  </div>
                </details>
              ))}
            </div>
          )}
        </Container>
      </SectionHighlightFrame>
    </MarketingShell>
  );
}

