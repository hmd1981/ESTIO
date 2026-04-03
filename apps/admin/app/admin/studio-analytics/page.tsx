import { AdminPageHeader } from "@/components/admin-page-header";
import { StudioAnalyticsDashboard } from "@/components/studio-analytics-dashboard";

export default function AdminStudioAnalyticsPage() {
  return (
    <>
      <AdminPageHeader
        title="Studio analytics"
        description="AI Studio conversion events — formal stats, rollup-backed when available. UI layout v1 is frozen; see API FROZEN_UI.md."
        apiReference="GET /studio-analytics/stats/summary · POST /studio-analytics/admin/rebuild-rollups"
      />
      <StudioAnalyticsDashboard />
    </>
  );
}
