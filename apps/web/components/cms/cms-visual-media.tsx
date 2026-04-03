import type { ImageRef } from "@/lib/cms/resolve-image";
import { resolveVisualMedia } from "@/lib/cms/resolve-image";
import { inferVideoMimeType } from "@/lib/cms/media-kind";
import type { MediaAssetMap } from "@/lib/cms/types";

type Props = {
  imageRef: ImageRef;
  mediaAssets?: MediaAssetMap;
  className?: string;
  videoClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  /** Hide from assistive tech when purely decorative */
  decorative?: boolean;
  priority?: boolean;
};

/**
 * Renders a CMS “image” slot as &lt;img&gt; or &lt;video&gt; (never next/image).
 * CMS URLs may be remote hosts not listed in next.config, or SVG under /public —
 * the default Image optimizer rejects or blocks many of those; plain media tags match operator expectations.
 */
export function CmsVisualMedia({
  imageRef,
  mediaAssets = {},
  className,
  videoClassName,
  fill,
  width = 800,
  height = 500,
  sizes: _sizes,
  decorative = false,
  priority = false,
}: Props) {
  const vm = resolveVisualMedia(imageRef, mediaAssets);
  if (!vm) return null;

  if (vm.kind === "video") {
    const vt = inferVideoMimeType(vm.url);
    return (
      <video
        className={videoClassName ?? className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden={decorative ? true : undefined}
        aria-label={decorative ? undefined : vm.alt || undefined}
      >
        <source src={vm.url} type={vt} />
      </video>
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- CMS sources: arbitrary URLs + SVG; avoid Image remotePatterns / SVG optimizer issues
      <img
        src={vm.url}
        alt={decorative ? "" : vm.alt}
        className={`absolute inset-0 h-full w-full ${className ?? ""}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- CMS sources: arbitrary URLs + SVG
    <img
      src={vm.url}
      alt={decorative ? "" : vm.alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
