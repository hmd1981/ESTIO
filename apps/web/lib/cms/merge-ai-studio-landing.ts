import type {
  AiStudioLandingContent,
  AiStudioOfferCard,
  AiStudioPageBackdrop,
} from "@/lib/content/ai-studio-pages";

/** Stored under `Page.sections` for slug `ai-studio`. */
export type AiStudioLandingSectionsCMS = {
  seoTitle?: string;
  seoDescription?: string;
  aiStudio?: Partial<AiStudioLandingContent> | null;
};

/**
 * CMS / admin JSON often sends "" for untouched fields. `??` keeps those empty
 * strings and wipes locale defaults (e.g. Arabic copy). Fall back to `base`
 * when patch is missing or whitespace-only.
 */
function coalesceText(patch: string | undefined | null, base: string): string {
  if (typeof patch !== "string") return base;
  const t = patch.trim();
  return t.length > 0 ? t : base;
}

function coalesceOptional(
  patch: string | undefined | null,
  base: string | undefined,
): string | undefined {
  if (patch == null) return base;
  const t = patch.trim();
  return t.length > 0 ? t : base;
}

function mergeHero(
  base: AiStudioLandingContent["hero"],
  patch?: Partial<AiStudioLandingContent["hero"]>,
): AiStudioLandingContent["hero"] {
  if (!patch) return base;
  return {
    kicker: coalesceText(patch.kicker, base.kicker),
    headline: coalesceText(patch.headline, base.headline),
    lead: coalesceText(patch.lead, base.lead),
    primaryCta: {
      label: coalesceText(patch.primaryCta?.label, base.primaryCta.label),
      href: coalesceText(patch.primaryCta?.href, base.primaryCta.href),
    },
    secondaryCta: {
      label: coalesceText(patch.secondaryCta?.label, base.secondaryCta.label),
      href: coalesceText(patch.secondaryCta?.href, base.secondaryCta.href),
    },
    imageUrl: coalesceOptional(patch.imageUrl, base.imageUrl),
    imageAlt: coalesceOptional(patch.imageAlt, base.imageAlt),
    imageMediaAssetId: coalesceOptional(
      patch.imageMediaAssetId,
      base.imageMediaAssetId,
    ),
    videoUrl: coalesceOptional(patch.videoUrl, base.videoUrl),
    videoMediaAssetId: coalesceOptional(
      patch.videoMediaAssetId,
      base.videoMediaAssetId,
    ),
  };
}

function mergePageBackdrop(
  base: AiStudioPageBackdrop | undefined,
  patch?: Partial<AiStudioPageBackdrop> | null,
): AiStudioPageBackdrop | undefined {
  const b = base ?? {};
  if (!patch || typeof patch !== "object") {
    return Object.keys(b).length ? b : undefined;
  }
  const out: AiStudioPageBackdrop = {
    videoUrl: coalesceOptional(patch.videoUrl, b.videoUrl),
    videoMediaAssetId: coalesceOptional(
      patch.videoMediaAssetId,
      b.videoMediaAssetId,
    ),
    posterUrl: coalesceOptional(patch.posterUrl, b.posterUrl),
    posterAlt: coalesceOptional(patch.posterAlt, b.posterAlt),
    posterMediaAssetId: coalesceOptional(
      patch.posterMediaAssetId,
      b.posterMediaAssetId,
    ),
  };
  const has =
    out.videoUrl?.trim() ||
    out.videoMediaAssetId?.trim() ||
    out.posterUrl?.trim() ||
    out.posterMediaAssetId?.trim();
  return has ? out : Object.keys(b).length ? b : undefined;
}

function mergeOfferCards(
  base: AiStudioOfferCard[],
  patch?: Partial<AiStudioOfferCard>[],
): AiStudioOfferCard[] {
  if (!patch?.length) return base;
  return patch.map((p, i) => {
    const b = base[i];
    if (!b) {
      return {
        title: coalesceText(p.title, ""),
        description: coalesceText(p.description, ""),
        whatYouGet: p.whatYouGet?.length ? p.whatYouGet : [],
        bestFor: p.bestFor?.length ? p.bestFor : [],
        typicalOutputs: p.typicalOutputs?.trim() ?? "",
        subOffers: p.subOffers?.length ? p.subOffers : undefined,
        href: coalesceText(p.href, ""),
        cta: coalesceText(p.cta, ""),
        imageUrl: p.imageUrl,
        imageAlt: p.imageAlt,
        imageMediaAssetId: p.imageMediaAssetId,
      };
    }
    return {
      ...b,
      ...p,
      title: coalesceText(p.title, b.title),
      description: coalesceText(p.description, b.description),
      href: coalesceText(p.href, b.href),
      cta: coalesceText(p.cta, b.cta),
      whatYouGet:
        p.whatYouGet !== undefined && p.whatYouGet.length > 0
          ? p.whatYouGet
          : b.whatYouGet,
      bestFor:
        p.bestFor !== undefined && p.bestFor.length > 0 ? p.bestFor : b.bestFor,
      typicalOutputs:
        p.typicalOutputs !== undefined && p.typicalOutputs.trim()
          ? p.typicalOutputs.trim()
          : b.typicalOutputs,
      subOffers:
        p.subOffers !== undefined && p.subOffers.length > 0
          ? p.subOffers
          : b.subOffers,
      imageUrl: coalesceOptional(p.imageUrl, b.imageUrl),
      imageAlt: coalesceOptional(p.imageAlt, b.imageAlt),
      imageMediaAssetId: coalesceOptional(
        p.imageMediaAssetId,
        b.imageMediaAssetId,
      ),
    };
  });
}

