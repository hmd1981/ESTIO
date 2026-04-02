import type { ReactNode } from "react";

type Props = {
  columns: readonly string[] | string[];
  /** Short summary for screen readers (should match visible data domain). */
  caption: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Neutral table shell — thead styling stays consistent app-wide.
 */
export function DataTableShell({ columns, caption, children, footer }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--admin-border)]">{children}</tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
