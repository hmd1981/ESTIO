import type { AppLocale } from "@/lib/i18n/config";
import type { ServiceDetailContent } from "./types";
import {
  enterprisePagesAr,
  servicePagesAr,
} from "./service-pages-ar";

const servicePages: Record<string, ServiceDetailContent> = {
  "web-design-development": {
    slug: "web-design-development",
    title: "Website Design & Development",
    summary:
      "Corporate and launch websites that improve customer trust and modernize your digital presence — fast, bilingual where needed, with CMS handoff so marketing publishes without waiting on developers.",
    seo: {
      title: "Website Design & Development — Estio",
      description:
        "Corporate websites, landing pages, redesigns, and multilingual web experiences — premium delivery from Estio, Muscat, Oman.",
    },
    breadcrumbParents: [{ href: "/services", label: "Services" }],
    additionalSections: [
      {
        title: "Also covers",
        bullets: [
          "UX optimisation to improve navigation, hierarchy, and conversion flow without changing your brand direction unnecessarily.",
          "Website rebuilds and migrations where the current platform is limiting performance, governance, or content operations.",
          "Structured landing experiences for campaigns, launches, and business units that need a focused path to action.",
        ],
      },
    ],
    capabilities: [
      "Corporate and institutional websites",
      "Brand-aligned landing pages and campaign destinations",
      "Full redesigns with structured content migration",
      "Multilingual builds (English and Arabic) with RTL support",
      "Performance, accessibility, and SEO-ready architecture",
      "CMS integration for client-managed content updates",
    ],
    idealClients: [
      "Established companies modernising an outdated or underperforming site",
      "Leadership teams launching a new brand, subsidiary, or venture",
      "Marketing departments that need reliable delivery without agency unpredictability",
      "Organisations expanding into new markets who need a credible digital entry point",
    ],
    deliverables: [
      "Custom-designed, responsive website built on modern technology",
      "Content strategy and copywriting delivery (English and Arabic)",
      "SEO foundation including metadata, structured data, and sitemap",
      "CMS setup for ongoing content management",
      "Performance optimisation and accessibility compliance",
      "Post-launch stabilisation period with documented handover",
    ],
    process: [
      {
        step: "Discovery",
        description:
          "We review your business objectives, audience, and competitive landscape to define the right approach.",
      },
      {
        step: "Architecture & design",
        description:
          "Information architecture, wireframes, and visual design — reviewed and approved before development begins.",
      },
      {
        step: "Development",
        description:
          "Clean, performant code built to specification with regular progress reviews.",
      },
      {
        step: "Launch & handover",
        description:
          "Testing, deployment, training, and documentation — with a defined stabilisation period after go-live.",
      },
    ],
    cta: {
      headline: "Get a website that matches your brand standard",
      body: "Tell us the business outcome, audience, and launch date. We reply with a clear scope, timeline, and project quote — not a generic capabilities deck.",
      href: "/contact",
      buttonLabel: "Get a project quote",
    },
    secondaryCta: { href: "/services" },
  },
  "content-campaigns": {
    slug: "content-campaigns",
    title: "Content & Campaign Execution",
    summary:
      "Launch calendars, ad-ready creative, and channel posts that accelerate campaign rollout and keep brand presentation consistent — Arabic and English when you need both.",
    seo: {
      title: "Content Creation & Campaigns — Estio",
      description:
        "Social content, campaign creative, channel management, and local presence — Estio, Oman & GCC.",
    },
    breadcrumbParents: [{ href: "/services", label: "Services" }],
    additionalSections: [
      {
        title: "Within this scope",
        bullets: [
          "Content strategy: message architecture, editorial direction, and publishing priorities tied to audience and commercial goals.",
          "Campaign execution: asset planning, approvals, production, launch coordination, and reporting across the channels you actually use.",
          "Social content systems: repeatable workflows that keep brand output consistent over time instead of relying on ad-hoc posting.",
        ],
      },
    ],
    capabilities: [
      "Social media content calendars and production",
      "Campaign creative aligned to product launches and seasonal promotions",
      "YouTube, Instagram, LinkedIn, and short-form channel management",
      "Ad creative strategy linked to acquisition and awareness goals",
      "Google Business Profile and local presence optimisation",
      "Brand guideline development and content governance",
    ],
    idealClients: [
      "Retail and hospitality brands with active local and regional audiences",
      "In-house marketing teams that need reliable external creative capacity",
      "Businesses expanding digital attention beyond traditional media",
      "Companies needing consistent brand voice across multiple channels",
    ],
    deliverables: [
      "Monthly content calendar with planned themes and formats",
      "Production-ready creative assets (graphics, copy, video snippets)",
      "Channel management and publishing schedule",
      "Campaign performance reporting with actionable insights",
      "Brand style guide and content governance documentation",
      "Quarterly strategy reviews with recommendations",
    ],
    process: [
      {
        step: "Brand audit",
        description:
          "We assess your current positioning, channels, and competitors to identify opportunities.",
      },
      {
        step: "Strategy & planning",
        description:
          "Content themes, channel priorities, and a production calendar aligned to your business rhythm.",
      },
      {
        step: "Production & publishing",
        description:
          "Ongoing creative production with approval workflows and scheduled publishing.",
      },
      {
        step: "Reporting & optimisation",
        description:
          "Regular performance reviews with data-driven adjustments to maximise impact.",
      },
    ],
    cta: {
      headline: "Run campaigns with predictable creative output",
      body: "Share your commercial goal, channels, and cadence. We propose a production plan with deliverables and pricing — not an open-ended retainer pitch.",
      href: "/contact",
      buttonLabel: "Get a project quote",
    },
    secondaryCta: { href: "/services" },
  },
  "ai-creative": {
    slug: "ai-creative",
    title: "AI Creative Services",
    summary:
      "Campaign imagery and short video at production speed — hero shots, product stills, and social exports reviewed against your brand before anything goes live. Improves presentation quality without multiplying shoot days.",
    seo: {
      title: "AI Creative Services — Estio",
      description:
        "AI-assisted visuals, promotional video, copy, translation, and governed creative assets — Estio, Muscat.",
    },
    breadcrumbParents: [{ href: "/services", label: "Services" }],
    additionalSections: [
      {
        title: "What teams usually use this for",
        bullets: [
          "AI image production for campaign, product, and brand-supporting visuals where traditional production is too slow or expensive.",
          "AI-assisted video production for short-form content, concept variants, and faster iteration cycles.",
          "Brand creative systems: reusable visual logic, templates, and asset structures that keep output consistent as volume grows.",
        ],
      },
    ],
    capabilities: [
      "AI-assisted product and lifestyle imagery",
      "Short promotional video concepts and variants",
      "Caption, headline, and long-form copy generation",
      "Translation, localisation, and rewriting workflows (EN/AR)",
      "Packaged AI-powered asset libraries for marketing teams",
      "Brand compliance review and quality assurance on all AI output",
    ],
    idealClients: [
      "Marketing teams that need volume without sacrificing brand consistency",
      "E-commerce businesses with large product catalogues",
      "Organisations piloting AI adoption with proper governance and approval workflows",
      "Companies seeking cost-effective creative scaling for seasonal campaigns",
    ],
    deliverables: [
      "Production-ready AI-generated creative assets",
      "Brand-reviewed and compliance-checked output",
      "Asset library with organised, tagged, and versioned files",
      "Workflow documentation for ongoing AI-assisted production",
      "Training for your team on supervised AI creative tools",
      "Quality benchmarks and governance guidelines",
    ],
    process: [
      {
        step: "Requirements & guardrails",
        description:
          "We define what AI can and cannot produce for your brand, including legal and quality boundaries.",
      },
      {
        step: "Pilot production",
        description:
          "A focused batch of AI-generated assets reviewed against your brand standards.",
      },
      {
        step: "Scale & refine",
        description:
          "Expand production with continuous quality feedback and workflow optimisation.",
      },
      {
        step: "Handover & governance",
        description:
          "Documentation, training, and ongoing guidelines for your team to maintain quality independently.",
      },
    ],
    cta: {
      headline: "Scale AI creative without losing brand control",
      body: "Tell us what you need produced, where it will run, and your review process. We return a governed production plan and quote — built for GCC campaigns.",
      href: "/contact",
      buttonLabel: "Get a project quote",
    },
    secondaryCta: { href: "/services" },
  },
};

