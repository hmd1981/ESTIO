import Link from "next/link";
import { AdminPageHeader } from "@/components/admin-page-header";
import { MediaLocationsGuide } from "@/components/media-locations-guide";

export default function MediaLocationsPage() {
  return (
    <>
      <AdminPageHeader
        title="Media map"
        description="Every place in this admin where you can attach the media library (imageMediaAssetId), direct image URLs, or hero videos. Use this when tracing where an asset appears or planning new slots."
        actions={
          <Link
            href="/admin/media"
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs font-semibold text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
          >
            ← Media library
          </Link>
        }
      />
      <MediaLocationsGuide />
    </>
  );
}
