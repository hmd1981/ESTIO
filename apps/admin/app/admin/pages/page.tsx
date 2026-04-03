import Link from "next/link";
import { DataTableShell } from "@/components/data-table-shell";
import { ListPageScaffold } from "@/components/list-page-scaffold";
import { TableFooterPlaceholder } from "@/components/table-footer-placeholder";
import { fetchJson } from "@/lib/fetch-api";
import { pagesListView } from "@/lib/admin/views/pages";

type PageRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: string;
  updatedAt: string;
};

export default async function AdminPagesPage() {
  const cols = pagesListView.columns;
  const rows = (await fetchJson<PageRow[]>("/pages")) ?? [];

  return (
    <ListPageScaffold config={pagesListView}>
      <p className="mb-4 text-sm text-[var(--admin-muted)]">
        <Link
          href="/admin/pages/home"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          Edit home page (EN / AR sections JSON)
        </Link>
      </p>
      <p className="mb-4 text-sm text-[var(--admin-muted)]">
        Quick editors:{" "}
        <Link
          href="/admin/pages/about"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          About
        </Link>
        ,{" "}
        <Link
          href="/admin/pages/contact"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          Contact
        </Link>
        ,{" "}
        <Link
          href="/admin/pages/services"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          Services
        </Link>
        ,{" "}
        <Link
          href="/admin/pages/enterprise"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          Enterprise
        </Link>
        ,{" "}
        <Link
          href="/admin/pages/faq"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          FAQ
        </Link>
        ,{" "}
        <Link
          href="/admin/pages/ai-studio"
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          AI Studio
        </Link>
        .
      </p>
      <DataTableShell
        caption={`${pagesListView.pageTitle} directory`}
        columns={cols}
        footer={<TableFooterPlaceholder totalLabel={`${rows.length}`} />}
      >
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={cols.length}
              className="px-4 py-10 text-center text-sm text-[var(--admin-muted)]"
            >
              {pagesListView.emptyState.title}.{" "}
              {pagesListView.emptyState.body}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-mono text-xs">
                {[
                  "about",
                  "contact",
                  "services",
                  "enterprise",
                  "faq",
                  "ai-studio",
                ].includes(row.slug) ? (
                  <Link
                    href={`/admin/pages/${row.slug}`}
                    className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
                  >
                    {row.slug}
                  </Link>
                ) : (
                  row.slug
                )}
              </td>
              <td className="px-4 py-3 text-xs uppercase">{row.locale}</td>
              <td className="px-4 py-3 font-medium">{row.title}</td>
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
