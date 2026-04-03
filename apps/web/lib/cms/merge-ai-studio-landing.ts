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

function mergeHero(
  base: AiStudioLandingContent["hero"],
  patch?: Partial<AiStudioLandingContent["hero"]>,
): AiStudioLandingContent["hero"] {
  if (!patch) return base;
  return {
    kicker: patch.kicker ?? base.kicker,
    headline: patch.headline ?? base.headline,
    lead: patch.lead ?? base.lead,
    primaryCta: {
      ...base.primaryCta,
      ...patch.primaryCta,
    },
    secondaryCta: {
      ...base.secondaryCta,
      ...patch.secondaryCta,
    },
    imageUrl: patch.imageUrl ?? base.imageUrl,
    imageAlt: patch.imageAlt ?? base.imageAlt,
    imageMediaAssetId: patch.imageMediaAssetId ?? base.imageMediaAssetId,
    videoUrl: patch.videoUrl ?? base.videoUrl,
    videoMediaAssetId: patch.videoMediaAssetId ?? base.videoMediaAssetId,
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
    videoUrl: patch.videoUrl ?? b.videoUrl,
    videoMediaAssetId: patch.videoMediaAssetId ?? b.videoMediaAssetId,
    posterUrl: patch.posterUrl ?? b.posterUrl,
    posterAlt: patch.posterAlt ?? b.posterAlt,
    posterMediaAssetId: patch.posterMediaAssetId ?? b.posterMediaAssetId,
  };
  const has =
    out.videoUrl?.trim() ||
    out.videoMediaAssetId?.trim() ||
    out.posterUrl?.trim() ||
    out.posterMediaAssetId?.trim();
  return has ? out : undefined;
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
        title: p.title ?? "",
        description: p.description ?? "",
        whatYouGet: p.whatYouGet?.length ? p.whatYouGet : [],
        bestFor: p.bestFor?.length ? p.bestFor : [],
        typicalOutputs: p.typicalOutputs?.trim() ?? "",
        subOffers: p.subOffers?.length ? p.subOffers : undefined,
        href: p.href ?? "",
        cta: p.cta ?? "",
        imageUrl: p.imageUrl,
        imageAlt: p.imageAlt,
        imageMediaAssetId: p.imageMediaAssetId,
      };
    }
    return {
      ...b,
      ...p,
      title: p.title ?? b.title,
      description: p.description ?? b.description,
      href: p.href ?? b.href,
      cta: p.cta ?? b.cta,
      whatYouGet:
        p.whatYouGet !== undefined && p.whatYouGet.length > 0
          ? p.whatYouGet
          : b.whatYouGet,
      bestFor:
        p.bestFor !== undefined && p.bestFor.length > 0 ? p.bestFor : b.bestFor,
      typicalOutputs:
        p.typicalOutputs !== undefined && p.typicalOutputs.trim()
          ? p.typicalOutputs
          : b.typicalOutputs,
      subOffers:
        p.subOffers !== undefined && p.subOffers.length > 0
          ? p.subOffers
          : b.subOffers,
      imageUrl: p.imageUrl ?? b.imageUrl,
      imageAlt: p.imageAlt ?? b.imageAlt,
      imageMediaAssetId: p.imageMediaAssetId ?? b.imageMediaAssetId,
    };
  });
}

function mergeWho(
  base: AiStudioLandingContent["whoThisIsFor"],
  patch?: Partial<AiStudioLandingContent["whoThisIsFor"]>,
): AiStudioLandingContent["whoThisIsFor"] {
  if (!patch) return base;
  return {
    title: patch.title ?? base.title,
    fit: {
      title: patch.fit?.title ?? base.fit.title,
      items:
        patch.fit?.items !== undefined && patch.fit.items.length > 0
          ? patch.fit.items
          : base.fit.items,
    },
    notFit: {
      title: patch.notFit?.title ?? base.notFit.title,
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
        step: p.step ?? "",
        description: p.description ?? "",
      };
    }
    return {
      step: p.step ?? b.step,
      description: p.description ?? b.description,
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
            title: p.studioOutputs.title ?? base.studioOutputs.title,
            samples:
              p.studioOutputs.samples !== undefined &&
              p.studioOutputs.samples.length > 0
                ? p.studioOutputs.samples.map((s, i) => ({
                    label:
                      s.label ?? base.studioOutputs.samples[i]?.label ?? "",
                    imageUrl:
                      s.imageUrl ??
                      base.studioOutputs.samples[i]?.imageUrl ??
                      "",
                    imageAlt:
                      s.imageAlt ??
                      base.studioOutputs.samples[i]?.imageAlt ??
                      "",
                  }))
                : base.studioOutputs.samples,
          }
        : base.studioOutputs,
    separator:
      p.separator && typeof p.separator === "object"
        ? {
            title: p.separator.title ?? base.separator.title,
            body: p.separator.body ?? base.separator.body,
          }
        : base.separator,
    valueProps:
      p.valueProps !== undefined && p.valueProps.length > 0
        ? p.valueProps.map((vp, i) => ({
            title: vp.title ?? base.valueProps[i]?.title ?? "",
            body: vp.body ?? base.valueProps[i]?.body ?? "",
          }))
        : base.valueProps,
    offerCards: mergeOfferCards(base.offerCards, p.offerCards),
    deliverablesSnapshot:
      p.deliverablesSnapshot && typeof p.deliverablesSnapshot === "object"
        ? {
            title:
              p.deliverablesSnapshot.title ?? base.deliverablesSnapshot.title,
            items:
              p.deliverablesSnapshot.items !== undefined &&
              p.deliverablesSnapshot.items.length > 0
                ? p.deliverablesSnapshot.items
                : base.deliverablesSnapshot.items,
          }
        : base.deliverablesSnapshot,
    whoThisIsFor: mergeWho(base.whoThisIsFor, p.whoThisIsFor),
    howDeliveryWorks: {
      title: p.howDeliveryWorks?.title ?? base.howDeliveryWorks.title,
      steps: mergeSteps(
        base.howDeliveryWorks.steps,
        p.howDeliveryWorks?.steps,
      ),
    },
    whyDifferent: {
      title: p.whyDifferent?.title ?? base.whyDifferent.title,
      items:
        p.whyDifferent?.items !== undefined &&
        p.whyDifferent.items.length > 0
          ? p.whyDifferent.items.map((it, i) => ({
              title: it.title ?? base.whyDifferent.items[i]?.title ?? "",
              body: it.body ?? base.whyDifferent.items[i]?.body ?? "",
            }))
          : base.whyDifferent.items,
    },
    cta: {
      headline: p.cta?.headline ?? base.cta.headline,
      body: p.cta?.body ?? base.cta.body,
      buttonLabel: p.cta?.buttonLabel ?? base.cta.buttonLabel,
      href: p.cta?.href ?? base.cta.href,
    },
    faq: {
      title: p.faq?.title ?? base.faq.title,
      items:
        p.faq?.items !== undefined && p.faq.items.length > 0
          ? p.faq.items.map((fi, i) => ({
              question:
                fi.question ?? base.faq.items[i]?.question ?? "",
              answer: fi.answer ?? base.faq.items[i]?.answer ?? "",
            }))
          : base.faq.items,
    },
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
