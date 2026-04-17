import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AiStudioLandingPage,
  type AiStudioResolvedMedia,
} from "@/components/ai-studio/ai-studio-landing-page";
import { getAiStudioLanding } from "@/lib/content/ai-studio-pages";
import {
  mergeAiStudioLandingFromSections,
  overlayEnglishAiStudioMediaOnArabic,
  seoFromAiStudioSections,
} from "@/lib/cms/merge-ai-studio-landing";
import { getPublishedSiteBundle, getSiteBundle } from "@/lib/cms/fetch-site";
import { inferVideoMimeType } from "@/lib/cms/media-kind";
import {
  resolveExplicitVideoUrl,
  resolveImage,
  resolveVisualMedia,
} from "@/lib/cms/resolve-image";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

/** Avoid serving a stale static shell after deploy (CDN / edge). */
export const dynamic = "force-dynamic";

const fallbackSeo = {
  en: {
    title: "AI Studio \u2014 Estio",
    description:
      "Production-grade AI visuals and video \u2014 scoped, reviewed, and delivered as final assets. AI Image Production, AI Video Production, and Brand AI Packs. Estio, Muscat.",
  },
  ar: {
    title: "\u0627\u0633\u062A\u0648\u062F\u064A\u0648 \u0627\u0644\u0630\u0643\u0627\u0621 \u2014 \u0625\u0633\u062A\u064A\u0648",
    description:
      "\u0645\u0631\u0626\u064A\u0627\u062A \u0648\u0641\u064A\u062F\u064A\u0648 \u0628\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A \u0628\u062C\u0648\u062F\u0629 \u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u2014 \u0645\u062D\u062F\u062F\u0629 \u0627\u0644\u0646\u0637\u0627\u0642 \u0648\u0645\u0631\u0627\u062C\u064E\u0639\u0629 \u0648\u062A\u064F\u0633\u0644\u0651\u0645 \u0643\u0623\u0635\u0648\u0644 \u0646\u0647\u0627\u0626\u064A\u0629. \u0625\u0633\u062A\u064A\u0648\u060C \u0645\u0633\u0642\u0637.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return { title: "Not found" };
  const bundle = await getSiteBundle(raw);
  const rec = bundle.marketingPages?.["ai-studio"] as
    | {
        sections?: unknown;
        metaTitle?: string | null;
        metaDescription?: string | null;
      }
    | null
    | undefined;
  const fb = raw === "ar" ? fallbackSeo.ar : fallbackSeo.en;
  const seo = seoFromAiStudioSections(
    rec?.sections,
    rec?.metaTitle,
    rec?.metaDescription,
  );
  return marketingDetailMetadata(
    {
      title: seo.title || fb.title,
      description: seo.description || fb.description,
    },
    `/${raw}/ai-studio`,
  );
}

export default async function AiStudioPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const bundle = await getSiteBundle(raw);
  const rec = bundle.marketingPages?.["ai-studio"] as
    | { sections?: unknown }
    | null
    | undefined;
  const staticLanding = getAiStudioLanding(raw);
  let merged = mergeAiStudioLandingFromSections(
    rec?.sections,
    staticLanding,
  );
  if (raw === "ar") {
    const enBundle = await getPublishedSiteBundle("en");
    const enRec = enBundle.marketingPages?.["ai-studio"] as
      | { sections?: unknown }
      | null
      | undefined;
    merged = overlayEnglishAiStudioMediaOnArabic(merged, enRec?.sections);
  }
  const mediaAssets = bundle.mediaAssets ?? {};
  const offerCards = merged.offerCards.map((card) => {
    const resolved = resolveImage(
      {
        imageUrl: card.imageUrl,
        imageAlt: card.imageAlt,
        imageMediaAssetId: card.imageMediaAssetId,
      },
      mediaAssets,
    );
    return {
      ...card,
      imageUrl: resolved?.url ?? card.imageUrl,
      imageAlt: resolved?.alt ?? card.imageAlt,
    };
  });
  const content = { ...merged, offerCards };

  const heroRef = {
    imageUrl: merged.hero.imageUrl,
    imageAlt: merged.hero.imageAlt,
    imageMediaAssetId: merged.hero.imageMediaAssetId,
  };
  const heroVisual = resolveVisualMedia(heroRef, mediaAssets);
  const heroExplicitVideo = resolveExplicitVideoUrl(
    merged.hero.videoUrl,
    merged.hero.videoMediaAssetId,
    mediaAssets,
  );
  const heroPanelVideoUrl =
    heroExplicitVideo ||
    (heroVisual?.kind === "video" ? heroVisual.url : undefined);
  const heroPanelImage =
    !heroPanelVideoUrl && heroVisual?.kind === "image"
      ? heroVisual
      : null;
  const heroPosterUrl =
    heroPanelVideoUrl && heroVisual?.kind === "image"
      ? heroVisual.url
      : undefined;

  const pb = merged.pageBackdrop;
  const backdropVideoUrl = pb
    ? resolveExplicitVideoUrl(pb.videoUrl, pb.videoMediaAssetId, mediaAssets)
    : undefined;
  const backdropPoster = resolveImage(
    {
      imageUrl: pb?.posterUrl,
      imageAlt: pb?.posterAlt,
      imageMediaAssetId: pb?.posterMediaAssetId,
    },
    mediaAssets,
  );

  const media: AiStudioResolvedMedia = {
    hasAmbientBackdrop: Boolean(backdropVideoUrl),
    backdropVideoUrl,
    backdropMimeType: backdropVideoUrl
      ? inferVideoMimeType(backdropVideoUrl)
      : undefined,
    backdropPosterUrl: backdropPoster?.url,
    backdropPosterAlt: backdropPoster?.alt,
    heroPanelVideoUrl,
    heroPanelMimeType: heroPanelVideoUrl
      ? inferVideoMimeType(heroPanelVideoUrl)
      : undefined,
    heroPanelImage: heroPanelImage ?? undefined,
    heroPosterUrl,
    heroVisualLabel:
      merged.hero.imageAlt?.trim() || "AI Studio hero visual",
  };

  return (
    <AiStudioLandingPage content={content} locale={raw} media={media} />
  );
}
