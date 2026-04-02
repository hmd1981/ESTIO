import Link from "next/link";
import { BehavioralMediaFrame } from "@/components/enterprise/behavioral-media-frame";
import { DealEntryCluster } from "@/components/enterprise/deal-entry-cluster";
import { EnterpriseCaseStack } from "@/components/enterprise/enterprise-case-stack";
import { EnterpriseDecisionBar } from "@/components/enterprise/enterprise-decision-bar";
import { EnterpriseFitMatrix } from "@/components/enterprise/enterprise-fit-matrix";
import { EnterpriseProofEngine } from "@/components/enterprise/enterprise-proof-engine";
import { EnterpriseRoiFrame } from "@/components/enterprise/enterprise-roi-frame";
import { SalesMicroLine } from "@/components/enterprise/sales-micro-line";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { Container } from "@/components/layout/container";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { PageBreadcrumbs } from "@/components/nav/page-breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import type { CmsVisual, MediaAssetMap, MarketingPageSectionsCMS } from "@/lib/cms/types";
import type {
  MergedEnterpriseLanding,
  MergedEnterpriseVisuals,
} from "@/lib/cms/merge-marketing-page";
import type { ServiceDetailContent } from "@/lib/content/types";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";

function firstNonEmpty(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return "";
}

function sectionClassName(id: string, base: string, highlightSection?: string) {
  return highlightSection === id
    ? `${base} ring-2 ring-[var(--accent)]/50 ring-inset`
    : base;
}

