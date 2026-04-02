import { ListPageScaffold } from "@/components/list-page-scaffold";
import { MediaLibrary } from "@/components/media-library";
import { fetchJson } from "@/lib/fetch-api";
import { mediaListView } from "@/lib/admin/views/media";

type MediaRow = {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  altText: string | null;
  category: string | null;
  publicUrl: string | null;
  uploadedAt: string;
};

export default async function AdminMediaPage() {
  const initial = (await fetchJson<MediaRow[]>("/media")) ?? [];

  return (
    <ListPageScaffold config={mediaListView}>
      <MediaLibrary initialRows={initial} />
    </ListPageScaffold>
  );
}
