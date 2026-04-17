import {
  enterpriseHighlightAr,
  finalCtaAr,
  guidedIntentsAr,
  homeHeroAr,
  homeHeroIntentLinksAr,
  industriesAr,
  industriesSectionIntroAr,
  pillarServicesAr,
  servicesSectionIntroAr,
  trustPointsAr,
  trustSectionIntroAr,
} from "@/lib/content/home-ar";
import {
  enterpriseHighlight,
  finalCta,
  guidedIntents,
  homeHero,
  homeHeroIntentLinks,
  industries,
  industriesSectionIntro,
  pillarServices,
  servicesSectionIntro,
  trustPoints,
  trustSectionIntro,
} from "@/lib/content/home";
import type { HomeListItem, HomeSectionsCMS } from "@/lib/cms/types";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { withLocale } from "@/lib/i18n/paths";

export type MergedHero = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** Short intent links under hero CTAs (e.g. Images / Short video / Brand system). */
  intentLinks: { label: string; href: string }[];
  videoUrl?: string;
  videoMediaAssetId?: string;
  /** Explicit CMS URL only; omit when using imageMediaAssetId + mediaAssets map. */
  imageUrl?: string;
  imageAlt: string;
  imageMediaAssetId?: string;
};

export type MergedGuided = {
  sectionKicker: string;
  title: string;
  subtitle: string;
  description: string;
  sectionImage?: {
    url?: string;
    alt: string;
    mediaAssetId?: string;
  };
  sectionCta?: { label: string; href: string };
  items: {
    id: string;
    label: string;
    href: string;
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
  }[];
};

