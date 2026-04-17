import type { IndustryItem, ServiceCard } from "./types";

export const homeHero = {
  headline: "Campaign-ready visuals, fast \u2014 without running a studio in-house.",
  subheadline:
    "AI-powered images, short video, and on-brand assets for the GCC. You say what you need; we deliver files you can ship.",
  primaryCta: { label: "Start a project", href: "/contact" },
  secondaryCta: { label: "Get a quick quote", href: "/contact" },
} as const;

/** Hero intent row — links to AI Studio tracks (EN). */
export const homeHeroIntentLinks = [
  { label: "Images", href: "/ai-studio/image-production" },
  { label: "Short video", href: "/ai-studio/video-production" },
  { label: "Brand system", href: "/ai-studio/brand-ai-packs" },
] as const;

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
  title: "Clear process, real delivery",
  description:
    "We scope in writing, review before we ship, and hand over files you own. Based in Muscat; we work with teams across the GCC.",
} as const;

export const trustPoints = [
  {
    title: "Scope before pixels",
    body: "You know what you are getting and when \u2014 before production starts.",
  },
  {
    title: "Brand-reviewed output",
    body: "Nothing goes live until it matches your direction and quality bar.",
  },
  {
    title: "Built for GCC teams",
    body: "Bilingual delivery and messaging that fits how your stakeholders actually decide.",
  },
  {
    title: "One lead, end to end",
    body: "Same person owns your job from brief to final files \u2014 no mystery handoffs.",
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
  headline: "When you need systems, not just assets",
  body: "Beyond campaigns: automation across the apps you already use, and governed internal tools your IT can run. Named systems, written scope, clean handover.",
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
  cta: { label: "Start a project", href: "/contact" },
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
  headline: "Ready when you are",
  body: "Tell us what you are building. We reply within one business day with next steps \u2014 or an honest no if we are not the right fit.",
  buttonLabel: "Start a project",
  href: "/contact",
} as const;
