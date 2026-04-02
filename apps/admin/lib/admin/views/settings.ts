import type { AdminFormViewConfig } from "../types";

export const settingsFormView: AdminFormViewConfig = {
  pageTitle: "Settings",
  pageDescription:
    "Singleton business profile consumed by header, footer, and JSON-LD. Social links stored as a small key→url map; enforce HTTPS in validation.",
  apiReference: "GET /settings · PUT /settings (upsert)",
};