export type MergedTrustPoint = {
  title: string;
  body: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

export type MergedPillar = {
  id: string;
  title: string;
  description: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

export type MergedIndustry = {
  label: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

export type MergedCta = {
  headline: string;
  body: string;
  buttonLabel: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
};

/** First non-empty trimmed string (AR: try `ar` branch fields before `en` fields in caller order). */
function firstNonEmpty(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return "";
}

function visualFrom(
  primary?: { imageUrl?: string; imageAlt?: string; imageMediaAssetId?: string },
  secondary?: { imageUrl?: string; imageAlt?: string; imageMediaAssetId?: string },
):
  | { url?: string; alt: string; mediaAssetId?: string }
  | undefined {
  const url = firstNonEmpty(primary?.imageUrl, secondary?.imageUrl);
  const mediaAssetId = firstNonEmpty(
    primary?.imageMediaAssetId,
    secondary?.imageMediaAssetId,
  );
  if (!url && !mediaAssetId) return undefined;
  return {
    url: url || undefined,
    alt: firstNonEmpty(primary?.imageAlt, secondary?.imageAlt) || "",
    mediaAssetId: mediaAssetId || undefined,
  };
}

function itemLine(it: HomeListItem | undefined): string {
  if (!it) return "";
  return firstNonEmpty(it.title, it.label, (it as { text?: string }).text);
}

/** Correct known CMS copy mistakes on industry cards. */
function normalizeIndustryLabel(label: string): string {
  return label.replace(/\bReal state\b/gi, "Real estate");
}

/**
 * Merge homepage sections. Pass English `cmsEn` for `/ar` **media only** (hero video, images,
 * guided tiles). Arabic **copy** falls back to `home-ar` / messages — never to English CMS text.
 */
export function mergeHomeSections(
  cms: HomeSectionsCMS,
  locale: AppLocale,
  cmsEn?: HomeSectionsCMS,
) {
  const ui = getMessages(locale);
  const HH = locale === "ar" ? homeHeroAr : homeHero;
  const GI = locale === "ar" ? guidedIntentsAr : guidedIntents;
  const TP = locale === "ar" ? trustPointsAr : trustPoints;
  const TSI = locale === "ar" ? trustSectionIntroAr : trustSectionIntro;
  const SSI = locale === "ar" ? servicesSectionIntroAr : servicesSectionIntro;
  const PS = locale === "ar" ? pillarServicesAr : pillarServices;
  const EH = locale === "ar" ? enterpriseHighlightAr : enterpriseHighlight;
  const ISI =
    locale === "ar" ? industriesSectionIntroAr : industriesSectionIntro;
  const IND = locale === "ar" ? industriesAr : industries;
  const FC = locale === "ar" ? finalCtaAr : finalCta;

  const en = cmsEn;
  const skipEnCopy = locale === "ar";

  const defaultHeroImage = "/images/hero-home.png";
  const defaultHeroAlt =
    locale === "ar"
      ? "صورة توضيحية لسياق التسليم الرقمي والأنظمة التشغيلية — إستيو، مسقط (ليست بيئة عميل فعلية)."
      : "Homepage visual: operational context for digital delivery and systems work — Estio, Muscat (illustrative, not a client environment).";

  const heroImage = firstNonEmpty(
    cms.hero?.imageUrl,
    locale === "ar" ? en?.hero?.imageUrl : undefined,
  );
  const heroMediaId = firstNonEmpty(
    cms.hero?.imageMediaAssetId,
    locale === "ar" ? en?.hero?.imageMediaAssetId : undefined,
  );
  const heroVideo = firstNonEmpty(
    cms.hero?.videoUrl,
    locale === "ar" ? en?.hero?.videoUrl : undefined,
  );
  const heroVideoMediaId = firstNonEmpty(
    cms.hero?.videoMediaAssetId,
    locale === "ar" ? en?.hero?.videoMediaAssetId : undefined,
  );

  const defaultIntentLinks =
    locale === "ar" ? homeHeroIntentLinksAr : homeHeroIntentLinks;
  const cmsIntentRaw = cms.hero?.intentLinks;
  const intentLinks: { label: string; href: string }[] =
    cmsIntentRaw && cmsIntentRaw.length > 0
      ? cmsIntentRaw.map((raw, i) => {
          const def = defaultIntentLinks[i];
          return {
            label: firstNonEmpty(
              raw.label,
              skipEnCopy ? undefined : en?.hero?.intentLinks?.[i]?.label,
              def?.label ?? "",
            ),
            href: withLocale(
              firstNonEmpty(
                raw.href,
                skipEnCopy ? undefined : en?.hero?.intentLinks?.[i]?.href,
                def?.href ?? "/ai-studio",
              ),
              locale,
            ),
          };
        })
      : defaultIntentLinks.map((d) => ({
          label: d.label,
          href: withLocale(d.href, locale),
        }));

  const hero: MergedHero = {
    eyebrow: firstNonEmpty(
      cms.hero?.eyebrow,
      skipEnCopy ? undefined : en?.hero?.eyebrow,
      locale === "ar"
        ? "رقمنة وتشغيل ذكي — مسقط · الخليج"
        : "Scoped delivery · Production systems · Muscat, Oman",
    ),
    headline: firstNonEmpty(
      cms.hero?.headline,
      cms.hero?.title,
      skipEnCopy ? undefined : en?.hero?.headline,
      skipEnCopy ? undefined : en?.hero?.title,
      HH.headline,
    ),
    subheadline: firstNonEmpty(
      cms.hero?.subheadline,
      cms.hero?.body,
      skipEnCopy ? undefined : en?.hero?.subheadline,
      skipEnCopy ? undefined : en?.hero?.body,
      HH.subheadline,
    ),
    primaryCta: {
      label: firstNonEmpty(
        cms.hero?.primaryCta?.label,
        skipEnCopy ? undefined : en?.hero?.primaryCta?.label,
        HH.primaryCta.label,
      ),
      href: withLocale(
        firstNonEmpty(
          cms.hero?.primaryCta?.href,
          skipEnCopy ? undefined : en?.hero?.primaryCta?.href,
          HH.primaryCta.href,
        ),
        locale,
      ),
    },
    secondaryCta: {
      label: firstNonEmpty(
        cms.hero?.secondaryCta?.label,
        skipEnCopy ? undefined : en?.hero?.secondaryCta?.label,
        HH.secondaryCta.label,
      ),
      href: withLocale(
        firstNonEmpty(
          cms.hero?.secondaryCta?.href,
          skipEnCopy ? undefined : en?.hero?.secondaryCta?.href,
          HH.secondaryCta.href,
        ),
        locale,
      ),
    },
    intentLinks,
    videoUrl: heroVideo || undefined,
    videoMediaAssetId: heroVideoMediaId || undefined,
    imageUrl: heroImage || undefined,
    imageAlt: firstNonEmpty(
      cms.hero?.imageAlt,
      locale === "ar" ? en?.hero?.imageAlt : undefined,
      defaultHeroAlt,
    ),
    imageMediaAssetId: heroMediaId || undefined,
  };

  const guidedDefaultTitle =
    locale === "ar"
      ? "اختر المسار الأقرب لقيودكم التشغيلية"
      : "Pick the engagement path that matches your constraint";
  const guidedDefaultDesc =
    locale === "ar"
      ? "كل بطاقة تقود إلى ممارسة محدودة النطاق أو ملحق المؤسسات. الاختيار لا يلزمكم تعاقدياً — يحدد فقط كيف نصنّف موجزكم في مسار التأهيل."
      : "Each tile routes to a scoped practice or the enterprise annex. Selection is not commitment — it sets how we classify your brief in qualification.";

  const g = cms.guided;
  const gEn = locale === "ar" ? en?.guided : undefined;
  const gi = cms.guidedIntro;
  const giEn = locale === "ar" ? en?.guidedIntro : undefined;

  const guidedTitle = firstNonEmpty(
    g?.title,
    skipEnCopy ? undefined : gEn?.title,
    gi?.title,
    skipEnCopy ? undefined : giEn?.title,
    guidedDefaultTitle,
  );
  const guidedSubtitle = firstNonEmpty(
    g?.subtitle,
    skipEnCopy ? undefined : gEn?.subtitle,
  );
  const guidedBody = firstNonEmpty(
    g?.body,
    skipEnCopy ? undefined : gEn?.body,
    gi?.description,
    skipEnCopy ? undefined : giEn?.description,
    guidedDefaultDesc,
  );

  const guidedSectionImg = visualFrom(g, gEn);
  const guidedCta =
    g?.ctaLabel ||
    g?.ctaHref ||
    (!skipEnCopy && (gEn?.ctaLabel || gEn?.ctaHref))
      ? {
          label: firstNonEmpty(
            g?.ctaLabel,
            skipEnCopy ? undefined : gEn?.ctaLabel,
          ),
          href: withLocale(
            firstNonEmpty(
              g?.ctaHref,
              skipEnCopy ? undefined : gEn?.ctaHref,
              "/contact",
            ),
            locale,
          ),
        }
      : undefined;

  const guided: MergedGuided = {
    sectionKicker: ui.guidedSectionKicker,
    title: guidedTitle,
    subtitle: guidedSubtitle,
    description: guidedBody,
    sectionImage: guidedSectionImg,
    sectionCta: guidedCta,
    items: GI.map((def, i) => {
      const fromNew =
        g?.items?.find((x) => x.id === def.id) ?? g?.items?.[i];
      const fromNewEn =
        locale === "ar"
          ? gEn?.items?.find((x) => x.id === def.id) ?? gEn?.items?.[i]
          : undefined;
      const fromOld =
        cms.guidedIntents?.find((x) => x.id === def.id) ??
        cms.guidedIntents?.[i];
      const fromOldEn =
        locale === "ar"
          ? en?.guidedIntents?.find((x) => x.id === def.id) ??
            en?.guidedIntents?.[i]
          : undefined;
      const label = firstNonEmpty(
        itemLine(fromNew),
        skipEnCopy ? undefined : itemLine(fromNewEn),
        fromOld?.label,
        skipEnCopy ? undefined : fromOldEn?.label,
        def.label,
      );
      const hrefRaw = firstNonEmpty(
        fromNew?.href,
        skipEnCopy ? undefined : fromNewEn?.href,
        fromOld?.href,
        skipEnCopy ? undefined : fromOldEn?.href,
        def.href,
      );
      return {
        id: String(def.id),
        label,
        href: withLocale(hrefRaw, locale),
        imageUrl: firstNonEmpty(
          fromNew?.imageUrl,
          fromNewEn?.imageUrl,
          fromOld?.imageUrl,
          fromOldEn?.imageUrl,
        ),
        imageAlt: firstNonEmpty(
          fromNew?.imageAlt,
          fromNewEn?.imageAlt,
          fromOld?.imageAlt,
          fromOldEn?.imageAlt,
        ),
        imageMediaAssetId: firstNonEmpty(
          fromNew?.imageMediaAssetId,
          fromNewEn?.imageMediaAssetId,
          fromOld?.imageMediaAssetId,
          fromOldEn?.imageMediaAssetId,
        ),
      };
    }),
  };

  const t = cms.trust;
  const tEn = locale === "ar" ? en?.trust : undefined;
  const tsi = cms.trustSectionIntro;
  const tsiEn = locale === "ar" ? en?.trustSectionIntro : undefined;

  const trustIntro = {
    title: firstNonEmpty(
      t?.title,
      skipEnCopy ? undefined : tEn?.title,
      tsi?.title,
      skipEnCopy ? undefined : tsiEn?.title,
      TSI.title,
    ),
    description: firstNonEmpty(
      t?.body,
      skipEnCopy ? undefined : tEn?.body,
      t?.subtitle,
      skipEnCopy ? undefined : tEn?.subtitle,
      tsi?.description,
      skipEnCopy ? undefined : tsiEn?.description,
      TSI.description,
    ),
    imageUrl: firstNonEmpty(t?.imageUrl, tEn?.imageUrl),
    imageAlt: firstNonEmpty(t?.imageAlt, tEn?.imageAlt),
    imageMediaAssetId: firstNonEmpty(
      t?.imageMediaAssetId,
      tEn?.imageMediaAssetId,
    ),
  };

  const trustPts: MergedTrustPoint[] =
    t?.items && t.items.length > 0
      ? t.items.map((p, i) => ({
          title: firstNonEmpty(
            itemLine(p),
            TP[i]?.title ?? "",
          ),
          body: firstNonEmpty(
            p.description,
            p.text,
            TP[i]?.body ?? "",
          ),
          imageUrl: firstNonEmpty(
            p.imageUrl,
            locale === "ar" ? tEn?.items?.[i]?.imageUrl : undefined,
          ),
          imageAlt: firstNonEmpty(
            p.imageAlt,
            locale === "ar" ? tEn?.items?.[i]?.imageAlt : undefined,
          ),
          imageMediaAssetId: firstNonEmpty(
            p.imageMediaAssetId,
            locale === "ar" ? tEn?.items?.[i]?.imageMediaAssetId : undefined,
          ),
        }))
      : cms.trustPoints && cms.trustPoints.length > 0
        ? cms.trustPoints.map((p, i) => ({
            title: firstNonEmpty(
              p.title,
              skipEnCopy ? undefined : en?.trustPoints?.[i]?.title,
              TP[i]?.title ?? "",
            ),
            body: firstNonEmpty(
              p.body,
              skipEnCopy ? undefined : en?.trustPoints?.[i]?.body,
              TP[i]?.body ?? "",
            ),
            imageUrl: firstNonEmpty(
              p.imageUrl,
              locale === "ar" ? en?.trustPoints?.[i]?.imageUrl : undefined,
            ),
            imageAlt: firstNonEmpty(
              p.imageAlt,
              locale === "ar" ? en?.trustPoints?.[i]?.imageAlt : undefined,
            ),
            imageMediaAssetId: firstNonEmpty(
              p.imageMediaAssetId,
              locale === "ar" ? en?.trustPoints?.[i]?.imageMediaAssetId : undefined,
            ),
          }))
        : TP.map((p) => ({ title: p.title, body: p.body }));

  const s = cms.services;
  const sEn = locale === "ar" ? en?.services : undefined;
  const ssi = cms.servicesSectionIntro;
  const ssiEn = locale === "ar" ? en?.servicesSectionIntro : undefined;

  const svcIntro = {
    title: firstNonEmpty(
      s?.title,
      skipEnCopy ? undefined : sEn?.title,
      ssi?.title,
      skipEnCopy ? undefined : ssiEn?.title,
      SSI.title,
    ),
    description: firstNonEmpty(
      s?.body,
      skipEnCopy ? undefined : sEn?.body,
      s?.subtitle,
      skipEnCopy ? undefined : sEn?.subtitle,
      ssi?.description,
      skipEnCopy ? undefined : ssiEn?.description,
      SSI.description,
    ),
    imageUrl: firstNonEmpty(s?.imageUrl, sEn?.imageUrl),
    imageAlt: firstNonEmpty(s?.imageAlt, sEn?.imageAlt),
    imageMediaAssetId: firstNonEmpty(
      s?.imageMediaAssetId,
      sEn?.imageMediaAssetId,
    ),
  };

  const pillars: MergedPillar[] =
    s?.items && s.items.length > 0
      ? s.items.map((c, i) => ({
          id: String(c.id ?? PS[i]?.id ?? i),
          title: firstNonEmpty(itemLine(c), PS[i]?.title ?? ""),
          description: firstNonEmpty(
            c.description,
            PS[i]?.description ?? "",
          ),
          href: withLocale(
            firstNonEmpty(c.href, PS[i]?.href ?? "/services"),
            locale,
          ),
          imageUrl: firstNonEmpty(
            c.imageUrl,
            locale === "ar" ? sEn?.items?.[i]?.imageUrl : undefined,
          ),
          imageAlt: firstNonEmpty(
            c.imageAlt,
            locale === "ar" ? sEn?.items?.[i]?.imageAlt : undefined,
          ),
          imageMediaAssetId: firstNonEmpty(
            c.imageMediaAssetId,
            locale === "ar" ? sEn?.items?.[i]?.imageMediaAssetId : undefined,
          ),
        }))
      : cms.pillarServices && cms.pillarServices.length > 0
        ? cms.pillarServices.map((c, i) => ({
            id: String(c.id ?? PS[i]?.id ?? i),
            title: firstNonEmpty(
              c.title,
              skipEnCopy ? undefined : en?.pillarServices?.[i]?.title,
              PS[i]?.title ?? "",
            ),
            description: firstNonEmpty(
              c.description,
              skipEnCopy ? undefined : en?.pillarServices?.[i]?.description,
              PS[i]?.description ?? "",
            ),
            href: withLocale(
              firstNonEmpty(
                c.href,
                skipEnCopy ? undefined : en?.pillarServices?.[i]?.href,
                PS[i]?.href ?? "/services",
              ),
              locale,
            ),
            imageUrl: firstNonEmpty(
              c.imageUrl,
              locale === "ar" ? en?.pillarServices?.[i]?.imageUrl : undefined,
            ),
            imageAlt: firstNonEmpty(
              c.imageAlt,
              locale === "ar" ? en?.pillarServices?.[i]?.imageAlt : undefined,
            ),
            imageMediaAssetId: firstNonEmpty(
              c.imageMediaAssetId,
              locale === "ar" ? en?.pillarServices?.[i]?.imageMediaAssetId : undefined,
            ),
          }))
        : PS.map((c) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            href: withLocale(c.href, locale),
          }));

  const entCms = cms.enterprise;
  const entCmsEn = locale === "ar" ? en?.enterprise : undefined;
  const eh = cms.enterpriseHighlight;
  const ehEn = locale === "ar" ? en?.enterpriseHighlight : undefined;

  const ent = {
    headline: firstNonEmpty(
      entCms?.title,
      skipEnCopy ? undefined : entCmsEn?.title,
      eh?.headline,
      skipEnCopy ? undefined : ehEn?.headline,
      EH.headline,
    ),
    body: firstNonEmpty(
      entCms?.body,
      skipEnCopy ? undefined : entCmsEn?.body,
      eh?.body,
      skipEnCopy ? undefined : ehEn?.body,
      EH.body,
    ),
    subtitle: firstNonEmpty(
      entCms?.subtitle,
      skipEnCopy ? undefined : entCmsEn?.subtitle,
      eh?.subtitle,
      skipEnCopy ? undefined : ehEn?.subtitle,
    ),
    imageUrl: firstNonEmpty(
      entCms?.imageUrl,
      entCmsEn?.imageUrl,
      eh?.imageUrl,
      ehEn?.imageUrl,
    ),
    imageAlt: firstNonEmpty(
      entCms?.imageAlt,
      entCmsEn?.imageAlt,
      eh?.imageAlt,
      ehEn?.imageAlt,
    ),
    imageMediaAssetId: firstNonEmpty(
      entCms?.imageMediaAssetId,
      entCmsEn?.imageMediaAssetId,
      eh?.imageMediaAssetId,
      ehEn?.imageMediaAssetId,
    ),
    bullets:
      entCms?.items && entCms.items.length > 0
        ? entCms.items.map((b, i) => ({
            title: firstNonEmpty(itemLine(b), EH.bullets[i]?.title ?? ""),
            text: firstNonEmpty(
              b.description,
              b.text,
              EH.bullets[i]?.text ?? "",
            ),
            imageUrl: firstNonEmpty(
              b.imageUrl,
              locale === "ar" ? entCmsEn?.items?.[i]?.imageUrl : undefined,
            ),
            imageAlt: firstNonEmpty(
              b.imageAlt,
              locale === "ar" ? entCmsEn?.items?.[i]?.imageAlt : undefined,
            ),
            imageMediaAssetId: firstNonEmpty(
              b.imageMediaAssetId,
              locale === "ar" ? entCmsEn?.items?.[i]?.imageMediaAssetId : undefined,
            ),
          }))
        : eh?.bullets && eh.bullets.length > 0
          ? eh.bullets.map((b, i) => ({
              title: firstNonEmpty(
                b.title,
                skipEnCopy ? undefined : ehEn?.bullets?.[i]?.title,
                EH.bullets[i]?.title ?? "",
              ),
              text: firstNonEmpty(
                b.text,
                skipEnCopy ? undefined : ehEn?.bullets?.[i]?.text,
                EH.bullets[i]?.text ?? "",
              ),
              imageUrl: firstNonEmpty(
                b.imageUrl,
                locale === "ar" ? ehEn?.bullets?.[i]?.imageUrl : undefined,
              ),
              imageAlt: firstNonEmpty(
                b.imageAlt,
                locale === "ar" ? ehEn?.bullets?.[i]?.imageAlt : undefined,
              ),
              imageMediaAssetId: firstNonEmpty(
                b.imageMediaAssetId,
                locale === "ar" ? ehEn?.bullets?.[i]?.imageMediaAssetId : undefined,
              ),
            }))
          : EH.bullets.map((b) => ({
              title: b.title,
              text: b.text,
            })),
    cta: {
      label: firstNonEmpty(
        entCms?.ctaLabel,
        skipEnCopy ? undefined : entCmsEn?.ctaLabel,
        eh?.cta?.label,
        skipEnCopy ? undefined : ehEn?.cta?.label,
        EH.cta.label,
      ),
      href: withLocale(
        firstNonEmpty(
          entCms?.ctaHref,
          skipEnCopy ? undefined : entCmsEn?.ctaHref,
          eh?.cta?.href,
          skipEnCopy ? undefined : ehEn?.cta?.href,
          EH.cta.href,
        ),
        locale,
      ),
    },
  };

  const indBlock = cms.industriesContent;
  const indBlockEn = locale === "ar" ? en?.industriesContent : undefined;
  const isi = cms.industriesSectionIntro;
  const isiEn = locale === "ar" ? en?.industriesSectionIntro : undefined;

  const indIntro = {
    title: firstNonEmpty(
      indBlock?.title,
      skipEnCopy ? undefined : indBlockEn?.title,
      isi?.title,
      skipEnCopy ? undefined : isiEn?.title,
      ISI.title,
    ),
    description: firstNonEmpty(
      indBlock?.body,
      skipEnCopy ? undefined : indBlockEn?.body,
      indBlock?.subtitle,
      skipEnCopy ? undefined : indBlockEn?.subtitle,
      isi?.description,
      skipEnCopy ? undefined : isiEn?.description,
      ISI.description,
    ),
    imageUrl: firstNonEmpty(
      indBlock?.imageUrl,
      indBlockEn?.imageUrl,
      isi?.imageUrl,
      isiEn?.imageUrl,
    ),
    imageAlt: firstNonEmpty(
      indBlock?.imageAlt,
      indBlockEn?.imageAlt,
      isi?.imageAlt,
      isiEn?.imageAlt,
    ),
    imageMediaAssetId: firstNonEmpty(
      indBlock?.imageMediaAssetId,
      indBlockEn?.imageMediaAssetId,
      isi?.imageMediaAssetId,
      isiEn?.imageMediaAssetId,
    ),
  };

  const inds: MergedIndustry[] =
    indBlock?.items && indBlock.items.length > 0
      ? indBlock.items.map((row, i) => ({
          label: normalizeIndustryLabel(
            firstNonEmpty(itemLine(row), IND[i]?.label ?? ""),
          ),
          description: firstNonEmpty(
            row.description,
            IND[i]?.description ?? "",
          ),
          imageUrl: firstNonEmpty(
            row.imageUrl,
            locale === "ar" ? indBlockEn?.items?.[i]?.imageUrl : undefined,
          ),
          imageAlt: firstNonEmpty(
            row.imageAlt,
            locale === "ar" ? indBlockEn?.items?.[i]?.imageAlt : undefined,
          ),
          imageMediaAssetId: firstNonEmpty(
            row.imageMediaAssetId,
            locale === "ar" ? indBlockEn?.items?.[i]?.imageMediaAssetId : undefined,
          ),
        }))
      : cms.industries && cms.industries.length > 0
        ? cms.industries.map((row, i) => ({
            label: normalizeIndustryLabel(
              firstNonEmpty(
                row.name,
                skipEnCopy ? undefined : en?.industries?.[i]?.name,
                IND[i]?.label ?? "",
              ),
            ),
            description: firstNonEmpty(
              row.detail,
              skipEnCopy ? undefined : en?.industries?.[i]?.detail,
              IND[i]?.description ?? "",
            ),
            imageUrl: firstNonEmpty(row.imageUrl),
            imageAlt: firstNonEmpty(row.imageAlt),
            imageMediaAssetId: firstNonEmpty(row.imageMediaAssetId),
          }))
        : IND.map((x) => ({
            label: x.label,
            description: x.description,
          }));

  const c = cms.cta;
  const cEn = locale === "ar" ? en?.cta : undefined;
  const cs = cms.ctaStrip;
  const csEn = locale === "ar" ? en?.ctaStrip : undefined;

  const cta: MergedCta = {
    headline: firstNonEmpty(
      c?.title,
      skipEnCopy ? undefined : cEn?.title,
      cs?.title,
      skipEnCopy ? undefined : csEn?.title,
      FC.headline,
    ),
    body: firstNonEmpty(
      c?.body,
      skipEnCopy ? undefined : cEn?.body,
      c?.subtitle,
      skipEnCopy ? undefined : cEn?.subtitle,
      cs?.body,
      skipEnCopy ? undefined : csEn?.body,
      FC.body,
    ),
    buttonLabel: firstNonEmpty(
      c?.ctaLabel,
      skipEnCopy ? undefined : cEn?.ctaLabel,
      cs?.cta?.label,
      skipEnCopy ? undefined : csEn?.cta?.label,
      FC.buttonLabel,
    ),
    href: withLocale(
      firstNonEmpty(
        c?.ctaHref,
        skipEnCopy ? undefined : cEn?.ctaHref,
        cs?.cta?.href,
        skipEnCopy ? undefined : csEn?.cta?.href,
        FC.href,
      ),
      locale,
    ),
    imageUrl: firstNonEmpty(
      c?.imageUrl,
      cEn?.imageUrl,
      cs?.imageUrl,
      csEn?.imageUrl,
    ),
    imageAlt: firstNonEmpty(
      c?.imageAlt,
      cEn?.imageAlt,
      cs?.imageAlt,
      csEn?.imageAlt,
    ),
    imageMediaAssetId: firstNonEmpty(
      c?.imageMediaAssetId,
      cEn?.imageMediaAssetId,
      cs?.imageMediaAssetId,
      csEn?.imageMediaAssetId,
    ),
  };

  return {
    hero,
    guided,
    trustIntro,
    trustPts,
    svcIntro,
    pillars,
    ent,
    indIntro,
    inds,
    cta,
  };
}
