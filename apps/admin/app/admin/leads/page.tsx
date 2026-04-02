import { AdminPageHeader } from "@/components/admin-page-header";
import { LeadsManager } from "@/components/leads-manager";

export default function AdminLeadsPage() {
  return (
    <>
      <AdminPageHeader
        title="Leads"
        description="Inbound opportunities from public forms. Filter by pipeline status and update priority without leaving this screen."
        apiReference="GET /admin/leads · PATCH /admin/leads/:id · POST /leads (public)"
      />
      <LeadsManager />
    </>
  );
}
