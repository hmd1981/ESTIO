import { AdminPageHeader } from "@/components/admin-page-header";
import { PipelineBoard } from "@/components/pipeline-board";

export default function PipelinePage() {
  return (
    <>
      <AdminPageHeader
        title="Pipeline"
        description="Leads grouped by pipeline stage. Change stage from the lead detail screen or via PATCH /admin/leads/:id/stage."
        apiReference="GET /admin/leads?stage= · PATCH /admin/leads/:id/stage"
      />
      <PipelineBoard />
    </>
  );
}
