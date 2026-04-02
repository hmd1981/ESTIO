import type { ReactNode } from "react";
import type { AdminListViewConfig } from "@/lib/admin/types";
import { AdminPageHeader } from "@/components/admin-page-header";
import { ListToolbar } from "@/components/list-toolbar";

type Props = {
  config: AdminListViewConfig;
  children: ReactNode;
};

/** Opinionated layout for resource index pages — scales to dozens of list screens. */
export function ListPageScaffold({ config, children }: Props) {
  return (
    <>
      <AdminPageHeader
        title={config.pageTitle}
        description={config.pageDescription}
        apiReference={config.apiReference}
      />
      <ListToolbar
        summary={`${config.pageTitle} list`}
        searchPlaceholder={`Search ${config.pageTitle.toLowerCase()}…`}
        primaryAction={config.primaryAction}
      />
      {children}
    </>
  );
}
