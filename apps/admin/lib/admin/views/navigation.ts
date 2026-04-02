import type { AdminListViewConfig } from "../types";

export const navigationListView: AdminListViewConfig = {
  pageTitle: "Navigation",
  pageDescription:
    "Header and footer link sets with `NavigationLocation` enum, `orderIndex`, and `isActive` for soft retirement without losing history.",
  apiReference:
    "GET /navigation · GET /navigation/public?location=HEADER · POST /navigation · PATCH /navigation/:id",
  columns: ["Label", "Href", "Order", "Location", "Locale", "Active"],
  emptyState: {
    title: "Navigation not loaded",
    body: "Hydrate from GET /navigation (admin) or seed defaults. Public site can read filtered public endpoint.",
  },
  primaryAction: {
    label: "New link",
    hint: "Validates href and location before insert.",
  },
};
