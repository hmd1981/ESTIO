import type { AdminListViewConfig } from "../types";

export const servicesListView: AdminListViewConfig = {
  pageTitle: "Services",
  pageDescription:
    "Catalogue mirrored on /services and /enterprise. Categories map to Prisma `ServiceCategory`; `featured` controls homepage prominence.",
  apiReference:
    "GET /services · POST /services · PATCH /services/:id · GET /services/by-slug/:slug",
  columns: ["Slug", "Locale", "Title", "Category", "Featured", "Status", "Updated"],
  emptyState: {
    title: "No services synced",
    body: "Import or create rows to match public routes — slugs must stay unique for SSR lookups.",
  },
  primaryAction: {
    label: "New service",
    hint: "Create a catalogue row for one of the live service routes, then continue editing in the service editor.",
    href: "/admin/services/new",
  },
};
