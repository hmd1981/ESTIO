import { ListPageScaffold } from "@/components/list-page-scaffold";
import { NavigationManager } from "@/components/navigation-manager";
import { fetchJson } from "@/lib/fetch-api";
import { navigationListView } from "@/lib/admin/views/navigation";

type NavRow = {
  id: string;
  label: string;
  href: string;
  orderIndex: number;
  location: string;
  locale: string;
  isActive: boolean;
};

export default async function AdminNavigationPage() {
  const initial = (await fetchJson<NavRow[]>("/navigation")) ?? [];

  return (
    <ListPageScaffold config={navigationListView}>
      <NavigationManager initialRows={initial} />
    </ListPageScaffold>
  );
}
