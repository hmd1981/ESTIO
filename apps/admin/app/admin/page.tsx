import { AdminPageHeader } from "@/components/admin-page-header";
import { DashboardActivityPanel } from "@/components/dashboard-activity-panel";
import { DashboardModuleIndex } from "@/components/dashboard-module-index";

export default function AdminHomePage() {
  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Control plane for Estio’s website content, inbound pipeline, and global site configuration. Use the module index below to move between bounded workspaces—each maps to a dedicated API surface and database entities."
      />
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2">
          <DashboardModuleIndex />
        </div>
        <div className="lg:col-span-1">
          <DashboardActivityPanel />
        </div>
      </div>
    </>
  );
}
