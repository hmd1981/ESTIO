import { DataTableShell } from "@/components/data-table-shell";
import { EmptyState } from "@/components/empty-state";
import { ListPageScaffold } from "@/components/list-page-scaffold";
import { TableFooterPlaceholder } from "@/components/table-footer-placeholder";
import { inquiriesListView } from "@/lib/admin/views/inquiries";

export default function AdminInquiriesPage() {
  const cols = inquiriesListView.columns;

  return (
    <ListPageScaffold config={inquiriesListView}>
      <DataTableShell
        caption={`${inquiriesListView.pageTitle} inbox`}
        columns={cols}
        footer={<TableFooterPlaceholder />}
      >
        <tr>
          <td colSpan={cols.length} className="p-0">
            <EmptyState
              className="m-4"
              title={inquiriesListView.emptyState.title}
              body={inquiriesListView.emptyState.body}
            />
          </td>
        </tr>
      </DataTableShell>
    </ListPageScaffold>
  );
}
