import Link from "next/link";
import { AdminPageHeader } from "@/components/admin-page-header";
import { fetchJson } from "@/lib/fetch-api";

type ServiceRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: string;
};

type PageRow = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: string;
};

const SERVICE_OFFERS = [
  {
    slug: "image-production",
    label: "AI Image Production",
    publicPath: "/ai-studio/image-production",
  },
  {
    slug: "video-production",
    label: "AI Video Production",
    publicPath: "/ai-studio/video-production",
  },
  {
    slug: "brand-ai-packs",
    label: "Brand AI Packs",
    publicPath: "/ai-studio/brand-ai-packs",
  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const published = status === "PUBLISHED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide ${
        published
          ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/12 text-amber-600 dark:text-amber-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${published ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {status}
    </span>
  );
}

function LocaleCell({
  row,
  locale,
  offerSlug,
}: {
  row: ServiceRow | undefined;
  locale: string;
  offerSlug: string;
}) {
  if (!row) {
    const createHref = `/admin/services/new?offer=${encodeURIComponent(offerSlug)}&locale=${encodeURIComponent(locale)}`;
    return (
      <span className="inline-flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[var(--admin-muted)]">
          No {locale.toUpperCase()} row
        </span>
        <Link
          href={createHref}
          className="font-medium text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          Create {locale.toUpperCase()}
        </Link>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Link
        href={`/admin/services/${row.id}`}
        className="text-sm text-[var(--admin-primary)] underline-offset-2 hover:underline"
      >
        Edit
      </Link>
      <StatusBadge status={row.status} />
    </span>
  );
}

export default async function AdminAiStudioPage() {
  const allServices = (await fetchJson<ServiceRow[]>("/services")) ?? [];
  const allPages = (await fetchJson<PageRow[]>("/pages")) ?? [];

  const enPage = allPages.find(
    (p) => p.slug === "ai-studio" && p.locale === "en",
  );
  const arPage = allPages.find(
    (p) => p.slug === "ai-studio" && p.locale === "ar",
  );

  const servicesByKey = new Map(
    allServices.map((s) => [`${s.slug}:${s.locale}`, s] as const),
  );

  return (
    <>
      <AdminPageHeader
        title="AI Studio"
        description="Manage the AI Studio landing page, offer pages, and publishing state across both locales."
        actions={
          <Link
            href="/admin/pages/ai-studio"
            className="inline-flex items-center rounded-md bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--admin-primary-hover)]"
          >
            Open landing editor
          </Link>
        }
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ─── Main column ─── */}
        <div className="space-y-6">
          {/* Landing page card */}
          <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-[var(--admin-text)]">
                  Landing page
                </h2>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">
                  Controls the public{" "}
                  <code className="rounded bg-[var(--admin-row-header)] px-1 py-0.5 font-mono">
                    /ai-studio
                  </code>{" "}
                  page — hero, offer cards, deliverables, FAQ, and SEO.
                </p>
              </div>
              <Link
                href="/admin/pages/ai-studio"
                className="shrink-0 rounded-md border border-[var(--admin-border)] px-3 py-1.5 text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
              >
                Edit content
              </Link>
            </div>
            <div className="flex items-center gap-6 px-5 py-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--admin-muted)]">
                  EN
                </span>
                {enPage ? (
                  <StatusBadge status={enPage.status} />
                ) : (
                  <span className="text-xs text-[var(--admin-muted)]">
                    not created
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--admin-muted)]">
                  AR
                </span>
                {arPage ? (
                  <StatusBadge status={arPage.status} />
                ) : (
                  <span className="text-xs text-[var(--admin-muted)]">
                    not created
                  </span>
                )}
              </div>
            </div>
            {!enPage && !arPage ? (
              <p className="border-t border-[var(--admin-border)] px-5 py-3 text-xs text-amber-600 dark:text-amber-400">
                No CMS rows exist yet. Open the editor to create EN + AR drafts
                automatically.
              </p>
            ) : null}
          </section>

          {/* Offer pages card */}
          <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)]">
            <div className="border-b border-[var(--admin-border)] px-5 py-4">
              <h2 className="text-sm font-semibold text-[var(--admin-text)]">
                Offer pages
              </h2>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                Each offer has its own public page under{" "}
                <code className="font-mono">/ai-studio/</code>. These are
                managed as Service records in the catalogue. Keep both EN and AR
                published. Right-column image or video: open{" "}
                <strong className="text-[var(--admin-text)]">Edit</strong> →{" "}
                <strong className="text-[var(--admin-text)]">
                  Hero visual (right column)
                </strong>
                .
              </p>
            </div>
            <div className="divide-y divide-[var(--admin-border)]">
              {SERVICE_OFFERS.map((offer) => {
                const en = servicesByKey.get(`${offer.slug}:en`);
                const ar = servicesByKey.get(`${offer.slug}:ar`);
                return (
                  <div key={offer.slug} className="px-5 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div>
                        <span className="text-sm font-medium text-[var(--admin-text)]">
                          {offer.label}
                        </span>
                        <span className="ms-2 font-mono text-[0.65rem] text-[var(--admin-muted)]">
                          {offer.publicPath}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-medium text-[var(--admin-muted)]">
                          EN
                        </span>
                        <LocaleCell
                          row={en}
                          locale="en"
                          offerSlug={offer.slug}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-medium text-[var(--admin-muted)]">
                          AR
                        </span>
                        <LocaleCell
                          row={ar}
                          locale="ar"
                          offerSlug={offer.slug}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[var(--admin-border)] px-5 py-3">
              <Link
                href="/admin/services/new"
                className="text-xs text-[var(--admin-primary)] underline-offset-2 hover:underline"
              >
                + Create a new service record
              </Link>
              <span className="mx-2 text-[var(--admin-muted)]">·</span>
              <span className="text-xs text-[var(--admin-muted)]">
                Prefer{" "}
                <strong className="text-[var(--admin-text)]">Create EN / AR</strong>{" "}
                on each row above so slug and locale are pre-filled.
              </span>
            </div>
          </section>
        </div>

        {/* ─── Side column ─── */}
        <div className="space-y-6">
          {/* Quick actions */}
          <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
              Quick actions
            </h3>
            <nav className="mt-3 space-y-1.5">
              <Link
                href="/admin/pages/ai-studio"
                className="block rounded-md px-3 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
              >
                Edit landing page
              </Link>
              <Link
                href="/admin/pages"
                className="block rounded-md px-3 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
              >
                All marketing pages
              </Link>
              <Link
                href="/admin/services"
                className="block rounded-md px-3 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
              >
                Service catalogue
              </Link>
              <Link
                href="/admin/media"
                className="block rounded-md px-3 py-2 text-sm text-[var(--admin-text)] hover:bg-[var(--admin-row-hover)]"
              >
                Media library
              </Link>
            </nav>
          </section>

          {/* Publishing guidance */}
          <section className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]">
              Publishing guide
            </h3>
            <ol className="mt-3 list-inside list-decimal space-y-2 text-xs leading-relaxed text-[var(--admin-muted)]">
              <li>
                Edit the landing page content for{" "}
                <strong className="text-[var(--admin-text)]">EN</strong>. Save
                as Published.
              </li>
              <li>
                Switch to{" "}
                <strong className="text-[var(--admin-text)]">AR</strong> and
                enter Arabic content. Save as Published.
              </li>
              <li>
                Check the 3 offer pages — create EN + AR rows if needed, publish
                each, then set hero media on the service edit screen.
              </li>
              <li>Preview both locales from the editor.</li>
            </ol>
            <p className="mt-3 text-[0.65rem] text-[var(--admin-muted)]">
              Draft or missing content falls back to hardcoded defaults. No
              public error will occur.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
