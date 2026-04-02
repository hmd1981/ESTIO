import { AdminPageHeader } from "@/components/admin-page-header";
import { ServiceEditor } from "@/components/service-editor";

export default async function AdminServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <AdminPageHeader
        title="Edit service"
        description="Update catalogue copy and status for this locale. Duplicate the row with another locale in the database if both EN and AR slugs are required."
        apiReference="GET /services/:id · PATCH /services/:id"
      />
      <ServiceEditor serviceId={id} />
    </>
  );
}
