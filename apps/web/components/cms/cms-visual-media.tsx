import Image from "next/image";
import type { ImageRef } from "@/lib/cms/resolve-image";
import {
  imageNeedsUnoptimized,
  resolveVisualMedia,
} from "@/lib/cms/resolve-image";
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
 * Renders a CMS “image” slot as either Next/Image or &lt;video&gt; when the asset is video.
 */
export function CmsVisualMedia({
  imageRef,
  mediaAssets = {},
  className,
  videoClassName,
  fill,
  width = 800,
  height = 500,
  sizes,
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
      <Image
        src={vm.url}
        alt={decorative ? "" : vm.alt}
        fill
        className={className}
        sizes={sizes}
        unoptimized={imageNeedsUnoptimized(vm.url)}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={vm.url}
      alt={decorative ? "" : vm.alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      unoptimized={imageNeedsUnoptimized(vm.url)}
      priority={priority}
    />
  );
}