type ProgramRow = {
  href: string;
  label: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

type Props = {
  content: ServiceDetailContent;
  locale: AppLocale;
  enterpriseVisuals: MergedEnterpriseVisuals;
  landing: MergedEnterpriseLanding;
  cms: MarketingPageSectionsCMS;
  cmsEn?: MarketingPageSectionsCMS;
  mediaAssets: MediaAssetMap;
  programRows: ProgramRow[];
  programsSectionTitle: string;
  highlightSection?: string;
};

export function EnterpriseLandingPage({
  content,
  locale,
  enterpriseVisuals: ev,
  landing,
  cms,
  cmsEn,
  mediaAssets,
  programRows,
  programsSectionTitle,
  highlightSection,
}: Props) {
  const ui = getMessages(locale);
  const t = ui.serviceDetail;
  const el = ui.enterpriseLanding;
  const homeHref = withLocale("/", locale);
  const programsAnchorHref = "#enterprise-programs";
  const dealEntryAnchorHref = "#enterprise-deal-entry";
  const hasDecisionStrip =
    landing.decisionSummary.forTeams.trim() ||
    landing.decisionSummary.requires.trim() ||
    landing.decisionSummary.delivers.trim();

  const parents = content.breadcrumbParents.map((p) => ({
    ...p,
    href: withLocale(p.href, locale),
  }));

  const heroKicker = firstNonEmpty(
    cms.kicker,
    locale === "ar" ? cmsEn?.kicker : undefined,
    el.heroKicker,
  );
  const audienceLine = landing.audienceLine;
  const heroLead = firstNonEmpty(
    cms.lead,
    locale === "ar" ? cmsEn?.lead : undefined,
    content.summary,
  );
  const heroSubtitle = firstNonEmpty(
    cms.subtitle,
    locale === "ar" ? cmsEn?.subtitle : undefined,
  );

  const panelClass =
    "rounded-sm border border-[color-mix(in_srgb,var(--border)_92%,var(--accent)_8%)] bg-[color-mix(in_srgb,var(--surface)_96%,#000_4%)] shadow-[0_1px_0_rgba(212,175,55,0.06)]";
  const blockClass = `${panelClass} p-6 sm:p-7 transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border)_65%)] hover:shadow-[0_0_0_1px_rgba(212,175,55,0.08)]`;

  return (
    <MarketingShell>
      <section
        className={sectionClassName(
          "intro",
          "border-b border-[var(--border)] bg-[var(--surface)]",
          highlightSection,
        )}
        data-estio-section="intro"
      >
        <Container as="div" className="py-14 sm:py-20 lg:py-24">
          <PageBreadcrumbs
            homeHref={homeHref}
            homeLabel={ui.breadcrumbHome}
            ariaLabel={ui.breadcrumbAria}
            parents={parents}
            current={content.title}
          />

          <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-14 lg:items-stretch">
            <div className="flex flex-col lg:col-span-7">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
                {heroKicker}
              </p>
              {audienceLine ? (
                <p className="mt-3 max-w-2xl text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                  {audienceLine}
                </p>
              ) : null}
              {heroSubtitle ? (
                <p className="mt-3 max-w-2xl text-sm font-medium text-[var(--muted)]">
                  {heroSubtitle}
                </p>
              ) : null}
              <h1 className="font-display mt-5 max-w-[22rem] text-3xl font-semibold tracking-tight text-[var(--text)] sm:max-w-2xl sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
                {content.title}
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-[1.75] text-[var(--text-body)] sm:text-lg">
                {heroLead}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <ButtonLink href={dealEntryAnchorHref}>{content.cta.buttonLabel}</ButtonLink>
                <ButtonLink href={programsAnchorHref} variant="secondary">
                  {el.secondaryCtaLabel}
                </ButtonLink>
              </div>
            </div>

            <div className="lg:col-span-5">
              <BehavioralMediaFrame
                imageRef={ev.hero as CmsVisual}
                mediaAssets={mediaAssets}
                aspect="16/10"
                overlay="readability"
                placeholderLabel={el.mediaPlaceholder}
                sizes="(max-width: 1024px) 100vw, 38vw"
                frameClassName="min-h-[220px] sm:min-h-[260px] lg:min-h-0"
                className="shadow-[0_1px_0_rgba(212,175,55,0.06)]"
              />
            </div>
          </div>
          <SalesMicroLine text={el.salesMicro.afterHero} />
        </Container>
      </section>

      <section
        id="enterprise-practice"
        className={sectionClassName(
          "enterprise-practice",
          "border-b border-[var(--border)] bg-[#050505]",
          highlightSection,
        )}
        data-estio-section="enterprise-practice"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
                {landing.practice.title}
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
                {landing.practice.lead}
              </p>
            </div>
            <div className="lg:col-span-5">
              <BehavioralMediaFrame
                imageRef={ev.capability as CmsVisual}
                mediaAssets={mediaAssets}
                aspect="16/10"
                overlay="readability"
                placeholderLabel={el.mediaPlaceholder}
                sizes="(max-width: 1024px) 100vw, 36vw"
                className="shadow-[0_1px_0_rgba(212,175,55,0.06)]"
              />
            </div>
          </div>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {landing.practice.blocks.map((block, i) => (
              <li key={`${block.title}-${i}`} className={blockClass}>
                <div className="-mx-6 -mt-6 mb-6 sm:-mx-7 sm:-mt-7">
                  <BehavioralMediaFrame
                    aspect="2/1"
                    imageRef={block}
                    mediaAssets={mediaAssets}
                    placeholderLabel={el.mediaPlaceholder}
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="rounded-none border-x-0 border-t-0 shadow-none"
                  />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text)]">
                  {block.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.7] text-[var(--muted)]">
                  {block.body}
                </p>
              </li>
            ))}
          </ul>
          <SalesMicroLine text={el.salesMicro.afterPractice} />
        </Container>
      </section>

      <section
        id="enterprise-proof"
        className={sectionClassName(
          "enterprise-proof",
          "border-b border-[var(--border)] bg-[#050505]",
          highlightSection,
        )}
        data-estio-section="enterprise-proof"
      >
        <Container as="div" className="py-14 sm:py-16">
          <SalesMicroLine text={el.salesMicro.beforeProof} />
          <EnterpriseProofEngine
            title={landing.proofEngine.title}
            items={landing.proofEngine.items}
            evidenceLabels={el.evidenceLabels}
            verificationLabels={el.verificationLabels}
            mediaPlaceholder={el.mediaPlaceholder}
            mediaAssets={mediaAssets}
          />
          <SalesMicroLine text={el.salesMicro.afterProof} />
        </Container>
      </section>

      <section
        id="enterprise-case-studies"
        className={sectionClassName(
          "enterprise-case-studies",
          "border-b border-[var(--border)] bg-[var(--surface)]",
          highlightSection,
        )}
        data-estio-section="enterprise-case-studies"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <EnterpriseCaseStack
            landing={landing.caseStudies}
            mediaPlaceholder={el.mediaPlaceholder}
            mediaAssets={mediaAssets}
            blockClass={blockClass}
          />
          <SalesMicroLine text={el.salesMicro.afterCases} />
        </Container>
      </section>

      {(landing.fit.title ||
        landing.fit.lead ||
        landing.fit.fit.length > 0 ||
        landing.fit.nonFit.length > 0) && (
        <section
          id="enterprise-fit"
          className={sectionClassName(
            "enterprise-fit",
            "border-b border-[var(--border)] bg-[#050505]",
            highlightSection,
          )}
          data-estio-section="enterprise-fit"
        >
          <Container as="div" className="py-16 sm:py-20 lg:py-24">
            <EnterpriseFitMatrix fit={landing.fit} panelClass={panelClass} />
            <SalesMicroLine text={el.salesMicro.afterFit} />
          </Container>
        </section>
      )}

      <section
        id="enterprise-programs"
        className={sectionClassName(
          "enterprise-programs",
          "border-b border-[var(--border)] bg-[var(--surface)]",
          highlightSection,
        )}
        data-estio-section="enterprise-programs"
      >
        <Container as="div" className="py-16 sm:py-20">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {programsSectionTitle}
          </p>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {programRows.map((row, i) => (
              <li key={`${row.href}-${i}`}>
                <Link
                  href={withLocale(row.href, locale)}
                  className={`group flex h-full flex-col overflow-hidden ${panelClass} text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_42%,var(--border)_58%)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]`}
                >
                  <PremiumMediaFrame
                    aspect="2/1"
                    imageRef={{
                      imageUrl: row.imageUrl,
                      imageAlt: row.imageAlt,
                      imageMediaAssetId: row.imageMediaAssetId,
                    }}
                    mediaAssets={mediaAssets}
                    placeholderLabel={el.mediaPlaceholder}
                    sizes="(max-width: 640px) 100vw, 50vw"
                    imageClassName="transition-transform duration-300 group-hover:scale-[1.02]"
                    videoClassName="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    className="rounded-none border-x-0 border-t-0 shadow-none"
                  />
                  <div className="flex flex-1 flex-col px-6 py-6">
                    <span className="font-display text-lg font-semibold text-[var(--text)] group-hover:text-[var(--accent)]">
                      {row.label}
                    </span>
                    <p className="mt-3 flex-1 text-sm leading-[1.65] text-[var(--muted)]">
                      {row.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {el.programCardContinue}
                      <span
                        className="inline-block transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
                        aria-hidden
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <SalesMicroLine text={el.salesMicro.afterPrograms} />
        </Container>
      </section>

      {(ev.systemDiagram.imageUrl?.trim() ||
        ev.systemDiagram.imageMediaAssetId?.trim()) && (
        <section
          id="enterprise-system-diagram"
          className={sectionClassName(
            "enterprise-system-diagram",
            "border-b border-[var(--border)] bg-[var(--surface)]",
            highlightSection,
          )}
          data-estio-section="enterprise-system-diagram"
        >
          <Container as="div" className="py-14 sm:py-16 lg:py-20">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {el.diagramSectionTitle}
            </p>
            <p className="mt-4 max-w-2xl text-sm text-[var(--muted)]">{el.diagramLead}</p>
            <div className="mt-10">
              <BehavioralMediaFrame
                imageRef={ev.systemDiagram as CmsVisual}
                mediaAssets={mediaAssets}
                aspect="21/9"
                overlay="readability"
                placeholderLabel={el.mediaPlaceholder}
                sizes="(max-width: 1024px) 100vw, 90vw"
                className="shadow-[0_1px_0_rgba(212,175,55,0.06)]"
              />
            </div>
          </Container>
        </section>
      )}

      <section
        id="enterprise-system-diagrams"
        className={sectionClassName(
          "enterprise-system-diagrams",
          "border-b border-[var(--border)] bg-[#050505]",
          highlightSection,
        )}
        data-estio-section="enterprise-system-diagrams"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
              {landing.diagrams.title}
            </h2>
            <p className="mt-6 text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
              {landing.diagrams.lead}
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {landing.diagrams.items.map((diagram, i) => (
              <div
                key={`${diagram.title}-${i}`}
                className={`${panelClass} overflow-hidden`}
              >
                <div className="border-b border-[var(--border)] px-6 py-5 sm:px-8">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-sm border border-[color-mix(in_srgb,var(--accent)_30%,var(--border)_70%)] px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      {el.diagramTypeLabels[diagram.diagramType]}
                    </span>
                  </div>
                  <h3 className="font-display mt-3 text-xl font-semibold text-[var(--text)] sm:text-2xl">
                    {diagram.title}
                  </h3>
                  {diagram.explanation.trim() ? (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-body)]">
                      {diagram.explanation}
                    </p>
                  ) : null}
                </div>
                {diagram.columns.length > 0 ? (
                  <>
                    <div className="grid gap-4 px-6 py-6 sm:px-8 md:grid-cols-2 xl:grid-cols-4">
                      {diagram.columns.map((column, j) => (
                        <div
                          key={`${diagram.title}-${column.label}-${j}`}
                          className="rounded-sm border border-[var(--border)] bg-[color-mix(in_srgb,var(--canvas)_90%,#000_10%)] px-4 py-5"
                        >
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                            {column.label}
                          </p>
                          <p className="mt-3 text-sm leading-[1.7] text-[var(--text-body)]">
                            {column.body}
                          </p>
                        </div>
                      ))}
                    </div>
                    {diagram.footer ? (
                      <p className="border-t border-[var(--border)] px-6 py-5 text-sm leading-[1.7] text-[var(--muted)] sm:px-8">
                        {diagram.footer}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p className="px-6 py-6 text-sm leading-[1.75] text-[var(--text-body)] sm:px-8">
                    {diagram.body}
                  </p>
                )}
              </div>
            ))}
          </div>
          <SalesMicroLine text={el.salesMicro.afterDiagrams} />
        </Container>
      </section>

      <section
        id="enterprise-roi"
        className={sectionClassName(
          "enterprise-roi",
          "border-b border-[var(--border)] bg-[var(--surface)]",
          highlightSection,
        )}
        data-estio-section="enterprise-roi"
      >
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <EnterpriseRoiFrame
            roi={landing.roi}
            investmentProfileTitle={el.roiInvestmentProfileTitle}
            panelClass={panelClass}
            blockClass={blockClass}
          />
          <SalesMicroLine text={el.salesMicro.afterRoi} />
        </Container>
      </section>

      {(content.capabilities.length > 0 || content.idealClients.length > 0) && (
        <section className="border-b border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16 lg:py-20">
          <Container as="div">
            <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
              {content.capabilities.length > 0 ? (
                <div className={panelClass + " p-8 sm:p-10"}>
                  <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                    {t.capabilities}
                  </h2>
                  <ul className="mt-8 space-y-4">
                    {content.capabilities.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 border-s border-[var(--accent)]/25 ps-4 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {content.idealClients.length > 0 ? (
                <div className={panelClass + " p-8 sm:p-10"}>
                  <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                    {t.idealClients}
                  </h2>
                  <ul className="mt-8 space-y-4">
                    {content.idealClients.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 border-s border-[var(--border)] ps-4 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      )}

      {content.deliverables.length > 0 ? (
        <section className="border-b border-[var(--border)] bg-[#050505] py-14 sm:py-16 lg:py-20">
          <Container as="div">
            <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {t.whatYouReceive}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {t.deliverablesIntro}
            </p>
            <SalesMicroLine text={el.salesMicro.beforeDeliverables} />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.deliverables.map((item) => (
                <li
                  key={item}
                  className={`${panelClass} border-s-2 border-s-[var(--accent)]/35 px-5 py-4 text-sm leading-relaxed text-[var(--text-body)]`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {content.process && content.process.length > 0 && (
        <section
          id="enterprise-process"
          className={sectionClassName(
            "enterprise-process",
            "border-b border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16 lg:py-20",
            highlightSection,
          )}
          data-estio-section="enterprise-process"
        >
          <Container as="div">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
              <div className="lg:col-span-5">
                <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                  {t.howWeWork}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  {t.howWeWorkIntro}
                </p>
              </div>
              <div className="lg:col-span-7">
                <BehavioralMediaFrame
                  imageRef={ev.process as CmsVisual}
                  mediaAssets={mediaAssets}
                  aspect="16/9"
                  overlay="readability"
                  placeholderLabel={el.mediaPlaceholder}
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="shadow-[0_1px_0_rgba(212,175,55,0.06)]"
                />
              </div>
            </div>

            <ol className="mt-12 space-y-0 border border-[var(--border)] bg-[color-mix(in_srgb,var(--canvas)_92%,#000_8%)] lg:mt-14">
              {content.process.map((p, i) => (
                <li
                  key={p.step}
                  className="grid gap-4 border-b border-[var(--border)] px-5 py-6 last:border-b-0 sm:grid-cols-[minmax(0,7rem)_1fr] sm:gap-8 sm:px-8 sm:py-7"
                >
                  <div className="font-display text-2xl font-semibold tabular-nums text-[var(--accent)]/35 sm:pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)]">
                      {p.step}
                    </h3>
                    {p.owner ? (
                      <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]/90">
                        {p.owner}
                      </p>
                    ) : null}
                    <p className="mt-2 text-sm leading-[1.65] text-[var(--muted)]">
                      {p.description}
                    </p>
                    {p.definitionOfDone ? (
                      <p className="mt-3 border-t border-[var(--border)] pt-3 text-sm leading-[1.65] text-[var(--text-body)]">
                        <span className="font-semibold text-[var(--text)]">
                          {t.definitionOfDoneLabel}:{" "}
                        </span>
                        {p.definitionOfDone}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
            <SalesMicroLine text={el.salesMicro.processObjection} />
          </Container>
        </section>
      )}

      {content.additionalSections && content.additionalSections.length > 0 ? (
        <section className="border-b border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16 lg:py-20">
          <Container as="div" className="space-y-14">
            {content.additionalSections.map((sec) => (
              <div key={sec.title} className={`${panelClass} px-8 py-10 sm:px-10 sm:py-12`}>
                <h2 className="font-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
                  {sec.title}
                </h2>
                {sec.paragraphs?.map((p, i) => (
                  <p
                    key={`p-${i}`}
                    className="mt-6 text-sm leading-[1.75] text-[var(--text-body)] sm:text-base"
                  >
                    {p}
                  </p>
                ))}
                {sec.bullets && sec.bullets.length > 0 ? (
                  <ul className="mt-6 space-y-3 border-t border-[var(--border)] pt-6 text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
                    {sec.bullets.map((b, i) => (
                      <li key={`b-${i}`} className="flex gap-3">
                        <span
                          className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]"
                          aria-hidden
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </Container>
        </section>
      ) : null}

      {content.longDescription ? (
        <section className="border-b border-[var(--border)] bg-[#050505] py-12 sm:py-14">
          <Container as="div">
            <div className={`${panelClass} px-8 py-8 sm:px-10`}>
              <p className="whitespace-pre-wrap text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
                {content.longDescription}
              </p>
            </div>
          </Container>
        </section>
      ) : null}

      <section
        id="enterprise-deal-entry"
        className={sectionClassName(
          "enterprise-deal-entry",
          `bg-[#050505] py-16 sm:py-20 lg:py-24${hasDecisionStrip ? " pb-24 sm:pb-32" : ""}`,
          highlightSection,
        )}
        data-estio-section="enterprise-deal-entry"
      >
        <Container as="div">
          <DealEntryCluster
            landing={landing.dealEntry}
            contentHeadline={content.cta.headline}
            contentBody={content.cta.body}
            finalCtaEyebrow={el.finalCtaEyebrow}
            scopedEngagementEyebrow={el.scopedEngagementCtaEyebrow}
            qualificationRequiredLabel={el.qualificationRequiredLabel}
            qualificationOptionalLabel={el.qualificationOptionalLabel}
            preQualification={el.preQualification}
            commitmentPanel={el.commitmentPanel}
            dealPathMicro={el.dealPathMicro}
            structuredEngagementLine={el.structuredEngagementLine}
            locale={locale}
            blockClass={blockClass}
            panelClass={panelClass}
          />
        </Container>
      </section>
      {hasDecisionStrip ? <EnterpriseDecisionBar summary={landing.decisionSummary} /> : null}
    </MarketingShell>
  );
}
