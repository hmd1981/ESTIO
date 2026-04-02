import { AdminPageHeader } from "@/components/admin-page-header";
import { AutomationLog } from "@/components/automation-log";

export default function AutomationPage() {
  return (
    <>
      <AdminPageHeader
        title="Automation log"
        description="Idempotent-style runs: acknowledgements, assignments, stale and follow-up checks."
        apiReference="GET /admin/automation-runs"
      />
      <AutomationLog />
    </>
  );
}
