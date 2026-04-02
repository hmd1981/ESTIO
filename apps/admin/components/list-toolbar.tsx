import Link from "next/link";

type Props = {
  /** Accessible name for the toolbar region (matches data domain). */
  summary: string;
  searchPlaceholder?: string;
  primaryAction?: { label: string; hint: string; href?: string };
};

/**
 * Toolbar row above tables — controls stay disabled until API + auth ship.
 */
export function ListToolbar({
  summary,
  searchPlaceholder = "Search…",
  primaryAction,
}: Props) {
  return (
    <div
      role="search"
      aria-label={summary}
      className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <label className="sr-only" htmlFor="admin-list-search">
        Filter list
      </label>
      <input
        id="admin-list-search"
        type="search"
        disabled
        placeholder={searchPlaceholder}
        title="Connect search to the API query layer when ready."
        className="w-full max-w-xs rounded-md border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-3 py-2 text-sm text-[var(--admin-text)] placeholder:text-[var(--admin-placeholder)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-72"
      />
      {primaryAction?.href ? (
        <Link
          href={primaryAction.href}
          title={primaryAction.hint}
          className="inline-flex items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--admin-primary-hover)]"
        >
          {primaryAction.label}
        </Link>
      ) : primaryAction ? (
        <button
          type="button"
          disabled
          title={primaryAction.hint}
          className="inline-flex items-center justify-center rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[var(--admin-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {primaryAction.label}
        </button>
      ) : null}
    </div>
  );
}
