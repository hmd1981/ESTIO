import type { IndustryItem, ServiceCard } from "./types";

export const homeHero = {
  headline:
    "Digital presence. Commercial growth. Intelligent automation.",
  subheadline:
    "Estio is a premium digital services and applied AI company based in Muscat, Oman. We help organisations across the GCC build exceptional online presence, reach their markets with precision, and transform operations through responsible AI — with clarity, ownership, and measurable outcomes.",
  primaryCta: { label: "Start a conversation", href: "/contact" },
  secondaryCta: { label: "Explore our services", href: "/services" },
} as const;

export const guidedIntents = [
  {
    id: "website",
    label: "I need a website or digital presence",
    href: "/services/web-design-development",
  },
  {
    id: "content",
    label: "I need content and marketing campaigns",
    href: "/services/content-campaigns",
  },
  {
    id: "creative-ai",
    label: "I want AI-powered creative production",
    href: "/services/ai-creative",
  },
  {
    id: "enterprise",
    label: "I need enterprise AI or automation",
    href: "/enterprise",
  },
] as const;

export const trustSectionIntro = {
  title: "Why organisations choose Estio",
  description:
    "We deliver with the standards our clients would expect from an internal team: direct communication, documented delivery, and outcomes you can present to stakeholders with confidence.",
} as const;

export const trustPoints = [
  {
    title: "Clear scope from the start",
    body: "We define what gets delivered, how it works, and what success looks like before execution starts.",
  },
  {
    title: "Applied AI, not empty hype",
    body: "We use AI where it improves workflow, quality, speed, and decision-making, not as presentation theatre.",
  },
  {
    title: "Built for GCC business context",
    body: "Our work reflects regional expectations around quality, language, communication, and commercial credibility.",
  },
  {
    title: "One accountable partner",
    body: "You work with one team that owns the outcome end to end, with clear accountability throughout delivery.",
  },
] as const;

export const servicesSectionIntro = {
  title: "What we deliver",
  description:
    "Four integrated service lines — often combined into a single engagement — covering how you present your brand, how you reach your market, and how you scale operations with intelligence.",
} as const;

export const pillarServices: ServiceCard[] = [
  {
    id: "web",
    title: "Website design & development",
    description:
      "Corporate websites, commercial web properties, and landing experiences — built for performance, accessibility, and multilingual audiences across Oman and the GCC.",
    href: "/services/web-design-development",
    categoryKey: "WEB_DESIGN_DEVELOPMENT",
  },
  {
    id: "content",
    title: "Content creation & campaigns",
    description:
      "Strategic content calendars, campaign creative, and channel management that keep your brand visible, consistent, and commercially persuasive.",
    href: "/services/content-campaigns",
    categoryKey: "CONTENT_CAMPAIGNS",
  },
  {
    id: "ai-creative",
    title: "AI creative services",
    description:
      "Governed AI for imagery, video, copy, and localisation — reviewed against brand guidelines and legal requirements before anything goes live.",
    href: "/services/ai-creative",
    categoryKey: "AI_CREATIVE",
  },
  {
    id: "enterprise",
    title: "Enterprise AI solutions",
    description:
      "Private AI assistants, workflow automation, and bespoke integrations for organisations that need more than consumer-grade software.",
    href: "/enterprise",
    categoryKey: "ENTERPRISE_AI",
  },
];

export const enterpriseHighlight = {
  headline: "We build operational systems — not just websites",
  body: "Digital delivery is only the surface. Underneath, we engineer private AI, automation, and internal tools that run inside your security model, approval paths, and operational reality.",
  bullets: [
    {
      title: "Private AI systems",
      text: "Assistants and retrieval grounded on corpora you approve — with identity-aware access, logging where required, and deployment that fits your IT constraints.",
    },
    {
      title: "Workflow automation",
      text: "Documented flows across CRM, ticketing, finance, and messaging — with monitoring, error handling, and evidence your operations teams can audit.",
    },
    {
      title: "Internal systems & dashboards",
      text: "Tools and views your teams use daily: clear ownership, handover artefacts, and runbooks so internal staff can sustain what we ship.",
    },
  ],
  cta: { label: "Start a conversation", href: "/contact" },
} as const;

export const industriesSectionIntro = {
  title: "Industries we serve",
  description:
    "We work with organisations across diverse sectors, tailoring our approach to each industry's regulatory environment, competitive dynamics, and operational reality.",
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
      "Digital transformation support, public-facing portals, and AI readiness programmes aligned with national digital strategies.",
  },
];

export const finalCta = {
  headline: "Ready to start?",
  body: "Tell us about your objectives, timeline, and key stakeholders. We respond with a clear, tailored proposal — not a generic brochure.",
  buttonLabel: "Contact Estio",
  href: "/contact",
} as const;
