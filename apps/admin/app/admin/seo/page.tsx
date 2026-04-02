import { DataTableShell } from "@/components/data-table-shell";
import { ListPageScaffold } from "@/components/list-page-scaffold";
import { TableFooterPlaceholder } from "@/components/table-footer-placeholder";
import { seoListView } from "@/lib/admin/views/seo";

export default function AdminSeoPage() {
  const cols = seoListView.columns;

  return (
    <ListPageScaffold config={seoListView}>
      <DataTableShell
        caption={`${seoListView.pageTitle} records`}
        columns={cols}
        footer={<TableFooterPlaceholder totalLabel="1 (sample)" />}
      >
        <tr>
          <td className="px-4 py-3 font-mono text-xs">/</td>
          <td className="px-4 py-3 text-sm">Estio — Digital &amp; AI</td>
          <td className="max-w-xs truncate px-4 py-3 text-xs text-[var(--admin-muted)]">
            Homepage default meta description…
          </td>
          <td className="px-4 py-3 text-xs text-[var(--admin-muted)]">—</td>
          <td className="max-w-[12rem] truncate px-4 py-3 font-mono text-xs">
            https://estio.org/
          </td>
        </tr>
        <tr>
          <td
            colSpan={cols.length}
            className="bg-[var(--admin-row-header)] px-4 py-3 text-center text-xs text-[var(--admin-muted)]"
          >
            Add one row per public path; enforce unique `route` at the API.
          </td>
        </tr>
      </DataTableShell>
    </ListPageScaffold>
  );
}
