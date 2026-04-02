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
      "Sites and web applications built for institutional credibility: performance, accessibility, bilingual delivery where needed, and CMS ownership so your team is not hostage to ad-hoc updates.",
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
      "Content strategy and copywriting support (English and Arabic)",
      "SEO foundation including metadata, structured data, and sitemap",
      "CMS setup for ongoing content management",
      "Performance optimisation and accessibility compliance",
      "Post-launch support period with documented handover",
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
          "Testing, deployment, training, and documentation — with a defined support period after go-live.",
      },
    ],
    cta: {
      headline: "Plan your next website with Estio",
      body: "We scope every project against business goals, not template features. Start with a brief conversation about what you need.",
      href: "/contact",
      buttonLabel: "Start a conversation",
    },
    secondaryCta: { href: "/services" },
  },
  "content-campaigns": {
    slug: "content-campaigns",
    title: "Content & Campaign Execution",
    summary:
      "Production calendars, campaign bursts, and channel execution aligned to how you sell — so marketing output stays on-brand and tied to outcomes, not to filling a content quota.",
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
      headline: "Brief us on your next campaign",
      body: "We align creative production to your timelines, budgets, and brand standards. No generic packages — just focused, commercial work.",
      href: "/contact",
      buttonLabel: "Start a conversation",
    },
    secondaryCta: { href: "/services" },
  },
  "ai-creative": {
    slug: "ai-creative",
    title: "AI Creative Services",
    summary:
      "Use AI to increase creative throughput only where your brand, legal, and quality bar allow — with review checkpoints and version control before anything customer-facing ships.",
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
      headline: "Explore AI creative with proper governance",
      body: "We keep humans in the loop where quality, brand integrity, and legal compliance matter. Start with a practical pilot.",
      href: "/contact",
      buttonLabel: "Start a conversation",
    },
    secondaryCta: { href: "/services" },
  },
};

const enterprisePages: Record<string, ServiceDetailContent> = {
  enterprise: {
    slug: "enterprise",
    title: "Enterprise AI & automation",
    summary:
      "Bring one live workflow, one controlled knowledge domain, or one broken handoff. We turn it into a governed pilot with named systems, acceptance criteria, and operational ownership your IT team can inspect.",
    seo: {
      title: "Enterprise AI & Automation — Estio",
      description:
        "Private AI, automation, and integrations for GCC enterprises — control, auditability, and IT-operable delivery from Muscat.",
    },
    breadcrumbParents: [],
    additionalSections: [
      {
        title: "What this means for your organisation",
        paragraphs: [
          "Your data stays within boundaries you define. Access follows role policy. Automation replaces documented manual steps — not informal workarounds that only exist in someone’s inbox.",
          "Estio implements against your IT and compliance reality: staging environments, approval gates, logging where required, and handover artefacts your internal teams can run.",
        ],
      },
      {
        title: "Typical use cases",
        bullets: [
          "Internal assistants that answer from approved policies, product facts, and procedures — not from the public web.",
          "Orchestration between CRM, ticketing, finance, and messaging tools to remove copy-paste and status-chasing.",
          "Document-heavy workflows (onboarding, RFQs, contract prep) structured so humans approve at defined checkpoints.",
          "Internal tools and integrations that connect fragmented systems and reduce manual operational handoffs.",
          "Regional teams working in English and Arabic with consistent answers and traceability.",
        ],
      },
    ],
    capabilities: [
      "Knowledge-grounded assistants with retrieval from your approved corpora — not generic chat on external models without contract.",
      "API-led integrations, queues, and human-in-the-loop steps where judgement is still required.",
      "Identity-aware access: who may ask what, and what may be returned, enforced in configuration — not only in prompts.",
      "Deployment patterns that fit on-premise, private cloud, or vendor constraints you already operate under.",
      "Monitoring, alerting, and failure handling suitable for operations teams — not “best effort” scripts.",
      "Documentation and evidence packs for security review and internal audit.",
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
      headline: "Pick the motion before you send anything",
      body: "One path only: a named workflow and systems, a governed assistant brief, or a narrow pilot ROI case. Mixed or abstract asks get a request to split the brief — or no proposal.",
      href: "/contact",
      buttonLabel: "Go to qualified deal entry",
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
      "Multi-language support (English and Arabic)",
      "Audit logging for compliance and quality monitoring",
    ],
    idealClients: [
      "Support and success teams handling repetitive product questions",
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
      headline: "Scope the assistant — or do not request pricing",
      body: "We need approved corpora, an access owner, and the channels answers surface in. Without those named, there is no schedule or fee we can stand behind.",
      href: "/contact",
      buttonLabel: "Open private AI qualification",
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
      "Operational runbooks for internal support teams",
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
      headline: "Name the workflow, volume, and systems touched",
      body: "Automation proposals need transaction load, failure paths, and an integration inventory — not a diagram of boxes. If you cannot list systems, pause before you enquire.",
      href: "/contact",
      buttonLabel: "Open automation qualification",
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
      title: "Enterprise AI & automation",
      description:
        "Problem: manual work sits between systems, and uncontrolled AI creates risk. Outcome: governed assistants, integrations, and workflow automation that fit your security and operating model.",
      items: [enterprisePages.enterprise!],
    },
  ] as const;
}
