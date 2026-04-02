import { AdminPageHeader } from "@/components/admin-page-header";
import { SalesSettingsForm } from "@/components/sales-settings-form";

export default function SalesSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Sales settings"
        description="Operational thresholds and default routing. Scoring weights are stored as JSON and merged with API defaults."
        apiReference="GET/PATCH /admin/sales-settings"
      />
      <SalesSettingsForm />
    </>
  );
}
