import Link from "next/link";
import { AdminPageHeader } from "@/components/admin-page-header";
import { HomePageEditor } from "@/components/home-page-editor";

export default function AdminHomePageEditorRoute() {
  return (
    <>
      <AdminPageHeader
        title="Home page (EN / AR)"
        description="Control hero imagery, headlines, and section blocks for the public homepage per locale. Site language is English or Arabic only; this admin UI stays in English."
        apiReference="GET /pages · PATCH /pages/:id"
      />
      <p className="mb-4 text-sm">
        <Link
          href="/admin/pages"
          className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          ← All pages
        </Link>
      </p>
      <HomePageEditor />
    </>
  );
}
