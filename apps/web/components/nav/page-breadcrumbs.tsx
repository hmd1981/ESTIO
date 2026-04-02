import Link from "next/link";

type Crumb = { href: string; label: string };

type Props = {
  /** Intermediate trail after Home (each segment is a link). */
  parents: Crumb[];
  current: string;
  /** Locale-prefixed home path, e.g. `/en` */
  homeHref?: string;
  homeLabel?: string;
  ariaLabel?: string;
};

export function PageBreadcrumbs({
  parents,
  current,
  homeHref = "/en",
  homeLabel = "Home",
  ariaLabel = "Breadcrumb",
}: Props) {
  return (
    <nav aria-label={ariaLabel} className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
        <li className="min-w-0">
          <Link
            href={homeHref}
            className="font-medium text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {homeLabel}
          </Link>
        </li>
        {parents.map((p) => (
          <li key={p.href} className="flex min-w-0 items-center gap-2">
            <span aria-hidden className="text-[var(--border)]">
              /
            </span>
            <Link
              href={p.href}
              className="truncate font-medium text-[var(--accent)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              {p.label}
            </Link>
          </li>
        ))}
        <li className="flex min-w-0 items-center gap-2">
          <span aria-hidden className="text-[var(--border)]">
            /
          </span>
          <span className="truncate font-medium text-[var(--text)]">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
