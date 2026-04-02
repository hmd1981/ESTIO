import Link from "next/link";
import { DataTableShell } from "@/components/data-table-shell";
import { ListPageScaffold } from "@/components/list-page-scaffold";
import { TableFooterPlaceholder } from "@/components/table-footer-placeholder";
import { fetchJson } from "@/lib/fetch-api";
import { servicesListView } from "@/lib/admin/views/services";

type ServiceRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  category: string;
  featured: boolean;
  status: string;
  updatedAt: string;
};

export default async function AdminServicesPage() {
  const cols = servicesListView.columns;
  const rows = (await fetchJson<ServiceRow[]>("/services")) ?? [];

  return (
    <ListPageScaffold config={servicesListView}>
      <DataTableShell
        caption={`${servicesListView.pageTitle} catalogue`}
        columns={cols}
        footer={<TableFooterPlaceholder totalLabel={`${rows.length}`} />}
      >
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={cols.length}
              className="px-4 py-10 text-center text-sm text-[var(--admin-muted)]"
            >
              {servicesListView.emptyState.title}.{" "}
              {servicesListView.emptyState.body}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
              <td className="px-4 py-3 text-xs uppercase">{row.locale}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/services/${row.id}`}
                  className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
                >
                  {row.title}
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-[var(--admin-muted)]">
                {row.category}
              </td>
              <td className="px-4 py-3 text-xs">
                {row.featured ? "Yes" : "—"}
              </td>
              <td className="px-4 py-3 text-xs">{row.status}</td>
              <td className="px-4 py-3 text-xs tabular-nums text-[var(--admin-muted)]">
                {new Date(row.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))
        )}
      </DataTableShell>
    </ListPageScaffold>
  );
}
