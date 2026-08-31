import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Container } from "@/components/layout/container";
import { SectionHighlightFrame } from "@/components/section-highlight/section-highlight-frame";
import { ContactForm } from "@/components/contact/contact-form";
import { getContactProse } from "@/lib/content/contact-prose";
import { CmsVisualMedia } from "@/components/cms/cms-visual-media";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import {
  mergeMarketingContactBlocks,
  mergeMarketingHero,
} from "@/lib/cms/merge-marketing-page";
import type { MarketingPageSectionsCMS } from "@/lib/cms/types";
import type { LeadSource } from "@/lib/leads/api";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { brand, contactPlacements } from "@/lib/content/site";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { toArabicUiNumerals } from "@/lib/i18n/numerals";
import { resolveCmsVisual } from "@/lib/cms/resolve-image";
import { isAllowedGoogleMapsEmbedUrl } from "@/lib/maps/allowed-map-embed";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function placementsFromSettings(settings: Record<string, unknown> | null) {
  const phoneDisplay = settings?.phone
    ? String(settings.phone)
    : contactPlacements.phoneDisplay;
  const phoneRaw = settings?.phone
    ? String(settings.phone).replace(/[\s-]/g, "")
    : "";
  const phoneHref = phoneRaw ? `tel:${phoneRaw}` : contactPlacements.phoneHref;
  const email = settings?.email
    ? String(settings.email)
    : contactPlacements.email;
  const emailHref = email.includes("@")
    ? `mailto:${email}`
    : contactPlacements.emailHref;
  const whatsappHref = settings?.whatsapp
    ? String(settings.whatsapp)
    : contactPlacements.whatsappHref;
  const cityLine =
    [settings?.address, settings?.city, settings?.country]
      .filter(Boolean)
      .join(", ") || contactPlacements.cityLine;
  return {
    phoneDisplay,
    phoneHref,
    email,
    emailHref,
    whatsappHref,
    cityLine,
  };
}

const allowedLeadSources: LeadSource[] = [
  "HOMEPAGE",
  "CONTACT",
  "SERVICE_PAGE",
  "INTAKE",
  "REFERRAL",
  "PARTNER",
  "OTHER",
];

function queryValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function parseLeadSource(value: string | undefined): LeadSource {
  return value && allowedLeadSources.includes(value as LeadSource)
    ? (value as LeadSource)
    : "CONTACT";
}

function parseStudioIntentQuery(
  value: string | undefined,
): "images" | "video" | "brand" | undefined {
  const v = value?.trim().toLowerCase();
  if (v === "images" || v === "video" || v === "brand") return v;
  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.contact?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? (((await getPublishedSiteBundle("en")).marketingPages?.contact
          ?.sections ?? {}) as MarketingPageSectionsCMS)
      : undefined;
  const c = getMessages(raw).contact;
  const seoTitle =
    cms.seoTitle?.trim() ||
    (raw === "ar" ? "" : cmsEn?.seoTitle?.trim()) ||
    c.seoTitle;
  const seoDesc =
    cms.seoDescription?.trim() ||
    (raw === "ar" ? "" : cmsEn?.seoDescription?.trim()) ||
    c.seoDescription;
  return marketingDetailMetadata(
    {
      title: seoTitle,
      description: seoDesc,
    },
    `/${raw}/contact`,
    { locale: raw },
  );
}

