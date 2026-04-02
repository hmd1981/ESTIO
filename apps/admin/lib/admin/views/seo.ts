import type { AdminListViewConfig } from "../types";

export const seoListView: AdminListViewConfig = {
  pageTitle: "SEO metadata",
  pageDescription:
    "One row per public path (or pattern). Consumed by Next metadata generation or edge middleware — keep canonical and og:image consistent.",
  apiReference: "GET /seo · GET /seo/lookup?path=… · POST /seo · PATCH /seo/:id",
  columns: ["Route", "Title", "Description", "OG image", "Canonical"],
  emptyState: {
    title: "No SEO records",
    body: "Populate alongside page publish events. Lookup by exact path string the web app uses.",
  },
  primaryAction: {
    label: "Add route",
    hint: "Validate uniqueness on `route` key.",
  },
};
