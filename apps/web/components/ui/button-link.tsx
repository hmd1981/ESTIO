import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<
  Variant,
  string
> = {
  primary:
    "border border-[var(--accent)] bg-transparent text-[var(--accent)] shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-[background-color,color,border-color,box-shadow] duration-200 ease-out hover:border-[var(--accent-hover)] hover:bg-[var(--accent)] hover:text-black",
  secondary:
    "border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] text-[var(--text)] transition-[background-color,color,border-color,box-shadow] duration-200 ease-out hover:border-[var(--accent)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]",
  ghost:
    "text-[var(--accent)] hover:text-[var(--accent-hover)] hover:underline underline-offset-4 transition-colors duration-200 ease-out",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)]";

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}
