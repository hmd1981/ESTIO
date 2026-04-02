import type { AdminListViewConfig } from "../types";

export const mediaListView: AdminListViewConfig = {
  pageTitle: "Media",
  pageDescription:
    "Metadata only in phase 1 — binaries live in object storage. Rows track filename, mime, size, alt, and arbitrary category tags. Open Media map (sidebar) for every editor field that can reference library ids or URLs.",
  apiReference: "GET /media · POST /media (metadata) · presigned upload TBD",
  columns: ["Original", "Public URL", "Alt", "Category", "Uploaded"],
  emptyState: {
    title: "No uploads registered",
    body: "The upload pipeline will insert a row after the object is committed, then return a public URL field when ready.",
  },
  primaryAction: {
    label: "Media map",
    hint: "Where images and videos attach across the admin.",
    href: "/admin/media/locations",
  },
};
