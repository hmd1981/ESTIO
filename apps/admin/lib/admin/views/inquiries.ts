import type { AdminListViewConfig } from "../types";

export const inquiriesListView: AdminListViewConfig = {
  pageTitle: "Inquiries",
  pageDescription:
    "Operational inbox: general contact, enterprise programmes, consultation requests. Typed with `InquiryType` for routing rules.",
  apiReference: "GET /inquiries · POST /inquiries · PATCH /inquiries/:id",
  columns: ["Type", "Name", "Company", "Email", "Status", "Created"],
  emptyState: {
    title: "Inbox empty",
    body: "Wire contact surfaces to POST /inquiries. Add assignment and SLA columns when workflow tooling lands.",
  },
  primaryAction: {
    label: "Record inquiry",
    hint: "Placeholder for inbound call logging.",
  },
};
