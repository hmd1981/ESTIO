type Props = {
  totalLabel?: string;
};

/** Reserved space for server-driven pagination controls. */
export function TableFooterPlaceholder({
  totalLabel = "—",
}: Props) {
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-row-header)] px-4 py-3 text-xs text-[var(--admin-muted)] sm:flex-row sm:items-center">
      <span>
        Showing <span className="font-medium text-[var(--admin-text)]">0</span>{" "}
        of <span className="font-medium text-[var(--admin-text)]">{totalLabel}</span>{" "}
        rows
      </span>
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          disabled
          className="rounded border border-[var(--admin-border)] bg-[var(--admin-input-bg)] px-2 py-1 text-xs disabled:opacity-50"
          title="Wire to list query after API pagination exists."
          defaultValue="25"
        >
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span className="text-[var(--admin-border)]" aria-hidden>
          |
        </span>
        <button
          type="button"
          disabled
          className="rounded px-2 py-1 font-medium disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled
          className="rounded px-2 py-1 font-medium disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