const enterprisePages: Record<string, ServiceDetailContent> = {
  enterprise: {
    slug: "enterprise",
    title: "Workflow automation and governed internal AI for enterprise teams",
    summary:
      "What you get: (1) automated handoffs between the business tools you name in scope, (2) internal Q&A from approved documents with role-based access, (3) operator dashboards where scoped. Every engagement includes a written deliverable list, phased go-live, and runbooks your team can run after handover.",
    seo: {
      title: "Bounded workflow automation & governed retrieval — Estio",
      description:
        "Named-system integrations, retrieval bound to approved corpora, written scope and acceptance gates — phased delivery for IT-operated production. Estio, Muscat.",
    },
    breadcrumbParents: [],
    additionalSections: [
      {
        title: "How this runs inside your controls",
        paragraphs: [
          "Data and answers stay inside corpora and channels you approve. Identity rules and logging posture are configuration, not prompt text. Automation replaces only steps you have already documented — not informal work that lives in individual inboxes.",
          "Delivery follows your change practice: staging, approval gates, evidence for security review, and artefacts (runbooks, escalation paths) your teams operate without Estio in the critical path unless contracted.",
        ],
      },
      {
        title: "Where buyers usually apply it",
        bullets: [
          "Policy, product, and procedure Q&A with citations — grounded retrieval, not open-web chat.",
          "CRM ↔ finance ↔ legal ↔ ticketing flows with visible state and exception queues.",
          "Onboarding, RFQ, and contract-prep paths with fixed human gates and audit trail.",
          "Internal tools that consolidate status across fragmented systems for ops and commercial teams.",
          "English / Arabic service and HR answers under one governance model for content change.",
        ],
      },
    ],
    capabilities: [
      "Retrieval over allow-listed corpora; blocklist and routing for high-risk intents.",
      "REST/queue integrations with retry, idempotency notes, and per-system owner.",
      "Access matrix: role → corpora → channels; logging retention per your record rule.",
      "Deployment topology matched to your hosting constraint (on-prem, VPC, SaaS) as agreed in scope.",
      "Alert routes and exception classes mapped to named on-call or queue owner.",
      "Evidence: design pack, test trace to workflow, configuration export where contract permits.",
    ],
    idealClients: [
      "CIOs and heads of operations who own both outcome and risk — not innovation labs disconnected from production.",
      "Functions drowning in repeatable enquiries where consistency and speed both matter.",
      "Enterprises that have tried consumer AI tools and hit walls on data, access, or audit.",
      "Organisations standardising processes after growth, merger, or regulatory pressure.",
    ],
    deliverables: [
      "Production system or automation within agreed scope — with acceptance criteria signed off.",
      "Integration to named systems and data sources per design — not open-ended “connect everything”.",
      "Access model implemented and reviewed against your policy.",
      "Runbooks, escalation paths, and owner contacts for first-line support.",
      "Training for administrators and end users at the depth you require.",
      "Support model with response expectations stated in writing.",
    ],
    process: [
      {
        step: "Discovery",
        owner: "Business + IT sponsor",
        description:
          "We document current workflows, data classes, approval paths, and constraints. No build until boundaries are explicit.",
        definitionOfDone:
          "Signed scope note listing systems, data classes, owners, and excluded paths.",
      },
      {
        step: "System mapping",
        owner: "Integration lead",
        description:
          "We map integrations, identities, and operational touchpoints so scope reflects reality — not a diagram that only exists in a workshop.",
        definitionOfDone:
          "Integration inventory with interfaces, auth modes, and failure surfaces agreed.",
      },
      {
        step: "Implementation design",
        owner: "Technical lead",
        description:
          "Technical design, security model, and acceptance criteria tied to named systems — with a narrow proof on real data paths where risk is highest.",
        definitionOfDone:
          "Design pack with acceptance tests traceable to named workflows.",
      },
      {
        step: "Controlled rollout",
        owner: "Release owner",
        description:
          "Phased release with monitoring, rollback paths, and training aligned to how your teams actually operate.",
        definitionOfDone:
          "Go-live checklist passed; rollback path exercised or documented.",
      },
      {
        step: "Refinement",
        owner: "Operations + product",
        description:
          "We tune behaviour, monitoring, and documentation using production signals — not assumptions from the kickoff.",
        definitionOfDone:
          "Tuning backlog closed or deferred with recorded trade-offs.",
      },
      {
        step: "Handover & governance",
        owner: "IT / operations",
        description:
          "Runbooks, ownership, and escalation paths so your IT or operations team can own day-two — with Estio available under an agreed SLA if needed.",
        definitionOfDone:
          "Runbooks, access handover, and named contacts for escalation.",
      },
    ],
    cta: {
      headline: "Explore enterprise programmes",
      body: "Three intake templates: workflow scope, assistant scope, pilot ROI. One path per submission. Require: named systems, internal owner for access and go-live.",
      href: "/contact",
      buttonLabel: "Book a consultation",
    },
    secondaryCta: { href: "/enterprise" },
  },
  "private-ai": {
    slug: "private-ai",
    title: "Private AI Assistant",
    summary:
      "An intelligent assistant that answers from your approved documents, products, and policies — not the open internet. Built for accuracy, privacy, and organisational trust.",
    seo: {
      title: "Private AI Assistant — Estio",
      description:
        "Internal AI assistants grounded on approved knowledge, with role-based access policies for your organisation — Estio, Muscat.",
    },
    breadcrumbParents: [{ href: "/enterprise", label: "Enterprise" }],
    capabilities: [
      "Knowledge grounding on internal wikis, PDFs, and product documentation",
      "Role-based access and response policies",
      "Integration with chat, ticketing, or internal portals",
      "Continuous improvement cycles with your subject-matter experts",
      "Multi-language operation (English and Arabic)",
      "Audit logging for compliance and quality monitoring",
    ],
    idealClients: [
      "Operations and delivery teams handling repetitive product and policy queries",
      "Sales organisations needing consistent, accurate technical answers",
      "Legal and compliance teams with clear domain boundaries",
      "HR departments managing policy enquiries across large workforces",
    ],
    deliverables: [
      "Deployed private AI assistant with knowledge base integration",
      "Role-based access and response policy configuration",
      "Platform integration (chat, portal, or ticketing system)",
      "Knowledge base ingestion and curation process",
      "Performance monitoring and quality metrics dashboard",
      "Operational documentation and team training",
    ],
    cta: {
      headline: "Scope a governed internal assistant",
      body: "We need approved corpora, an access owner, and the channels answers surface in. Without those named, there is no schedule or fee we can stand behind.",
      href: "/contact",
      buttonLabel: "Book a consultation",
    },
    secondaryCta: { href: "/enterprise" },
  },
  automation: {
    slug: "automation",
    title: "Workflow Automation",
    summary:
      "Connect the manual steps across your tools so teams spend time on judgement and decisions — not copy-pasting, status-chasing, and data entry.",
    seo: {
      title: "Workflow Automation — Estio",
      description:
        "Process automation across CRMs, operations tools, and business systems with clear documentation — Estio enterprise delivery.",
    },
    breadcrumbParents: [{ href: "/enterprise", label: "Enterprise" }],
    capabilities: [
      "Process mapping with IT and business stakeholders",
      "API-led integrations with human-in-the-loop checkpoints",
      "Monitoring, error handling, and automated alerting",
      "Operational runbooks for internal operations teams",
      "Documentation suitable for IT handover and audit",
      "Scalable architecture for growing transaction volumes",
    ],
    idealClients: [
      "Mid-sized firms outgrowing spreadsheet-based workflows",
      "Back-office teams managing high transaction volumes manually",
      "Companies standardising operations after a merger or expansion",
      "Organisations with fragmented tools and manual data bridges",
    ],
    deliverables: [
      "Automated workflow deployed across your systems",
      "Integration with your CRM, ERP, and operational tools",
      "Error handling, retry logic, and monitoring setup",
      "Operational runbook with escalation procedures",
      "Performance metrics and ROI tracking",
      "Knowledge transfer and team training",
    ],
    process: [
      {
        step: "Process mapping",
        description:
          "We document your current workflows with business and IT stakeholders to identify automation candidates.",
      },
      {
        step: "Prioritisation",
        description:
          "Rank opportunities by ROI, complexity, and risk to build an actionable roadmap.",
      },
      {
        step: "Implementation",
        description:
          "Build, test, and deploy automations with proper error handling and monitoring.",
      },
      {
        step: "Handover & optimisation",
        description:
          "Documentation, training, and ongoing refinement as your processes evolve.",
      },
    ],
    cta: {
      headline: "Automate a workflow you can measure",
      body: "Automation proposals need transaction load, failure paths, and an integration inventory — not a diagram of boxes. If you cannot list systems, pause before you enquire.",
      href: "/contact",
      buttonLabel: "Book a consultation",
    },
    secondaryCta: { href: "/enterprise" },
  },
};

