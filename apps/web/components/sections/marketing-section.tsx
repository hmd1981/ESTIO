import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";

type Tone = "white" | "surface" | "accent";
type Padding = "comfortable" | "spacious" | "hero";

const toneClass: Record<Tone, string> = {
  white:
    "bg-[var(--canvas)] transition-[background-color,border-color] duration-200 ease-out",
  surface:
    "bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.05),transparent_30%),var(--surface)] transition-[background-color,border-color] duration-200 ease-out",
  accent:
    "bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_35%),var(--canvas)] text-[var(--text)] transition-[background-color,border-color,color] duration-200 ease-out",
};

const paddingClass: Record<Padding, string> = {
  /** Standard section rhythm */
  comfortable: "py-16 sm:py-20 lg:py-24",
  /** Primary content blocks */
  spacious: "py-20 sm:py-24 lg:py-28",
  /** Hero only */
  hero: "py-20 sm:py-28 lg:py-36",
};

type Props = {
  id?: string;
   /** e.g. hero-heading — forwarded to the section for accessibility */
  "aria-labelledby"?: string;
  tone?: Tone;
  padding?: Padding;
  borderBottom?: boolean;
  /** When false, children must wrap their own `Container` (full-bleed layouts). */
  contain?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Shared vertical rhythm and background for marketing pages.
 * Keeps homepage sections consistent as new blocks are added.
 */
export function MarketingSection({
  id,
  ["aria-labelledby"]: ariaLabelledBy,
  tone = "white",
  padding = "comfortable",
  borderBottom = true,
  contain = true,
  className = "",
  children,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`scroll-mt-24 ${toneClass[tone]} ${paddingClass[padding]} ${borderBottom ? "border-b border-[var(--border)] transition-[border-color] duration-200 ease-out" : ""} ${className}`}
    >
      {contain ? <Container as="div">{children}</Container> : children}
    </section>
  );
}
