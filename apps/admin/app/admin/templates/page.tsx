import { AdminPageHeader } from "@/components/admin-page-header";
import { TemplatesManager } from "@/components/templates-manager";

export default function TemplatesPage() {
  return (
    <>
      <AdminPageHeader
        title="Message templates"
        description="Channel-specific snippets for consistent sales outreach."
        apiReference="GET/POST/PATCH /admin/templates"
      />
      <TemplatesManager />
    </>
  );
}