function mergeWho(
  base: AiStudioLandingContent["whoThisIsFor"],
  patch?: Partial<AiStudioLandingContent["whoThisIsFor"]>,
): AiStudioLandingContent["whoThisIsFor"] {
  if (!patch) return base;
  return {
    title: coalesceText(patch.title, base.title),
    fit: {
      title: coalesceText(patch.fit?.title, base.fit.title),
      items:
        patch.fit?.items !== undefined && patch.fit.items.length > 0
          ? patch.fit.items
          : base.fit.items,
    },
    notFit: {
      title: coalesceText(patch.notFit?.title, base.notFit.title),
      items:
        patch.notFit?.items !== undefined && patch.notFit.items.length > 0
          ? patch.notFit.items
          : base.notFit.items,
    },
  };
}

function mergeSteps(
  base: AiStudioLandingContent["howDeliveryWorks"]["steps"],
  patch?: Array<{ step?: string; description?: string }>,
): AiStudioLandingContent["howDeliveryWorks"]["steps"] {
  if (!patch?.length) return base;
  return patch.map((p, i) => {
    const b = base[i];
    if (!b) {
      return {
        step: coalesceText(p.step, ""),
        description: coalesceText(p.description, ""),
      };
    }
    return {
      step: coalesceText(p.step, b.step),
      description: coalesceText(p.description, b.description),
    };
  });
}

/**
 * Merge published `sections` (with optional `aiStudio` patch) over static defaults.
 */
export function mergeAiStudioLandingFromSections(
  sections: unknown,
  base: AiStudioLandingContent,
): AiStudioLandingContent {
  const s =
    sections && typeof sections === "object"
      ? (sections as AiStudioLandingSectionsCMS)
      : {};
  const p = s.aiStudio;
  if (!p || typeof p !== "object") {
    return base;
  }

  return {
    hero: mergeHero(base.hero, p.hero),
    pageBackdrop: mergePageBackdrop(base.pageBackdrop, p.pageBackdrop),
    studioOutputs:
      p.studioOutputs && typeof p.studioOutputs === "object"
        ? {
            title: coalesceText(
              p.studioOutputs.title,
              base.studioOutputs.title,
            ),
            samples:
              p.studioOutputs.samples !== undefined &&
              p.studioOutputs.samples.length > 0
                ? p.studioOutputs.samples.map((sam, i) => ({
                    label: coalesceText(
                      sam.label,
                      base.studioOutputs.samples[i]?.label ?? "",
                    ),
                    imageUrl: coalesceText(
                      sam.imageUrl,
                      base.studioOutputs.samples[i]?.imageUrl ?? "",
                    ),
                    imageAlt: coalesceText(
                      sam.imageAlt,
                      base.studioOutputs.samples[i]?.imageAlt ?? "",
                    ),
                  }))
                : base.studioOutputs.samples,
          }
        : base.studioOutputs,
    separator:
      p.separator && typeof p.separator === "object"
        ? {
            title: coalesceText(p.separator.title, base.separator.title),
            body: coalesceText(p.separator.body, base.separator.body),
          }
        : base.separator,
    valueProps:
      p.valueProps !== undefined && p.valueProps.length > 0
        ? p.valueProps.map((vp, i) => ({
            title: coalesceText(
              vp.title,
              base.valueProps[i]?.title ?? "",
            ),
            body: coalesceText(vp.body, base.valueProps[i]?.body ?? ""),
          }))
        : base.valueProps,
    offerCards: mergeOfferCards(base.offerCards, p.offerCards),
    deliverablesSnapshot:
      p.deliverablesSnapshot && typeof p.deliverablesSnapshot === "object"
        ? {
            title: coalesceText(
              p.deliverablesSnapshot.title,
              base.deliverablesSnapshot.title,
            ),
            items:
              p.deliverablesSnapshot.items !== undefined &&
              p.deliverablesSnapshot.items.length > 0
                ? p.deliverablesSnapshot.items
                : base.deliverablesSnapshot.items,
          }
        : base.deliverablesSnapshot,
    whoThisIsFor: mergeWho(base.whoThisIsFor, p.whoThisIsFor),
    howDeliveryWorks: {
      title: coalesceText(
        p.howDeliveryWorks?.title,
        base.howDeliveryWorks.title,
      ),
      steps: mergeSteps(
        base.howDeliveryWorks.steps,
        p.howDeliveryWorks?.steps,
      ),
    },
    whyDifferent: {
      title: coalesceText(p.whyDifferent?.title, base.whyDifferent.title),
      items:
        p.whyDifferent?.items !== undefined &&
        p.whyDifferent.items.length > 0
          ? p.whyDifferent.items.map((it, i) => ({
              title: coalesceText(
                it.title,
                base.whyDifferent.items[i]?.title ?? "",
              ),
              body: coalesceText(
                it.body,
                base.whyDifferent.items[i]?.body ?? "",
              ),
            }))
          : base.whyDifferent.items,
    },
    cta: {
      headline: coalesceText(p.cta?.headline, base.cta.headline),
      body: coalesceText(p.cta?.body, base.cta.body),
      buttonLabel: coalesceText(p.cta?.buttonLabel, base.cta.buttonLabel),
      href: coalesceText(p.cta?.href, base.cta.href),
    },
    faq: {
      title: coalesceText(p.faq?.title, base.faq.title),
      items:
        p.faq?.items !== undefined && p.faq.items.length > 0
          ? p.faq.items.map((fi, i) => ({
              question: coalesceText(
                fi.question,
                base.faq.items[i]?.question ?? "",
              ),
              answer: coalesceText(fi.answer, base.faq.items[i]?.answer ?? ""),
            }))
          : base.faq.items,
    },
  };
}

