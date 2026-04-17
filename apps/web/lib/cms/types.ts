/** Presentation-only taxonomy for media usage (CMS JSON; no backend logic). */
export type CmsAssetRole =
  | "hero"
  | "diagram"
  | "case"
  | "roi"
  | "ui"
  | "decorative";
export type CmsAssetPurpose = "conversion" | "trust" | "explanation";
export type CmsAssetPriority = "critical" | "supporting" | "optional";

/** URL + alt + optional media library id (used-in tracking). */
export type CmsVisual = {
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  assetRole?: CmsAssetRole;
  assetPurpose?: CmsAssetPurpose;
  assetPriority?: CmsAssetPriority;
};

/** Structured proof row — optional CMS override for enterprise landing. */
export type EnterpriseEvidenceType =
  | "case"
  | "internal"
  | "simulation"
  | "reference_architecture";

/** How strongly a claim can be defended — qualitative, no fabricated audits. */
export type EnterpriseVerificationLevel =
  | "internal"
  | "observed"
  | "repeatable"
  | "contractual";

export type EnterpriseDiagramType = "architecture" | "flow" | "integration";

/** Layout controls for the home page (section ids match `HOME_SECTION_IDS`). */
export type HomeSectionsMeta = {
  sectionOrder?: string[];
  hiddenSections?: string[];
  /** When using split preview, highlight this section id in the iframe. */
  highlightSection?: string;
};

