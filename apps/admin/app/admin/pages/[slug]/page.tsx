import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { AiStudioLandingEditor } from "@/components/ai-studio-landing-editor";
import { MarketingPageEditor } from "@/components/marketing-page-editor";

const titles: Record<string, string> = {
  services: "Services page",
  enterprise: "Enterprise page",
  about: "About page",
  contact: "Contact page",
  faq: "FAQ page",
  "ai-studio": "AI Studio — landing",
};

type Props = { params: Promise<{ slug: string }> };

export default async function AdminMarketingPageEditor({ params }: Props) {
  const { slug } = await params;
  if (slug === "home") {
    return notFound();
  }
  const pageTitle = titles[slug];
  if (!pageTitle) {
    return notFound();
  }

  const isAiStudio = slug === "ai-studio";

  return (
    <>
      <AdminPageHeader
        title={isAiStudio ? "AI Studio — Landing Editor" : `${pageTitle} (EN / AR)`}
        description={
          isAiStudio
            ? "Edit hero, offer cards, deliverables, FAQ, and all sections for the public AI Studio landing page."
            : "Edit the copy and SEO metadata for this route per locale. Use draft/published state to control what ships to the public site."
        }
        apiReference="GET /pages · PATCH /pages/:id · GET /public/site/:locale"
      />
      <nav className="mb-5 flex items-center gap-2 text-sm">
        <Link
          href="/admin/pages"
          className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
        >
          Pages
        </Link>
        {isAiStudio && (
          <>
            <span className="text-[var(--admin-muted)]">/</span>
            <Link
              href="/admin/ai-studio"
              className="text-[var(--admin-primary)] underline-offset-2 hover:underline"
            >
              AI Studio hub
            </Link>
          </>
        )}
        <span className="text-[var(--admin-muted)]">/</span>
        <span className="text-[var(--admin-muted)]">{pageTitle}</span>
      </nav>
      {isAiStudio ? (
        <AiStudioLandingEditor pageTitle={pageTitle} />
      ) : (
        <MarketingPageEditor slug={slug} pageTitle={pageTitle} />
      )}
    </>
  );
}
