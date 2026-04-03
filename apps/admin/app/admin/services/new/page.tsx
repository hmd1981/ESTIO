import { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ServiceCreateForm } from "@/components/service-create-form";

export default function AdminServiceCreatePage() {
  return (
    <>
      <AdminPageHeader
        title="New service"
        description="Create one catalogue row for a live public route, then continue editing the copy and structured detail blocks."
        apiReference="POST /services"
      />
      <Suspense
        fallback={
          <p className="text-sm text-[var(--admin-muted)]">Loading form…</p>
        }
      >
        <ServiceCreateForm />
      </Suspense>
    </>
  );
}
