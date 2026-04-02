import { AdminPageHeader } from "@/components/admin-page-header";
import { TasksList } from "@/components/tasks-list";

export default function TasksPage() {
  return (
    <>
      <AdminPageHeader
        title="Tasks"
        description="Open and completed follow-ups across the lead base."
        apiReference="GET /admin/tasks"
      />
      <TasksList />
    </>
  );
}
