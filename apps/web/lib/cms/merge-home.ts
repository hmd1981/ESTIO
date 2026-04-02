import {
  enterpriseHighlightAr,
  finalCtaAr,
  guidedIntentsAr,
  homeHeroAr,
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

/**
 * Merge homepage sections. When `locale === "ar"`, pass English home `sections` as `cmsEn`
 * so empty AR fields can fall back to EN CMS before static defaults.
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

  const defaultHeroImage = "/images/hero-home.png";
  const defaultHeroAlt =
    locale === "ar"
      ? "فريق مهني في بيئة عمل رقمية — إستيو، مسقط، عُمان"
      : "Professional team in a modern technology office — Estio, Muscat, Oman";

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
  const hero: MergedHero = {
    eyebrow: firstNonEmpty(
      cms.hero?.eyebrow,
      locale === "ar" ? en?.hero?.eyebrow : undefined,
      locale === "ar"
        ? "رقمنة وتشغيل ذكي — مسقط · الخليج"
        : "Premium digital services · Applied AI · Muscat, Oman",
    ),
    headline: firstNonEmpty(
      cms.hero?.headline,
      cms.hero?.title,
      locale === "ar" ? en?.hero?.headline : undefined,
      locale === "ar" ? en?.hero?.title : undefined,
      HH.headline,
    ),
    subheadline: firstNonEmpty(
      cms.hero?.subheadline,
      cms.hero?.body,
      locale === "ar" ? en?.hero?.subheadline : undefined,
      locale === "ar" ? en?.hero?.body : undefined,
      HH.subheadline,
    ),
    primaryCta: {
      label: firstNonEmpty(
        cms.hero?.primaryCta?.label,
        locale === "ar" ? en?.hero?.primaryCta?.label : undefined,
        HH.primaryCta.label,
      ),
      href: withLocale(
        firstNonEmpty(
          cms.hero?.primaryCta?.href,
          locale === "ar" ? en?.hero?.primaryCta?.href : undefined,
          HH.primaryCta.href,
        ),
        locale,
      ),
    },
    secondaryCta: {
      label: firstNonEmpty(
        cms.hero?.secondaryCta?.label,
        locale === "ar" ? en?.hero?.secondaryCta?.label : undefined,
        HH.secondaryCta.label,
      ),
      href: withLocale(
        firstNonEmpty(
          cms.hero?.secondaryCta?.href,
          locale === "ar" ? en?.hero?.secondaryCta?.href : undefined,
          HH.secondaryCta.href,
        ),
        locale,
      ),
    },
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
    locale === "ar" ? "ما الذي تريدون تنفيذه؟" : "What are you looking for?";
  const guidedDefaultDesc =
    locale === "ar"
      ? "اختاروا المسار الأقرب؛ يتابع معكم مسؤول مباشر عن النطاق والجدول وأصحاب القرار — من دون ردود آلية."
      : "Select the closest path. A senior owner follows up on scope, timeline, and stakeholders — no automated responses.";

  const g = cms.guided;
  const gEn = locale === "ar" ? en?.guided : undefined;
  const gi = cms.guidedIntro;
  const giEn = locale === "ar" ? en?.guidedIntro : undefined;

  const guidedTitle = firstNonEmpty(
    g?.title,
    gEn?.title,
    gi?.title,
    giEn?.title,
    guidedDefaultTitle,
  );
  const guidedSubtitle = firstNonEmpty(g?.subtitle, gEn?.subtitle);
  const guidedBody = firstNonEmpty(
    g?.body,
    gEn?.body,
    gi?.description,
    giEn?.description,
    guidedDefaultDesc,
  );

  const guidedSectionImg = visualFrom(g, gEn);
  const guidedCta =
    g?.ctaLabel || g?.ctaHref || gEn?.ctaLabel || gEn?.ctaHref
      ? {
          label: firstNonEmpty(g?.ctaLabel, gEn?.ctaLabel),
          href: withLocale(
            firstNonEmpty(g?.ctaHref, gEn?.ctaHref, "/contact"),
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
        itemLine(fromNewEn),
        fromOld?.label,
        fromOldEn?.label,
        def.label,
      );
      const hrefRaw = firstNonEmpty(
        fromNew?.href,
        fromNewEn?.href,
        fromOld?.href,
        fromOldEn?.href,
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
      tEn?.title,
      tsi?.title,
      tsiEn?.title,
      TSI.title,
    ),
    description: firstNonEmpty(
      t?.body,
      tEn?.body,
      t?.subtitle,
      tEn?.subtitle,
      tsi?.description,
      tsiEn?.description,
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
              locale === "ar" ? en?.trustPoints?.[i]?.title : undefined,
              TP[i]?.title ?? "",
            ),
            body: firstNonEmpty(
              p.body,
              locale === "ar" ? en?.trustPoints?.[i]?.body : undefined,
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
      sEn?.title,
      ssi?.title,
      ssiEn?.title,
      SSI.title,
    ),
    description: firstNonEmpty(
      s?.body,
      sEn?.body,
      s?.subtitle,
      sEn?.subtitle,
      ssi?.description,
      ssiEn?.description,
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
              locale === "ar" ? en?.pillarServices?.[i]?.title : undefined,
              PS[i]?.title ?? "",
            ),
            description: firstNonEmpty(
              c.description,
              locale === "ar" ? en?.pillarServices?.[i]?.description : undefined,
              PS[i]?.description ?? "",
            ),
            href: withLocale(
              firstNonEmpty(
                c.href,
                locale === "ar" ? en?.pillarServices?.[i]?.href : undefined,
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
      entCmsEn?.title,
      eh?.headline,
      ehEn?.headline,
      EH.headline,
    ),
    body: firstNonEmpty(
      entCms?.body,
      entCmsEn?.body,
      eh?.body,
      ehEn?.body,
      EH.body,
    ),
    subtitle: firstNonEmpty(
      entCms?.subtitle,
      entCmsEn?.subtitle,
      eh?.subtitle,
      ehEn?.subtitle,
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
                locale === "ar" ? ehEn?.bullets?.[i]?.title : undefined,
                EH.bullets[i]?.title ?? "",
              ),
              text: firstNonEmpty(
                b.text,
                locale === "ar" ? ehEn?.bullets?.[i]?.text : undefined,
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
        entCmsEn?.ctaLabel,
        eh?.cta?.label,
        ehEn?.cta?.label,
        EH.cta.label,
      ),
      href: withLocale(
        firstNonEmpty(
          entCms?.ctaHref,
          entCmsEn?.ctaHref,
          eh?.cta?.href,
          ehEn?.cta?.href,
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
      indBlockEn?.title,
      isi?.title,
      isiEn?.title,
      ISI.title,
    ),
    description: firstNonEmpty(
      indBlock?.body,
      indBlockEn?.body,
      indBlock?.subtitle,
      indBlockEn?.subtitle,
      isi?.description,
      isiEn?.description,
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
          label: firstNonEmpty(
            itemLine(row),
            IND[i]?.label ?? "",
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
            label: firstNonEmpty(
              row.name,
              locale === "ar" ? en?.industries?.[i]?.name : undefined,
              IND[i]?.label ?? "",
            ),
            description: firstNonEmpty(
              row.detail,
              locale === "ar" ? en?.industries?.[i]?.detail : undefined,
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
      cEn?.title,
      cs?.title,
      csEn?.title,
      FC.headline,
    ),
    body: firstNonEmpty(
      c?.body,
      cEn?.body,
      c?.subtitle,
      cEn?.subtitle,
      cs?.body,
      csEn?.body,
      FC.body,
    ),
    buttonLabel: firstNonEmpty(
      c?.ctaLabel,
      cEn?.ctaLabel,
      cs?.cta?.label,
      csEn?.cta?.label,
      FC.buttonLabel,
    ),
    href: withLocale(
      firstNonEmpty(
        c?.ctaHref,
        cEn?.ctaHref,
        cs?.cta?.href,
        csEn?.cta?.href,
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
