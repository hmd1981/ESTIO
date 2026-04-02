import Image, { type StaticImageData } from "next/image";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { Container } from "@/components/layout/container";
import type { MergedHero } from "@/lib/cms/merge-home";
import { inferVideoMimeType } from "@/lib/cms/media-kind";
import type { MediaAssetMap } from "@/lib/cms/types";
import {
  imageNeedsUnoptimized,
  resolveImage,
  resolveVisualMedia,
} from "@/lib/cms/resolve-image";
import { MarketingSection } from "@/components/sections/marketing-section";
import { ButtonLink } from "@/components/ui/button-link";
import heroHomePicture from "../../public/images/hero-home.png";

const DEFAULT_HERO_PUBLIC_PATH = "/images/hero-home.png";

function resolveHeroSrc(
  imageUrl: string | undefined,
): string | StaticImageData {
  const url = imageUrl?.trim() || DEFAULT_HERO_PUBLIC_PATH;
  const isRemote =
    url.startsWith("http://") || url.startsWith("https://");
  if (!isRemote && url === DEFAULT_HERO_PUBLIC_PATH) {
    return heroHomePicture;
  }
  return url;
}

/** Explicit hero video fields only — no default file; background must stay static. */
function resolveExplicitHeroVideoUrl(
  videoUrl: string | undefined,
  videoMediaAssetId: string | undefined,
  mediaAssets: MediaAssetMap,
): string | undefined {
  const direct = videoUrl?.trim();
  if (direct) return direct;
  const mediaId = videoMediaAssetId?.trim();
  if (mediaId) {
    const fromMedia = mediaAssets[mediaId]?.url?.trim();
    if (fromMedia) return fromMedia;
  }
  return undefined;
}

export function HeroSection({
  hero,
  mediaAssets = {},
}: {
  hero: MergedHero;
  mediaAssets?: MediaAssetMap;
}) {
  const imageRef = {
    imageUrl: hero.imageUrl,
    imageAlt: hero.imageAlt,
    imageMediaAssetId: hero.imageMediaAssetId,
  };
  const resolved = resolveImage(imageRef, mediaAssets);
  const imageAsVisual = resolveVisualMedia(imageRef, mediaAssets);

  const explicitVideoUrl = resolveExplicitHeroVideoUrl(
    hero.videoUrl,
    hero.videoMediaAssetId,
    mediaAssets,
  );

  /** Main panel: explicit video beats image slot; image slot can be video or image. */
  const panelVideoUrl =
    explicitVideoUrl ||
    (imageAsVisual?.kind === "video" ? imageAsVisual.url : undefined);

  const panelImageVisual =
    !panelVideoUrl && imageAsVisual?.kind === "image"
      ? imageAsVisual
      : null;

  const posterUrl = (() => {
    if (panelVideoUrl && imageAsVisual?.kind === "image") {
      return imageAsVisual.url;
    }
    const src = resolveHeroSrc(resolved?.url ?? hero.imageUrl);
    return typeof src === "string" ? src : heroHomePicture.src;
  })();

  const videoType = panelVideoUrl
    ? inferVideoMimeType(panelVideoUrl)
    : undefined;

  /** Subtle full-width background: never the hero video — only a static image. */
  const bgSrc = (() => {
    if (panelVideoUrl) {
      return heroHomePicture;
    }
    return resolveHeroSrc(resolved?.url ?? hero.imageUrl);
  })();

  return (
    <MarketingSection
      id="hero"
      aria-labelledby="hero-heading"
      tone="surface"
      padding="hero"
      borderBottom
      contain={false}
      className="relative overflow-hidden"
    >
      <Image
        src={bgSrc}
        alt=""
        aria-hidden="true"
        fill
        className="premium-media pointer-events-none absolute inset-0 object-cover opacity-28"
        sizes="100vw"
        priority
      />

      <div className="absolute inset-0 bg-black/58 backdrop-blur-[1px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0.84))]" />

      <Container as="div" className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5 xl:col-span-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
              {hero.eyebrow}
            </p>
            <h1
              id="hero-heading"
              className="font-display mt-8 text-balance text-3xl font-medium leading-[1.12] tracking-[-0.02em] text-[var(--text)] sm:text-4xl sm:leading-[1.1] lg:text-[2.75rem] lg:leading-[1.08]"
            >
              {hero.headline}
            </h1>
            <p className="mt-8 max-w-2xl whitespace-pre-line text-pretty text-lg leading-[1.65] text-[var(--text-body)] lg:text-xl lg:leading-[1.7]">
              {hero.subheadline}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <ButtonLink href={hero.primaryCta.href}>
                {hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          <div className="relative min-h-[200px] lg:col-span-7 xl:col-span-7">
            <PremiumMediaFrame
              aspectClassName="aspect-[21/10] w-full sm:aspect-[2/1] lg:aspect-[16/10]"
              overlay={
                panelVideoUrl || panelImageVisual ? "readability" : "none"
              }
              slot={
                panelVideoUrl ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    controls={false}
                    poster={posterUrl}
                    aria-label={hero.imageAlt?.trim() || "Hero visual"}
                  >
                    <source src={panelVideoUrl} type={videoType} />
                  </video>
                ) : panelImageVisual ? (
                  <Image
                    src={panelImageVisual.url}
                    alt={panelImageVisual.alt || ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    unoptimized={imageNeedsUnoptimized(panelImageVisual.url)}
                    priority
                  />
                ) : null
              }
            />
          </div>
        </div>
      </Container>
    </MarketingSection>
  );
}