function readAiStudioPatch(
  sections: unknown,
): Partial<AiStudioLandingContent> | null {
  if (!sections || typeof sections !== "object") return null;
  const ai = (sections as { aiStudio?: unknown }).aiStudio;
  if (!ai || typeof ai !== "object") return null;
  return ai as Partial<AiStudioLandingContent>;
}

function backdropHasMedia(pb: AiStudioPageBackdrop | undefined): boolean {
  if (!pb) return false;
  return Boolean(
    pb.videoUrl?.trim() ||
      pb.videoMediaAssetId?.trim() ||
      pb.posterUrl?.trim() ||
      pb.posterMediaAssetId?.trim(),
  );
}

/**
 * When `/ar/ai-studio` CMS rows omit hero/backdrop media, reuse the English
 * page's `sections.aiStudio` media fields so Arabic matches English visually.
 * Copy always stays from `mergedAr` (Arabic static + AR CMS text).
 */
export function overlayEnglishAiStudioMediaOnArabic(
  mergedAr: AiStudioLandingContent,
  enSections: unknown,
): AiStudioLandingContent {
  const enPatch = readAiStudioPatch(enSections);
  if (!enPatch) return mergedAr;

  const heroEn = enPatch.hero;
  const h = mergedAr.hero;
  const nextHero = { ...h };

  if (heroEn) {
    const keys = [
      "imageUrl",
      "imageAlt",
      "imageMediaAssetId",
      "videoUrl",
      "videoMediaAssetId",
    ] as const;
    for (const k of keys) {
      const cur = nextHero[k];
      const curEmpty =
        cur == null || (typeof cur === "string" && !cur.trim());
      const enVal = heroEn[k];
      const enOk = typeof enVal === "string" && enVal.trim();
      if (!curEmpty || !enOk) continue;
      if (k === "imageUrl") nextHero.imageUrl = enVal;
      else if (k === "imageAlt") nextHero.imageAlt = enVal;
      else if (k === "imageMediaAssetId")
        nextHero.imageMediaAssetId = enVal;
      else if (k === "videoUrl") nextHero.videoUrl = enVal;
      else if (k === "videoMediaAssetId")
        nextHero.videoMediaAssetId = enVal;
    }
  }

  let nextBackdrop = mergedAr.pageBackdrop;
  if (!backdropHasMedia(nextBackdrop) && enPatch.pageBackdrop) {
    const pb = enPatch.pageBackdrop;
    if (backdropHasMedia(pb as AiStudioPageBackdrop)) {
      nextBackdrop = { ...pb } as AiStudioPageBackdrop;
    }
  }

  return {
    ...mergedAr,
    hero: nextHero,
    pageBackdrop: nextBackdrop,
  };
}

export function seoFromAiStudioSections(
  sections: unknown,
  metaTitle: string | null | undefined,
  metaDescription: string | null | undefined,
): { title: string; description: string } {
  const s =
    sections && typeof sections === "object"
      ? (sections as AiStudioLandingSectionsCMS)
      : {};
  return {
    title:
      (typeof s.seoTitle === "string" && s.seoTitle.trim()) ||
      metaTitle?.trim() ||
      "",
    description:
      (typeof s.seoDescription === "string" && s.seoDescription.trim()) ||
      metaDescription?.trim() ||
      "",
  };
}
