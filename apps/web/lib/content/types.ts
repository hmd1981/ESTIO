/** Shared shapes for marketing copy — designed to map cleanly to CMS section JSON later. */

export type NavItem = {
  label: string;
  href: string;
};

export type FooterColumn = {
  title: string;
  links: NavItem[];
};

export type ServiceCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Stable key for categorisation when content moves to a CMS. */
  categoryKey: string;
};

export type IndustryItem = {
  label: string;
  description: string;
};

export type ServiceDetailContent = {
  slug: string;
  title: string;
  summary: string;
  /** Long-form body from CMS (markdown-style plain text). */
  longDescription?: string;
  /** `<title>` and Open Graph description (kept in content for CMS-like workflows). */
  seo: {
    title: string;
    description: string;
  };
  /** Breadcrumb trail before the current page title (not including Home). */
  breadcrumbParents: { href: string; label: string }[];
  capabilities: string[];
  idealClients: string[];
  deliverables: string[];
  /** Optional process steps for how-we-work section. */
  process?: Array<{
    step: string;
    description: string;
    /** Named owner or function (optional). */
    owner?: string;
    /** Definition of done for the step (optional). */
    definitionOfDone?: string;
  }>;
  /** Extra narrative blocks after the hero summary (e.g. enterprise positioning). */
  additionalSections?: Array<{
    title: string;
    paragraphs?: string[];
    bullets?: string[];
  }>;
  cta: { headline: string; body: string; href: string; buttonLabel: string };
  secondaryCta?: { href: string };
  /**
   * Service detail hero: right column image or video (URL or media library id).
   * CMS: `detailBlocks.heroVisual` on the service row.
   */
  heroVisual?: {
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
  };
};
