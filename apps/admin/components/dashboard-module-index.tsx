import Link from "next/link";
import { getAdminNavSections } from "@/lib/admin/registry";

/**
 * Real information-architecture index — grouped rows, no charts or vanity KPIs.
 * New modules: add to ADMIN_ROUTES; this table updates automatically.
 */
export function DashboardModuleIndex() {
  const sections = getAdminNavSections();

  return (
    <div className="overflow-hidden rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">
          Admin modules by area. Each row links to the workspace for that
          domain.
        </caption>
        <thead>
          <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-row-header)]">
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
            >
              Area
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
            >
              Module
            </th>
            <th
              scope="col"
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
            >
              Primary responsibility
            </th>
            <th scope="col" className="w-px whitespace-nowrap px-4 py-2.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--admin-border)]">
          {sections.map(({ title, items }) =>
            items.map((item) => (
              <tr
                key={item.id}
                className="bg-[var(--admin-surface)] hover:bg-[var(--admin-row-hover)]"
              >
                <td className="whitespace-nowrap px-4 py-3 text-xs font-medium text-[var(--admin-muted)]">
                  {title}
                </td>
                <td className="px-4 py-3 font-medium text-[var(--admin-text)]">
                  {item.label}
                </td>
                <td className="max-w-md px-4 py-3 text-[var(--admin-muted)]">
                  {item.primaryResponsibility}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <Link
                    href={item.href}
                    className="text-xs font-semibold text-[var(--admin-text)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-muted)]"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
