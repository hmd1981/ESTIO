import type { IndustryItem, ServiceCard } from "./types";

export const homeHero = {
  headline:
    "Campaign-ready visuals, video, and brand assets \u2014 without the production overhead.",
  subheadline:
    "Stop waiting weeks for creative output. ESTIO\u2019s AI Studio produces brand-aligned imagery, video, and visual systems \u2014 scoped, reviewed, and delivered as production-ready files.",
  primaryCta: { label: "Define your visual scope", href: "/contact" },
  secondaryCta: { label: "See what we produce", href: "/ai-studio" },
} as const;

export const systemIdentity = {
  heading: "What this is",
  body: "A commercial system for scoping, building, and handing over bounded workflow automation and governed retrieval on top of your named applications — under written acceptance tests and your change control.",
  contrast: "Not a generalist agency. Not a software reseller. Not an unfunded innovation lab.",
} as const;

export const operationalAlignment = {
  kicker: "Operational alignment",
  title: "Organisations we align with typically operate",
  points: [
    "Multi-system environments (CRM + finance + internal tools)",
    "Approval-heavy workflows with named gatekeepers",
    "Controlled data and access boundaries enforced by IT and compliance",
  ],
  footer:
    "Engagements run under procurement rules, IT sign-off, and production risk ownership — not marketing experiments or unpaid pilots.",
} as const;

export const guidedIntents = [
  {
    id: "website",
    label: "Design and deploy a production website or web platform",
    href: "/services/web-design-development",
  },
  {
    id: "content",
    label: "Operate a structured content and campaign programme",
    href: "/services/content-campaigns",
  },
  {
    id: "creative-ai",
    label: "Scale creative output under governed AI controls",
    href: "/services/ai-creative",
  },
  {
    id: "enterprise",
    label: "Scope workflow automation or governed retrieval on named systems",
    href: "/enterprise",
  },
] as const;

export const trustSectionIntro = {
  title: "Operating standards — not promises",
  description:
    "Scoped delivery, documented decisions, and outcomes that survive internal review. We operate at the standard your board, IT, and compliance teams require — not the standard agencies sell.",
} as const;

export const trustPoints = [
  {
    title: "Written scope before build",
    body: "Deliverables, acceptance criteria, and dependencies are defined and signed before any execution starts. No ambiguity, no scope creep without written change control.",
  },
  {
    title: "Deployed AI, not pitch-deck AI",
    body: "AI operates inside your identity model, on corpora you approve, with logging you control. If it does not run in production under your constraints, it does not ship.",
  },
  {
    title: "Designed for GCC operating reality",
    body: "Bilingual delivery, regional compliance, and stakeholder communication calibrated for boards, regulators, and government-adjacent organisations.",
  },
  {
    title: "Single accountable owner",
    body: "One named lead owns every deliverable end-to-end. No account-manager buffer. No handoffs between teams you never meet.",
  },
] as const;

export const servicesSectionIntro = {
  title: "Four delivery practices — scoped, not bundled",
  description:
    "Each practice operates independently with its own scope, deliverables, and acceptance criteria. Combined engagements are sequenced explicitly — not sold as a package.",
} as const;

export const pillarServices: ServiceCard[] = [
  {
    id: "web",
    title: "Platform design & deployment",
    description:
      "Production websites, web applications, and bilingual digital platforms — architected for performance, accessibility, CMS ownership, and institutional credibility. Not templates. Not themes.",
    href: "/services/web-design-development",
    categoryKey: "WEB_DESIGN_DEVELOPMENT",
  },
  {
    id: "content",
    title: "Content operations & campaign execution",
    description:
      "Structured production calendars, campaign execution, and channel management tied to your commercial rhythm — not ad-hoc posting against a quota.",
    href: "/services/content-campaigns",
    categoryKey: "CONTENT_CAMPAIGNS",
  },
  {
    id: "ai-creative",
    title: "Governed AI creative production",
    description:
      "AI-generated imagery, video, and copy deployed under brand, legal, and quality guardrails — with review checkpoints and version control before any output ships.",
    href: "/services/ai-creative",
    categoryKey: "AI_CREATIVE",
  },
  {
    id: "enterprise",
    title: "Workflow automation & governed retrieval",
    description:
      "Deterministic automation across named systems, retrieval bound to approved corpora under identity rules, and internal operator tools — scoped in writing, deployed for IT-operated production.",
    href: "/enterprise",
    categoryKey: "ENTERPRISE_AI",
  },
];

export const enterpriseHighlight = {
  headline: "Operational systems — not vendor demos",
  body: "Websites are the visible layer. Underneath, we deploy deterministic automation across your integration inventory, retrieval services bound to corpora you sign off, and internal tools your IT team operates post-handover. If you cannot name the systems in scope, this section is not for you.",
  bullets: [
    {
      title: "Governed retrieval",
      text: "Retrieval grounded on allow-listed corpora with identity-scoped access, configured blocklists, and logging retention matched to your record-keeping policy. Not prompt engineering on a public model.",
    },
    {
      title: "Workflow automation",
      text: "Deterministic orchestration across CRM, finance, ticketing, and messaging — with retry logic, typed exception queues, and rollback paths your operations team can execute.",
    },
    {
      title: "Internal operator tools",
      text: "Dashboards, admin UIs, and monitoring surfaces with clear ownership, runbooks, and escalation matrices. Designed for handover on day one.",
    },
  ],
  cta: { label: "Start qualification", href: "/enterprise#enterprise-deal-entry" },
} as const;

export const industriesSectionIntro = {
  title: "Sectors where we operate",
  description:
    "Delivery is calibrated to sector-specific compliance, procurement, and operational constraints — not generic industry slides.",
} as const;

export const industries: IndustryItem[] = [
  {
    label: "Retail & E-commerce",
    description:
      "Brand websites, promotional campaigns, and omnichannel consistency for consumer-facing businesses.",
  },
  {
    label: "Hospitality & Tourism",
    description:
      "Booking experiences, local presence optimisation, and sustained guest communication across digital channels.",
  },
  {
    label: "Real estate & property",
    description:
      "Listings platforms, inquiry management systems, and marketing collateral for professional brokerages and developers.",
  },
  {
    label: "Healthcare & Clinics",
    description:
      "Clear, trustworthy digital presence with compliance-oriented content and patient communication workflows.",
  },
  {
    label: "Professional services",
    description:
      "Firm websites, thought leadership programmes, and market-facing campaigns suited to advisory, legal, and consulting practices.",
  },
  {
    label: "Government & Semi-government",
    description:
      "Digital infrastructure, public-facing portals, and AI readiness programmes designed for national digital strategy alignment.",
  },
];

export const finalCta = {
  headline: "Define scope. Enter qualification.",
  body: "State the outcome, the systems involved, and the internal owner who signs off. We respond with a structured view of fit, effort, and phasing — or a direct decline if the engagement is not viable.",
  buttonLabel: "Start a scoped engagement",
  href: "/contact",
} as const;
