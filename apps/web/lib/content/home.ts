import type { IndustryItem, ServiceCard } from "./types";

export const homeHero = {
  headline:
    "Campaign-ready AI visuals, websites, and bilingual content for GCC brands.",
  subheadline:
    "Launch assets, social-ready exports, premium sites, and production calendars — for hospitality, retail, healthcare, real estate, and modern enterprises. Scoped in writing from Muscat; you receive formatted files, handoff documentation, and one coordinated lead from brief to delivery.",
  primaryCta: { label: "Get a project quote", href: "/contact" },
  secondaryCta: { label: "Book a consultation", href: "/contact" },
} as const;

/** Hero intent row — links to AI Studio tracks (EN). */
export const homeHeroIntentLinks = [
  { label: "Images", href: "/ai-studio/image-production" },
  { label: "Short video", href: "/ai-studio/video-production" },
  { label: "Brand system", href: "/ai-studio/brand-ai-packs" },
] as const;

export const systemIdentity = {
  heading: "What you receive",
  body: "Estio produces what your team publishes: ad-ready stills and short video, bilingual websites with CMS handoff, campaign content packs, and — when required — automated workflows your operations team can run. Every engagement lists deliverables, review stages, and launch-ready files before production starts.",
  contrast:
    "Not a generalist agency. Not a software reseller. A production partner for brands that need assets in market, not abstract strategy decks.",
} as const;

export const operationalAlignment = {
  kicker: "Who we serve",
  title: "Built for GCC businesses that need speed without sacrificing quality",
  points: [
    "Premium brands in hospitality, retail, real estate, and healthcare launching or refreshing presence",
    "Marketing teams running seasonal campaigns who need faster creative rounds and clearer approvals",
    "Enterprises that need Arabic + English deployment, WhatsApp-friendly coordination, and documented handover",
  ],
  footer:
    "One business day to first reply. Guided scope on call or WhatsApp. Deliverables agreed before we produce — from Muscat across the GCC.",
} as const;

export const guidedIntents = [
  {
    id: "website",
    label: "Launch a premium website with bilingual handoff",
    href: "/services/web-design-development",
  },
  {
    id: "content",
    label: "Ship launch content and channel-ready campaigns",
    href: "/services/content-campaigns",
  },
  {
    id: "creative-ai",
    label: "Get ad-ready AI visuals and short video",
    href: "/services/ai-creative",
  },
  {
    id: "enterprise",
    label: "Reduce manual handoffs between business tools",
    href: "/enterprise",
  },
] as const;

export const trustSectionIntro = {
  title: "Why teams choose Estio",
  description:
    "Collaborative production, clear delivery stages, and files you can deploy the same week — with bilingual support and premium quality control throughout.",
} as const;

export const trustPoints = [
  {
    title: "Deliverables agreed upfront",
    body: "File types, volumes, languages, and review rounds are listed in your quote — so you know exactly what lands in your inbox.",
  },
  {
    title: "Launch-ready files",
    body: "Social exports, web handoff, print-ready where scoped — brand-reviewed before you publish.",
  },
  {
    title: "Built for the GCC",
    body: "Arabic and English assets, regional launch pacing, and coordination that fits how Gulf teams actually approve work.",
  },
  {
    title: "Responsive from Muscat",
    body: "One production lead, reply within one business day — email, call, or WhatsApp when that is faster.",
  },
] as const;

export const servicesSectionIntro = {
  title: "What you can buy from Estio",
  description:
    "Four production lines — each with a written deliverable list and commercial outcome. Pick one for a focused quote, or combine lines when your launch needs website, content, and visuals together.",
} as const;

export const pillarServices: ServiceCard[] = [
  {
    id: "web",
    title: "Premium websites & platforms",
    description:
      "Corporate sites and launch pages with bilingual copy, CMS handoff, and performance built in — so your team updates content and publishes campaigns without developer dependency.",
    href: "/services/web-design-development",
    categoryKey: "WEB_DESIGN_DEVELOPMENT",
  },
  {
    id: "content",
    title: "Content & campaign production",
    description:
      "Editorial calendars, ad-ready creative, and channel posts tied to launches — unified brand voice that accelerates rollout and improves presentation quality.",
    href: "/services/content-campaigns",
    categoryKey: "CONTENT_CAMPAIGNS",
  },
  {
    id: "ai-creative",
    title: "AI visuals & video (governed)",
    description:
      "Hero visuals, product stills, and short promo clips — formatted for Meta, TikTok, print, and site heroes. Faster rounds, consistent look, premium positioning in market.",
    href: "/services/ai-creative",
    categoryKey: "AI_CREATIVE",
  },
  {
    id: "enterprise",
    title: "Automation & enterprise AI",
    description:
      "Fewer manual steps between CRM, finance, and ticketing; internal Q&A from approved documents — with runbooks your team operates after go-live.",
    href: "/enterprise",
    categoryKey: "ENTERPRISE_AI",
  },
];

export const enterpriseHighlight = {
  headline: "When launches need more than creative files",
  body: "Beyond campaigns: connect the business tools you already use, give teams faster answers from approved policies, and hand over documented workflows your operations staff can run. Written scope, phased go-live, clear ownership.",
  bullets: [
    {
      title: "Governed internal AI",
      text: "Answers from approved knowledge, role-based access, and logging your compliance team can review — not open-ended chat experiments.",
    },
    {
      title: "Workflow automation",
      text: "Reliable flows across the tools you already pay for — with visible exceptions, retries, and rollback your operations team controls.",
    },
    {
      title: "IT-ready handover",
      text: "Runbooks, dashboards, and documentation so production ownership stays with your team unless you want managed support.",
    },
  ],
  cta: { label: "Book a consultation", href: "/contact" },
} as const;

export const industriesSectionIntro = {
  title: "Sectors we know well",
  description:
    "We adapt tone, channels, and production pace to how each sector sells and approves work in the GCC.",
} as const;

export const industries: IndustryItem[] = [
  {
    label: "Retail & E-commerce",
    description:
      "Brand sites, product visuals, and campaigns that convert — online and in-store.",
  },
  {
    label: "Hospitality & Tourism",
    description:
      "Hero imagery, short video, and digital presence that match a premium guest experience.",
  },
  {
    label: "Real estate & property",
    description:
      "Listing visuals, launch campaigns, and credibility-first digital assets for developers and brokerages.",
  },
  {
    label: "Healthcare & Clinics",
    description:
      "Trustworthy bilingual presence, compliant messaging, and patient-facing content workflows.",
  },
  {
    label: "Professional services",
    description:
      "Institutional websites and thought-leadership content for firms that sell on reputation.",
  },
  {
    label: "Government & Semi-government",
    description:
      "Digital programmes and content aligned to public-sector governance and bilingual requirements.",
  },
];

export const finalCta = {
  headline: "Tell us what you are launching",
  body: "Share the deliverables you need, your timeline, and where assets will run. We reply within one business day with a scoped quote, sample direction, or an honest redirect if we are not the right fit.",
  buttonLabel: "Get a project quote",
  href: "/contact",
} as const;
