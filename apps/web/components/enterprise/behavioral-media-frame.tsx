import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import type { PremiumMediaFrameProps } from "@/components/cms/premium-media-frame";
import type { CmsVisual } from "@/lib/cms/types";

type BehaviorOpts = Pick<
  PremiumMediaFrameProps,
  | "priority"
  | "decorative"
  | "mediaOpacity"
  | "imageClassName"
  | "className"
  | "frameClassName"
>;

/**
 * Maps CMS asset metadata to presentation — hero emphasis, diagram framing,
 * decorative suppression — without changing CMS field shapes.
 */
export function behavioralMediaOpts(visual: CmsVisual | undefined): BehaviorOpts {
  const v = visual ?? {};
  const role = v.assetRole;
  const pri = v.assetPriority ?? "supporting";

  let priority = false;
  let decorative = false;
  let mediaOpacity: number | undefined;
  let imageClassName = "";
  let className = "";
  let frameClassName = "";

  if (role === "hero" || pri === "critical") {
    priority = true;
    frameClassName =
      "ring-1 ring-[color-mix(in_srgb,var(--accent)_28%,transparent)] shadow-[0_0_0_1px_rgba(212,175,55,0.07)]";
  }

  if (role === "diagram") {
    frameClassName +=
      " border-[color-mix(in_srgb,var(--accent)_32%,var(--border)_68%)]";
  }

  if (role === "decorative" || (pri === "optional" && role !== "hero")) {
    mediaOpacity = 0.78;
    imageClassName = "saturate-[0.88] contrast-[0.96]";
  }

  if (role === "decorative") {
    decorative = true;
  }

  if (role === "case" && pri !== "critical") {
    className = "opacity-[0.96]";
  }

  return {
    priority,
    decorative,
    mediaOpacity,
    imageClassName: imageClassName.trim(),
    className: className.trim(),
    frameClassName: frameClassName.trim(),
  };
}

type Props = Omit<PremiumMediaFrameProps, "imageRef"> & {
  imageRef?: CmsVisual;
};

/** Premium media shell with role/priority-aware emphasis (CMS JSON only). */
export function BehavioralMediaFrame({
  imageRef,
  className = "",
  frameClassName = "",
  imageClassName = "",
  ...rest
}: Props) {
  const opts = behavioralMediaOpts(imageRef);
  return (
    <PremiumMediaFrame
      {...rest}
      imageRef={imageRef}
      priority={opts.priority}
      decorative={opts.decorative}
      mediaOpacity={opts.mediaOpacity}
      className={[opts.className, className].filter(Boolean).join(" ")}
      frameClassName={[opts.frameClassName, frameClassName].filter(Boolean).join(" ")}
      imageClassName={[opts.imageClassName, imageClassName].filter(Boolean).join(" ")}
    />
  );
}
