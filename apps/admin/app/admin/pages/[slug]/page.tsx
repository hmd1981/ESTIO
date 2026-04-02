import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { MarketingPageEditor } from "@/components/marketing-page-editor";

const titles: Record<string, string> = {
  services: "Services page",
  enterprise: "Enterprise page",
  about: "About page",
  contact: "Contact page",
  faq: "FAQ page",
};

type Props = { params: Promise<{ slug: string }> };

export default async function AdminMarketingPageEditor({ params }: Props) {
  const { slug } = await params;
  if (slug === "home") {
    // Use the existing home editor (special, section-based).
    return notFound();
  }
  const pageTitle = titles[slug];
  if (!pageTitle) {
    return notFound();
  }

  return (
    <>
      <AdminPageHeader
        title={`${pageTitle} (EN / AR)`}
        description="Edit the copy and SEO metadata for this route per locale. Use draft/published state to control what ships to the public site."
        apiReference="GET /pages · PATCH /pages/:id · GET /public/site/:locale"
      />
      <p className="mb-4 text-sm">
        <Link
          href="/admin/pages"
          className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          ← All pages
        </Link>
      </p>
      <MarketingPageEditor slug={slug} pageTitle={pageTitle} />
    </>
  );
}

