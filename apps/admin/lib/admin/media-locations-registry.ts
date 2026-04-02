/**
 * Single source of truth: where images/videos can be attached in admin (library id or URL).
 * Update when new editors or JSON keys ship.
 */
export type MediaLocationItem = {
  id: string;
  title: string;
  /** Human-readable area inside the editor */
  where: string;
  href: string;
  /** Keys / paths in stored JSON (for search & support) */
  fields: string[];
  notes?: string;
};

export type MediaLocationGroup = {
  id: string;
  label: string;
  items: MediaLocationItem[];
};

export const MEDIA_LOCATION_GROUPS: MediaLocationGroup[] = [
  {
    id: "home",
    label: "Homepage",
    items: [
      {
        id: "home-hero",
        title: "Hero — background & right panel",
        where: "Home page editor → Hero",
        href: "/admin/pages/home",
        fields: [
          "hero.imageUrl",
          "hero.imageMediaAssetId",
          "hero.imageAlt",
          "hero.videoUrl",
          "hero.videoMediaAssetId",
        ],
        notes:
          "Background image and optional hero video; panel image uses the same hero image fields in structured editors.",
      },
      {
        id: "home-guided",
        title: "Guided intents",
        where: "Home page editor → Get started / guided",
        href: "/admin/pages/home",
        fields: [
          "guided.imageUrl",
          "guided.imageMediaAssetId",
          "guided.items[].imageUrl",
          "guided.items[].imageMediaAssetId",
        ],
      },
      {
        id: "home-trust",
        title: "Trust",
        where: "Home page editor → Trust",
        href: "/admin/pages/home",
        fields: [
          "trust.imageUrl",
          "trust.imageMediaAssetId",
          "trustPoints[].imageUrl",
          "trustPoints[].imageMediaAssetId",
        ],
      },
      {
        id: "home-services",
        title: "Services overview",
        where: "Home page editor → Services",
        href: "/admin/pages/home",
        fields: [
          "services.imageUrl",
          "services.imageMediaAssetId",
          "pillarServices[].imageUrl",
          "pillarServices[].imageMediaAssetId",
        ],
      },
      {
        id: "home-enterprise",
        title: "Enterprise highlight",
        where: "Home page editor → Enterprise",
        href: "/admin/pages/home",
        fields: [
          "enterprise.imageUrl",
          "enterprise.imageMediaAssetId",
          "enterprise.items[].imageUrl",
          "enterprise.items[].imageMediaAssetId",
          "enterpriseHighlight (legacy block)",
        ],
        notes:
          "Also merges from enterpriseHighlight / enterprise CMS blocks per locale.",
      },
      {
        id: "home-industries",
        title: "Industries",
        where: "Home page editor → Industries",
        href: "/admin/pages/home",
        fields: [
          "industriesContent.imageUrl",
          "industries[].imageUrl",
          "industries[].imageMediaAssetId",
        ],
      },
      {
        id: "home-cta",
        title: "Bottom CTA strip",
        where: "Home page editor → CTA",
        href: "/admin/pages/home",
        fields: ["cta.imageUrl", "cta.imageMediaAssetId", "ctaStrip"],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing pages (per slug / locale)",
    items: [
      {
        id: "mp-hero-office-trust",
        title: "Hero & aside visuals",
        where: "Pages → [slug] → Hero / Office / Trust visuals",
        href: "/admin/pages",
        fields: ["heroVisual", "officeVisual", "trustVisual"],
        notes:
          "Open the page row, then use the structured editor. Contact uses office + trust; other slugs vary.",
      },
      {
        id: "mp-services-groups",
        title: "Services listing — groups & cards",
        where: "Pages → services → Service groups",
        href: "/admin/pages",
        fields: [
          "serviceGroups[].imageUrl",
          "serviceGroups[].itemImages[].imageUrl",
          "serviceGroups[].itemImages[].imageMediaAssetId",
        ],
      },
      {
        id: "mp-enterprise-hero-capability-process",
        title: "Enterprise — hero, capability, process visuals",
        where: "Pages → enterprise → Enterprise visuals",
        href: "/admin/pages/enterprise",
        fields: [
          "enterpriseVisuals.hero",
          "enterpriseVisuals.capability",
          "enterpriseVisuals.process",
        ],
        notes:
          "Expected roles: hero → assetRole hero / critical; capability → supporting + explanation; process → supporting. Subpages reuse these slots from the enterprise page bundle.",
      },
      {
        id: "mp-enterprise-system-diagram",
        title: "Enterprise — system diagram slot",
        where: "Pages → enterprise → System diagram card",
        href: "/admin/pages/enterprise",
        fields: ["enterpriseVisuals.systemDiagram"],
        notes:
          "Use assetRole diagram, assetPurpose explanation, assetPriority critical|supporting. Renders the wide architecture strip on /enterprise.",
      },
      {
        id: "mp-enterprise-proof-engine-visuals",
        title: "Enterprise — proof engine row visuals",
        where: "Pages → enterprise → Proof engine → each row",
        href: "/admin/pages/enterprise",
        fields: ["enterpriseProofEngine.items[].visual"],
        notes:
          "Optional per-claim media. Prefer diagram + explanation purpose for schematics; case role when paired with case studies.",
      },
      {
        id: "mp-enterprise-case-visuals",
        title: "Enterprise — case study cards",
        where: "Pages → enterprise → Case studies",
        href: "/admin/pages/enterprise",
        fields: ["enterpriseCaseStudies.items[].visual"],
        notes:
          "assetRole case + trust or explanation. Library id or URL; behavioural frame dims decorative assets.",
      },
      {
        id: "mp-enterprise-program-cards",
        title: "Enterprise — programme / deep-link cards",
        where: "Pages → enterprise → Program cards",
        href: "/admin/pages/enterprise",
        fields: ["enterpriseVisuals.programCards[]"],
        notes: "Images for private-ai / automation programme tiles; conversion or trust purpose typical.",
      },
      {
        id: "mp-enterprise-copy-sections",
        title: "Enterprise — structured copy (admin forms)",
        where: "Pages → enterprise → sections below visuals",
        href: "/admin/pages/enterprise",
        fields: [
          "enterpriseAudience",
          "enterpriseDecisionSummary",
          "enterpriseProofEngine",
          "enterpriseFit",
          "enterpriseCaseStudies",
          "enterpriseDiagrams",
          "enterpriseRoi",
          "enterpriseRoi.investmentProfile",
          "enterpriseDealEntry",
          "enterprisePractice",
          "enterpriseProof",
        ],
        notes:
          "All keys are managed in the structured enterprise editor (no raw JSON required). Merge uses EN fallback for AR where fields are empty.",
      },
      {
        id: "mp-about",
        title: "About",
        where: "Pages → about → About visuals",
        href: "/admin/pages",
        fields: ["aboutVisuals.brand", "aboutVisuals.oman", "aboutVisuals.delivery"],
      },
      {
        id: "mp-reassurance",
        title: "Contact reassurance cards",
        where: "Pages → contact → Reassurance cards",
        href: "/admin/pages",
        fields: ["reassuranceCards[]"],
      },
      {
        id: "mp-advanced-json",
        title: "Advanced JSON",
        where: "Any marketing page → Advanced JSON",
        href: "/admin/pages",
        fields: ["Any key matching imageUrl / imageMediaAssetId / videoMediaAssetId"],
        notes:
          "Managed keys are preserved by the editor; extra media-shaped keys may exist in JSON.",
      },
    ],
  },
  {
    id: "services",
    label: "Service catalogue",
    items: [
      {
        id: "svc-list",
        title: "Service list",
        where: "Services — index",
        href: "/admin/services",
        fields: [],
        notes: "No media on the list screen.",
      },
      {
        id: "svc-detail",
        title: "Service detail record",
        where: "Services → [service] → detailBlocks JSON",
        href: "/admin/services",
        fields: ["detailBlocks (JSON)"],
        notes:
          "Structured copy lives in JSON. Hero/capability/process **images for enterprise programme pages** are not edited here — they are set under Pages → enterprise (`enterpriseVisuals`), shared across enterprise child routes.",
      },
    ],
  },
  {
    id: "library",
    label: "Media library",
    items: [
      {
        id: "media-lib",
        title: "Uploads & imports",
        where: "Media",
        href: "/admin/media",
        fields: ["MediaRow.id → referenced as imageMediaAssetId across pages"],
        notes:
          "The “Used in” column lists placements when the API returns placement metadata for an asset.",
      },
    ],
  },
  {
    id: "other",
    label: "No image fields (today)",
    items: [
      {
        id: "nav",
        title: "Navigation",
        where: "Navigation",
        href: "/admin/navigation",
        fields: [],
      },
      {
        id: "settings",
        title: "Site settings",
        where: "Settings",
        href: "/admin/settings",
        fields: [],
      },
      {
        id: "seo",
        title: "SEO table",
        where: "SEO",
        href: "/admin/seo",
        fields: [],
        notes: "Placeholder UI — no OG image editor wired yet.",
      },
    ],
  },
];

/** Flat list for quick search */
export function flattenMediaLocations(): MediaLocationItem[] {
  return MEDIA_LOCATION_GROUPS.flatMap((g) =>
    g.items.map((it) => ({ ...it })),
  );
}
