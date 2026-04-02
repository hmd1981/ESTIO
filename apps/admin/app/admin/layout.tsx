import type { ReactNode } from "react";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <div className="flex-1 overflow-auto">
            <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
