"use client";

import {
  Suspense,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { enterpriseSectionClassName } from "@/lib/section-highlight-merge";

function mergeHighlight(
  queryHighlight: string | null,
  cmsFallback?: string | null,
): string | undefined {
  const q = queryHighlight?.trim();
  if (q) return q;
  const f = cmsFallback?.trim();
  return f || undefined;
}

function useMergedSectionHighlight(cmsFallback?: string | null): string | undefined {
  const sp = useSearchParams();
  return mergeHighlight(sp.get("highlight"), cmsFallback);
}

const DEFAULT_RING = "ring-2 ring-[var(--accent)]/50 ring-inset";

type SectionHighlightFrameOwnProps<T extends ElementType> = {
  as?: T;
  sectionId: string;
  /** CMS draft preview / split iframe — URL ?highlight= overrides this after hydration. */
  fallbackHighlight?: string | null;
  className?: string;
  highlightRingClassName?: string;
  children: ReactNode;
};

export function SectionHighlightFrame<T extends ElementType = "div">({
  as,
  sectionId,
  fallbackHighlight,
  className,
  highlightRingClassName = DEFAULT_RING,
  children,
  ...rest
}: SectionHighlightFrameOwnProps<T> &
  Omit<ComponentPropsWithoutRef<"div">, keyof SectionHighlightFrameOwnProps<T>>) {
  const Tag = (as ?? "div") as ElementType;

  const cmsOnly = mergeHighlight(null, fallbackHighlight);
  const staticActive = cmsOnly === sectionId;
  const staticClass = [className, staticActive ? highlightRingClassName : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Suspense
      fallback={
        <Tag className={staticClass || undefined} {...rest}>
          {children}
        </Tag>
      }
    >
      <SectionHighlightFrameInner
        Tag={Tag}
        sectionId={sectionId}
        fallbackHighlight={fallbackHighlight}
        className={className}
        highlightRingClassName={highlightRingClassName}
        {...rest}
      >
        {children}
      </SectionHighlightFrameInner>
    </Suspense>
  );
}

function SectionHighlightFrameInner({
  Tag,
  sectionId,
  fallbackHighlight,
  className,
  highlightRingClassName,
  children,
  ...rest
}: {
  Tag: ElementType;
  sectionId: string;
  fallbackHighlight?: string | null;
  className?: string;
  highlightRingClassName: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">) {
  const merged = useMergedSectionHighlight(fallbackHighlight);
  const active = merged === sectionId;
  const cls = [className, active ? highlightRingClassName : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={cls || undefined} {...rest}>
      {children}
    </Tag>
  );
}

type EnterpriseSectionProps = {
  sectionKey: string;
  baseClassName: string;
  fallbackHighlight?: string | null;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"section">, "className" | "children">;

function EnterpriseSectionHighlightInner({
  sectionKey,
  baseClassName,
  fallbackHighlight,
  children,
  ...rest
}: EnterpriseSectionProps) {
  const h = useMergedSectionHighlight(fallbackHighlight);
  return (
    <section
      className={enterpriseSectionClassName(sectionKey, baseClassName, h)}
      {...rest}
    >
      {children}
    </section>
  );
}

/** Enterprise marketing sections: merges `?highlight=` on the client with CMS preview fallback. */
export function EnterpriseSectionHighlight({
  sectionKey,
  baseClassName,
  fallbackHighlight,
  children,
  ...rest
}: EnterpriseSectionProps) {
  const cms = fallbackHighlight?.trim();
  const staticClass = enterpriseSectionClassName(
    sectionKey,
    baseClassName,
    cms || undefined,
  );
  return (
    <Suspense
      fallback={
        <section className={staticClass} {...rest}>
          {children}
        </section>
      }
    >
      <EnterpriseSectionHighlightInner
        sectionKey={sectionKey}
        baseClassName={baseClassName}
        fallbackHighlight={fallbackHighlight}
        {...rest}
      >
        {children}
      </EnterpriseSectionHighlightInner>
    </Suspense>
  );
}
