import type { AdminListViewConfig } from "../types";

export const leadsListView: AdminListViewConfig = {
  pageTitle: "Leads",
  pageDescription:
    "Commercial opportunities pulled from forms and campaigns. Extend with owner assignment, stage, and CRM export without renaming columns here.",
  apiReference: "GET /admin/leads · PATCH /admin/leads/:id · POST /leads",
  columns: ["Name", "Company", "Email", "Interest", "Source", "Status", "Created"],
  emptyState: {
    title: "No leads yet",
    body: "When public forms POST to the API, rows appear here newest-first. Add filters (source, status) on this toolbar later.",
  },
  primaryAction: {
    label: "Add lead",
    hint: "Manual entry UI can reuse the same DTO as public submissions.",
  },
};