export default async function ContactPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const bundle = await getSiteBundle(raw);
  const cms = (bundle.marketingPages?.contact?.sections ??
    {}) as MarketingPageSectionsCMS;
  const cmsEn =
    raw === "ar"
      ? (((await getPublishedSiteBundle("en")).marketingPages?.contact
          ?.sections ?? {}) as MarketingPageSectionsCMS)
      : undefined;
  const sp = (await searchParams) ?? {};
  const formSource = parseLeadSource(queryValue(sp.source));
  const streamlinedStudio =
    queryValue(sp.streamlined) === "1" || queryValue(sp.streamlined) === "true";
  const promptFromQuery = queryValue(sp.prompt);
  const platformFromQuery = queryValue(sp.platform);
  const estimateFromQuery = queryValue(sp.estimate);
  const funnelContextLines = [
    promptFromQuery && `AI Studio preview: ${promptFromQuery}`,
    platformFromQuery && `Platform: ${platformFromQuery}`,
    estimateFromQuery && `Estimate: ${estimateFromQuery}`,
  ].filter(Boolean) as string[];
  const funnelContext =
    funnelContextLines.length > 0 ? funnelContextLines.join("\n") : undefined;
  const messageBase = queryValue(sp.message) ?? queryValue(sp.goal);
  const messageInitial =
    funnelContext && messageBase
      ? `${messageBase}\n\n${funnelContext}`
      : (funnelContext ?? messageBase);

  const formInitialValues = {
    name: queryValue(sp.name),
    email: queryValue(sp.email),
    phone: queryValue(sp.phone),
    company: queryValue(sp.company),
    serviceInterest: queryValue(sp.interest),
    message: messageInitial,
    studioIntent: parseStudioIntentQuery(
      queryValue(sp.intent) ?? queryValue(sp.studioIntent),
    ),
  };
  const ui = getMessages(raw);
  const c = ui.contact;
  const cp = placementsFromSettings(bundle.settings);
  const phoneDisplayUi =
    raw === "ar" ? toArabicUiNumerals(cp.phoneDisplay) : cp.phoneDisplay;
  const hero = mergeMarketingHero(
    cms,
    {
      kicker: c.kicker,
      h1: c.h1,
      leadP1: c.lead,
    },
    { cmsEn, locale: raw },
  );
  const contactBlocks = mergeMarketingContactBlocks(cms, cmsEn, raw);
  const mediaAssets = bundle.mediaAssets ?? {};
  const heroImg = resolveCmsVisual(hero.heroVisual, mediaAssets);
  const trustImg = resolveCmsVisual(contactBlocks.trustVisual, mediaAssets);
  const officeImg = resolveCmsVisual(contactBlocks.officeVisual, mediaAssets);
  const contactProse = getContactProse(raw);

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
          <div
            className={`grid gap-12 ${heroImg?.url ? "lg:grid-cols-12 lg:items-start" : ""}`}
          >
            <div className={heroImg?.url ? "lg:col-span-7" : ""}>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {hero.kicker}
              </p>
              <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold text-[var(--text)] sm:text-4xl">
                {hero.h1}
              </h1>
              {hero.subtitle ? (
                <p className="mt-4 max-w-2xl text-sm font-medium text-[var(--muted)] sm:text-base">
                  {hero.subtitle}
                </p>
              ) : null}
              <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
                {hero.leadP1}
              </p>
              {hero.leadP2 ? (
                <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-[var(--muted)] sm:text-base">
                  {hero.leadP2}
                </p>
              ) : null}
            </div>
            {heroImg?.url ? (
              <div className="lg:col-span-5">
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--canvas)]">
                  <CmsVisualMedia
                    imageRef={hero.heroVisual ?? {}}
                    mediaAssets={mediaAssets}
                    fill
                    className="object-cover"
                    videoClassName="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </SectionHighlightFrame>

      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-12 sm:py-14">
        <Container as="div" className="max-w-3xl">
          <div className="space-y-10">
            {contactProse.map((block) => (
              <div key={block.title}>
                <h2 className="font-display text-xl font-semibold text-[var(--text)] sm:text-2xl">
                  {block.title}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-[1.75] text-[var(--text-body)]">
                  {block.paragraphs.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
        <Container as="div">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7" id="contact-form">
              {trustImg?.url ? (
                <div className="relative mb-10 aspect-[21/9] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] sm:aspect-[2.4/1]">
                  <CmsVisualMedia
                    imageRef={contactBlocks.trustVisual ?? {}}
                    mediaAssets={mediaAssets}
                    fill
                    className="object-cover"
                    videoClassName="absolute inset-0 h-full w-full object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                </div>
              ) : null}
              <h2 className="font-display text-xl font-medium text-[var(--text)] sm:text-2xl">
                {c.formH2}
              </h2>
              <p className="mt-3 mb-8 text-sm leading-relaxed text-[var(--muted)]">
                {c.formLead}
              </p>
              <ContactForm
                copy={ui.contactForm}
                source={formSource}
                initialValues={formInitialValues}
                hideQualification={
                  streamlinedStudio &&
                  formInitialValues.serviceInterest === "AI_STUDIO"
                }
                aiStudioContext={
                  formInitialValues.serviceInterest === "AI_STUDIO"
                    ? {
                        locale: raw,
                        initialGoal: formInitialValues.message,
                      }
                    : undefined
                }
              />
            </div>

            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="sticky top-24 space-y-10">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {c.asideDirectH3}
                  </h3>
                  <div className="mt-4 space-y-3">
                    <a
                      href={cp.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--canvas)]"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="shrink-0 text-green-500"
                        aria-hidden
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {c.whatsapp}
                    </a>
                    <a
                      href={cp.phoneHref}
                      className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--canvas)]"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="shrink-0 text-[var(--accent)]"
                        aria-hidden
                      >
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      {phoneDisplayUi}
                    </a>
                    <a
                      href={cp.emailHref}
                      className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--canvas)]"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="shrink-0 text-[var(--accent)]"
                        aria-hidden
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {cp.email}
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {c.officeH3}
                  </h3>
                  {officeImg?.url ? (
                    <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                      <CmsVisualMedia
                        imageRef={contactBlocks.officeVisual ?? {}}
                        mediaAssets={mediaAssets}
                        fill
                        className="object-cover"
                        videoClassName="absolute inset-0 h-full w-full object-cover"
                        sizes="(max-width: 1024px) 100vw, 320px"
                      />
                    </div>
                  ) : null}
                  <address className="mt-4 not-italic text-sm leading-[1.65] text-[var(--text-body)]">
                    <p className="font-medium text-[var(--text)]">
                      {brand.name}
                    </p>
                    <p className="mt-1">{cp.cityLine}</p>
                    {contactBlocks.mapLinkUrl ? (
                      <p className="mt-3">
                        <a
                          href={contactBlocks.mapLinkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                        >
                          {c.openInGoogleMaps}
                        </a>
                      </p>
                    ) : null}
                  </address>
                </div>

                {contactBlocks.mapEmbedUrl &&
                isAllowedGoogleMapsEmbedUrl(contactBlocks.mapEmbedUrl) ? (
                  <div className="overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
                    <iframe
                      title={ui.contact.mapIframeTitle}
                      src={contactBlocks.mapEmbedUrl}
                      className="aspect-[4/3] w-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>
                ) : null}

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {c.nextH3}
                  </h3>
                  <ol className="mt-4 space-y-4">
                    {c.nextSteps.map((text, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm leading-relaxed text-[var(--text-body)]"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] text-xs font-semibold text-[var(--accent)]">
                          {raw === "ar"
                            ? toArabicUiNumerals(String(i + 1))
                            : i + 1}
                        </span>
                        {text}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </MarketingShell>
  );
}
