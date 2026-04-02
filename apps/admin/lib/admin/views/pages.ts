import type { AdminListViewConfig } from "../types";

export const pagesListView: AdminListViewConfig = {
  pageTitle: "Pages",
  pageDescription:
    "CMS entries for marketing URLs. Each row owns a slug, editorial status, and a structured `sections` JSON blob that the public site can render without hard-coded copy.",
  apiReference: "GET /pages · POST /pages · PATCH /pages/:id · DELETE /pages/:id",
  columns: ["Slug", "Locale", "Title", "Status", "Updated"],
  emptyState: {
    title: "No pages in the database",
    body: "After migrations, seed at least `home` and priority landings. List queries will hydrate this table server-side.",
  },
  primaryAction: {
    label: "New page",
    hint: "Opens the editor once create + auth exist.",
  },
};
