import { AdminPageHeader } from "@/components/admin-page-header";
import { CrmUsersManager } from "@/components/crm-users-manager";

export default function AdminCrmUsersPage() {
  return (
    <>
      <AdminPageHeader
        title="CRM users"
        description="Assignee directory for ownership. This does not affect admin authentication."
        apiReference="GET /admin/crm-users · POST /admin/crm-users"
      />
      <CrmUsersManager initialRows={[]} />
    </>
  );
}

