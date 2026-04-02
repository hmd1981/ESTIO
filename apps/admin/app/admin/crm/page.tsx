import { AdminPageHeader } from "@/components/admin-page-header";
import { CrmStats } from "@/components/crm-stats";

export default function CrmOverviewPage() {
  return (
    <>
      <AdminPageHeader
        title="CRM overview"
        description="Operational snapshot for Estio’s lead funnel — not a vanity wall; numbers tie to real records in Postgres."
        apiReference="GET /admin/crm/dashboard"
      />
      <CrmStats />
    </>
  );
}