export function getServicePage(
  slug: string,
  locale: AppLocale = "en",
): ServiceDetailContent | undefined {
  if (locale === "ar") {
    return servicePagesAr[slug] ?? servicePages[slug];
  }
  return servicePages[slug];
}

export function getEnterprisePage(
  slug: string,
  locale: AppLocale = "en",
): ServiceDetailContent | undefined {
  if (locale === "ar") {
    return enterprisePagesAr[slug] ?? enterprisePages[slug];
  }
  return enterprisePages[slug];
}

export function getServiceOverviewGroups(locale: AppLocale) {
  const svc = (slug: string) => getServicePage(slug, locale)!;
  const ent = getEnterprisePage("enterprise", locale)!;
  if (locale === "ar") {
    return [
      {
        id: "core-digital",
        title: "المواقع والمنصّات الرقمية",
        description:
          "المشكلة: موقع ضعيف أو غير واضح يضعف الثقة قبل أول اجتماع. النتيجة: منصة أسرع وأوضح وجاهزة لثنائية اللغة، وتدعم الثقة والتحويل وإدارة المحتوى بشكل أفضل.",
        items: [svc("web-design-development")],
      },
      {
        id: "content-campaigns",
        title: "تنفيذ المحتوى والحملات",
        description:
          "المشكلة: حضور سوقي متذبذب يضعف التذكّر ويهدر الميزانية. النتيجة: إنتاج وحملات بإيقاع منضبط، مرتبطة بإطلاقاتكم وأولوياتكم ومؤشراتكم التجارية.",
        items: [svc("content-campaigns")],
      },
      {
        id: "ai-creative",
        title: "خدمات الإبداع بالذكاء الاصطناعي",
        description:
          "المشكلة: الحاجة إلى زيادة حجم الإنتاج دون فقدان السيطرة على الهوية أو الجودة. النتيجة: مخرجات أسرع ضمن ضوابط مراجعة واستخدام وجودة واضحة.",
        items: [svc("ai-creative")],
      },
      {
        id: "enterprise-ai",
        title: "الذكاء المؤسسي والأتمتة",
        description:
          "المشكلة: خطوات يدوية بين الأنظمة، واستخدام ذكاء بلا حوكمة، وأثر تدقيق محدود. النتيجة: مساعدين وتكاملات وسير عمل ضمن نموذج الأمن والاعتماد لديكم.",
        items: [ent],
      },
    ] as const;
  }
  return [
    {
      id: "core-digital",
      title: "Websites & digital platforms",
      description:
        "Problem: a weak or unclear web presence reduces trust before the first conversation. Outcome: a faster, clearer, bilingual-ready platform that supports credibility, conversion, and easier content control.",
      items: [servicePages["web-design-development"]!],
    },
    {
      id: "content-campaigns",
      title: "Content & campaign execution",
      description:
        "Problem: inconsistent market presence weakens recall and wastes media spend. Outcome: structured content and campaign delivery aligned to launches, priorities, and measurable commercial objectives.",
      items: [servicePages["content-campaigns"]!],
    },
    {
      id: "ai-creative",
      title: "AI creative services",
      description:
        "Problem: creative output needs to scale without drifting off-brand or off-process. Outcome: faster production under defined review, usage, and quality controls.",
      items: [servicePages["ai-creative"]!],
    },
    {
      id: "enterprise-ai",
      title: "Operational systems & integrations",
      description:
        "Problem: work spans CRM, ERP, and document stores without a single accountable path. Outcome: deterministic workflows and retrieval services with signed boundaries, logging, and handover your IT team can operate.",
      items: [enterprisePages.enterprise!],
    },
  ] as const;
}