/** Shared visual fields for CMS + media library tracking */
export type HomeVisualFields = {
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type HomeListItem = {
  /** Display title (guided intents historically used `label` in CMS) */
  title?: string;
  label?: string;
  description?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  id?: string;
  /** Enterprise bullets */
  text?: string;
};

/**
 * New structured blocks (per section key). Legacy fields below remain supported.
 */
export type HomeSectionBlock = HomeVisualFields & {
  items?: HomeListItem[];
};

/** Loose JSON from Page.sections — admin-controlled homepage blocks. */
export type HomeSectionsCMS = {
  _meta?: HomeSectionsMeta;
  hero?: {
    eyebrow?: string;
    headline?: string;
    subheadline?: string;
    primaryCta?: { label?: string; href?: string };
    secondaryCta?: { label?: string; href?: string };
    /** Optional row of short links (e.g. AI Studio paths); merged with code defaults when absent. */
    intentLinks?: Array<{ label?: string; href?: string }>;
    videoUrl?: string;
    videoMediaAssetId?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
    /** Alias for headline when using generic section shape */
    title?: string;
    subtitle?: string;
    body?: string;
  };
  /** New: section-keyed blocks */
  guided?: HomeSectionBlock;
  trust?: HomeSectionBlock;
  services?: HomeSectionBlock;
  enterprise?: HomeSectionBlock;
  /** New: intro + visuals + optional row items (prefer over legacy `industries` rows when set). */
  industriesContent?: HomeSectionBlock;
  cta?: HomeSectionBlock;

  guidedIntro?: { title?: string; description?: string } & Partial<CmsVisual>;
  guidedIntents?: Array<
    { id?: string; label?: string; href?: string } & Partial<CmsVisual>
  >;
  trustSectionIntro?: { title?: string; description?: string } & Partial<CmsVisual>;
  trustPoints?: Array<{ title?: string; body?: string } & Partial<CmsVisual>>;
  servicesSectionIntro?: { title?: string; description?: string } & Partial<CmsVisual>;
  pillarServices?: {
    id?: string;
    title?: string;
    description?: string;
    href?: string;
    categoryKey?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
  }[];
  enterpriseHighlight?: {
    headline?: string;
    body?: string;
    bullets?: Array<{ title?: string; text?: string } & Partial<CmsVisual>>;
    cta?: { label?: string; href?: string };
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
    subtitle?: string;
  };
  industriesSectionIntro?: { title?: string; description?: string } & Partial<CmsVisual>;
  industries?: Array<{ name?: string; detail?: string } & Partial<CmsVisual>>;
  ctaStrip?: {
    title?: string;
    body?: string;
    cta?: { label?: string; href?: string };
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
  };
};

/** Generic marketing page blocks (about, contact, services intro, FAQ, etc.). */
export type MarketingPageSectionsCMS = {
  _meta?: { highlightSection?: string };
  kicker?: string;
  title?: string;
  subtitle?: string;
  lead?: string;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
  items?: { id?: string; title?: string; body?: string; visible?: boolean }[];
  heroVisual?: CmsVisual;
  officeVisual?: CmsVisual;
  trustVisual?: CmsVisual;
  mapEmbedUrl?: string;
  /** Services overview: optional imagery per group / item */
  serviceGroups?: Array<{
    groupId: string;
    /** Optional display copy for admin / future use (not required by public merge) */
    title?: string;
    description?: string;
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
    itemImages?: Array<{
      slug: string;
      title?: string;
      description?: string;
      href?: string;
      imageUrl?: string;
      imageAlt?: string;
      imageMediaAssetId?: string;
    }>;
  }>;
  /** Contact page: optional reassurance / next-step cards */
  reassuranceCards?: HomeListItem[];
  /** Optional public map link (e.g. Google Maps URL) */
  mapLinkUrl?: string;
  /** Enterprise landing: “who this is for” line (optional; shown near hero). */
  enterpriseAudience?: string;
  /** Enterprise landing: structured, falsifiable proof rows (optional). */
  enterpriseProofEngine?: {
    title?: string;
    items?: Array<{
      claim?: string;
      metric?: string;
      evidenceType?: EnterpriseEvidenceType;
      visual?: Partial<CmsVisual>;
      verification?: {
        level?: EnterpriseVerificationLevel;
        note?: string;
      };
    }>;
  };
  /** Sticky / summary strip before deal entry — decision enforcement. */
  enterpriseDecisionSummary?: {
    forTeams?: string;
    requires?: string;
    delivers?: string;
  };
  /** Enterprise landing: fit / non-fit decision block (optional). */
  enterpriseFit?: {
    title?: string;
    lead?: string;
    fitTitle?: string;
    nonFitTitle?: string;
    fit?: Array<string | { text?: string }>;
    nonFit?: Array<string | { text?: string }>;
  };
  /** Enterprise landing: operational pillars (optional CMS overrides; i18n defaults). */
  enterprisePractice?: {
    title?: string;
    lead?: string;
    blocks?: Array<{ title?: string; body?: string } & Partial<CmsVisual>>;
  };
  /** Enterprise landing: proof strip (optional CMS overrides; i18n defaults). */
  enterpriseProof?: {
    title?: string;
    items?: Array<{ title?: string; body?: string }>;
  };
  /** Enterprise landing: representative / named proof cases. */
  enterpriseCaseStudies?: {
    title?: string;
    lead?: string;
    labels?: {
      situation?: string;
      systems?: string;
      proof?: string;
      commercial?: string;
      problem?: string;
      systemBuilt?: string;
      outcome?: string;
      metrics?: string;
      decisionImpact?: string;
    };
    items?: Array<{
      kicker?: string;
      title?: string;
      body?: string;
      /** What decision this unlocks / risk removed — operational, not narrative. */
      decisionImpact?: string;
      /** Flat media fields for manual JSON paste; merged with `visual` when present. */
      imageUrl?: string;
      imageAlt?: string;
      imageMediaAssetId?: string;
      /** Legacy fields — still merged; prefer problem / systemBuilt / outcome when set. */
      situation?: string;
      systems?: string;
      proof?: string;
      commercial?: string;
      problem?: string;
      systemBuilt?: string;
      outcome?: string;
      metrics?: Array<string | { text?: string; label?: string; value?: string }>;
      visual?: Partial<CmsVisual>;
    }>;
  };
  /** Enterprise landing: system diagrams / architecture strips. */
  enterpriseDiagrams?: {
    title?: string;
    lead?: string;
    items?: Array<{
      title?: string;
      body?: string;
      /** Long-form explanation (preferred over body for structured diagrams). */
      explanation?: string;
      diagramType?: EnterpriseDiagramType;
      columns?: Array<{ label?: string; body?: string }>;
      footer?: string;
    }>;
  };
  /** Enterprise landing: ROI framing and commercial inputs. */
  enterpriseRoi?: {
    title?: string;
    lead?: string;
    formulaLabel?: string;
    formula?: string;
    inputsTitle?: string;
    inputs?: Array<string | { text?: string }>;
    items?: Array<{
      metric?: string;
      value?: string;
      body?: string;
      title?: string;
    }>;
    cards?: Array<{ title?: string; body?: string }>;
    /** What is reduced / automated / gained — qualitative; no fabricated numbers. */
    reducedTitle?: string;
    automatedTitle?: string;
    gainedTitle?: string;
    reduced?: Array<string | { text?: string }>;
    automated?: Array<string | { text?: string }>;
    gained?: Array<string | { text?: string }>;
    /** Qualitative investment / scope framing — no fabricated figures. */
    investmentProfile?: {
      scope?: string;
      variables?: Array<string | { text?: string }>;
    };
  };
  /** Enterprise landing: scoped CTA / deal entry cards. */
  enterpriseDealEntry?: {
    title?: string;
    body?: string;
    lead?: string;
    checklistLabel?: string;
    primaryCta?: {
      label?: string;
      href?: string;
    };
    secondaryCta?: {
      label?: string;
      href?: string;
    };
    items?: Array<{
      title?: string;
      body?: string;
      checklist?: Array<string | { text?: string }>;
      ctaLabel?: string;
      messageTemplate?: string;
      /** Query prefill for contact form — ENTERPRISE_AI | AUTOMATION | PLATFORM_BUILD */
      intent?: string;
      /** Required vs optional briefing fields — shown before submit. */
      qualification?: {
        required?: Array<string | { text?: string }>;
        optional?: Array<string | { text?: string }>;
      };
    }>;
  };
  enterpriseVisuals?: {
    hero?: CmsVisual;
    capability?: CmsVisual;
    process?: CmsVisual;
    /** Optional reference architecture / system diagram slot. */
    systemDiagram?: CmsVisual;
    programCards?: HomeListItem[];
  };
  aboutVisuals?: {
    brand?: CmsVisual;
    oman?: CmsVisual;
    delivery?: CmsVisual;
  };
};

export type MarketingPageRecord = {
  id: string;
  slug: string;
  locale: string;
  title: string;
  status: string;
  sections?: unknown;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

/** From GET /public/site/:locale — resolves `imageMediaAssetId` to URLs on the client/SSR. */
export type MediaAssetMap = Record<
  string,
  { url: string; alt?: string; mimeType?: string }
>;

export type PublicSiteBundle = {
  locale: "en" | "ar";
  settings: Record<string, unknown> | null;
  navigation: {
    header: Array<Record<string, unknown>>;
    footer: Array<Record<string, unknown>>;
  };
  homePage: { sections?: unknown } | null;
  /** All CMS marketing routes keyed by slug (home, services, enterprise, …). */
  marketingPages?: Partial<
    Record<string, MarketingPageRecord | null | undefined>
  >;
  services: Array<Record<string, unknown>>;
  /** Media library rows with a public URL, keyed by asset id. */
  mediaAssets?: MediaAssetMap;
  preview?: boolean;
};
