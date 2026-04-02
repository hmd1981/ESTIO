import { AdminPageHeader } from "@/components/admin-page-header";
import { CrmUsersManager } from "@/components/crm-users-manager";
import { fetchJson } from "@/lib/fetch-api";

type Row = { id: string; email: string; name: string; isActive: boolean };

export default async function AdminCrmUsersPage() {
  const rows = (await fetchJson<Row[]>("/admin/crm-users")) ?? [];
  return (
    <>
      <AdminPageHeader
        title="CRM users"
        description="Assignee directory for ownership. This does not affect admin authentication."
        apiReference="GET /admin/crm-users · POST /admin/crm-users"
      />
      <CrmUsersManager initialRows={rows} />
    </>
  );
}

