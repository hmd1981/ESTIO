import { AdminPageHeader } from "@/components/admin-page-header";
import { SettingsEditor } from "@/components/settings-editor";
import { settingsFormView } from "@/lib/admin/views/settings";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader
        title={settingsFormView.pageTitle}
        description={`${settingsFormView.pageDescription} Arabic fields power the /ar site; the admin UI stays English-only.`}
        apiReference={settingsFormView.apiReference}
      />
      <SettingsEditor />
    </>
  );
}
