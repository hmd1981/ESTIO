import type { AppLocale } from "@/lib/i18n/config";

/** Shared UI chrome and static marketing pages (EN/AR). CMS still overrides home JSON. */
export type MarketingMessages = {
  skipToMain: string;
  breadcrumbAria: string;
  breadcrumbHome: string;
  serviceDetail: {
    allServices: string;
    viewAllServices: string;
    capabilities: string;
    idealClients: string;
    whatYouReceive: string;
    deliverablesIntro: string;
    howWeWork: string;
    howWeWorkIntro: string;
    definitionOfDoneLabel: string;
  };
  guidedSectionKicker: string;
  homeMetadataTitleSuffix: string;
  about: {
    seoTitle: string;
    seoDescription: string;
    kicker: string;
    h1: string;
    introP1: string;
    introP2: string;
    principlesKicker: string;
    principlesH2: string;
    values: { title: string; body: string }[];
    capabilitiesKicker: string;
    capabilitiesH2: string;
    capabilitiesLead: string;
    capabilities: { title: string; body: string }[];
    positionKicker: string;
    positionH2: string;
    positionBody: string;
    sidebar: { title: string; body: string }[];
    ctaH2: string;
    ctaBody: string;
    ctaButton: string;
  };
  contact: {
    seoTitle: string;
    seoDescription: string;
    kicker: string;
    h1: string;
    lead: string;
    formH2: string;
    formLead: string;
    asideDirectH3: string;
    whatsapp: string;
    officeH3: string;
    nextH3: string;
    nextSteps: string[];
    /** iframe title for embedded map */
    mapIframeTitle: string;
    /** External Google Maps link under office address */
    openInGoogleMaps: string;
  };
  contactForm: {
    serviceInterestOptions: { value: string; label: string }[];
    successTitle: string;
    successBody: string;
    submitAnother: string;
    name: string;
    namePh: string;
    email: string;
    emailPh: string;
    phone: string;
    phonePh: string;
    company: string;
    companyPh: string;
    interest: string;
    interestPlaceholder: string;
    message: string;
    messagePh: string;
    error: string;
    sending: string;
    submit: string;
    /** Shown above submit when an intake intent is pre-selected. */
    qualificationHeading: string;
    qualificationIntro: string;
    qualificationRequiredHeading: string;
    qualificationOptionalHeading: string;
    qualificationByIntent: Partial<
      Record<
        string,
        { required: string[]; optional: string[] }
      >
    >;
    /** Shown when `source === "INTAKE"` (enterprise deal cards). */
    intakeProcessEyebrow: string;
    intakeProcessTitle: string;
    intakeProcessBody: string;
    enterprisePreSubmitEyebrow: string;
    enterprisePreSubmitTitle: string;
    enterprisePreSubmitMustHaveTitle: string;
    enterprisePreSubmitMustHave: string[];
    enterprisePreSubmitNextTitle: string;
    enterprisePreSubmitNext: string[];
    structuredEngagementBeforeSubmit: string;
    submitEnterpriseDeal: string;
  };
  servicesListing: {
    seoTitle: string;
    seoDescription: string;
    kicker: string;
    h1: string;
    lead: string;
    lead2?: string;
    /** Bridge between hero and practice grid (deal-entry narrative). */
    practicesSectionKicker: string;
    practicesSectionLead: string;
    learnMore: string;
    bottomH2: string;
    bottomBody: string;
    bottomCta: string;
  };
  faq: {
    seoTitle: string;
    seoDescription: string;
    kicker: string;
    h1: string;
    lead: string;
    items: { title: string; body: string }[];
  };
  enterpriseAppendix: {
    title: string;
    deepLinks: { label: string; description: string }[];
  };
  /** Homepage enterprise bridge (systems positioning + link to /enterprise). */
  homeEnterpriseBridge: {
    eyebrow: string;
    /** Must match site-wide CTA taxonomy (e.g. Review programme paths). */
    secondaryCtaLabel: string;
  };
  /** Defaults for /enterprise landing (overridable via enterprise CMS section keys). */
  enterpriseLanding: {
    heroKicker: string;
    /** Optional line under kicker — who the programme is for (CMS `enterpriseAudience` overrides). */
    heroAudienceLine: string;
    /** Secondary hero CTA — scrolls to programmes */
    secondaryCtaLabel: string;
    practiceSectionTitle: string;
    practiceLead: string;
    practiceBlocks: { title: string; body: string }[];
    /** Illustrative integration map — actual scope is client inventory (SOW). */
    integrationSurfacesTitle: string;
    integrationSurfacesIntro: string;
    integrationSurfacesGroups: { heading: string; examples: string }[];
    integrationNamedSystemsTitle: string;
    integrationNamedSystems: { category: string; examples: string }[];
    integrationNamedSystemsFooter: string;
    proofSectionTitle: string;
    proofItems: {
      title: string;
      body: string;
      evidenceType?: "case" | "internal" | "simulation" | "reference_architecture";
      verificationLevel?: "internal" | "observed" | "repeatable" | "contractual";
      verificationNote?: string;
    }[];
    evidenceLabels: Record<
      "case" | "internal" | "simulation" | "reference_architecture",
      string
    >;
    verificationLabels: Record<
      "internal" | "observed" | "repeatable" | "contractual",
      string
    >;
    /** Sticky bar + decision enforcement (CMS `enterpriseDecisionSummary` overrides). */
    decisionSummaryForTeams: string;
    decisionSummaryRequires: string;
    decisionSummaryDelivers: string;
    caseStudiesTitle: string;
    caseStudiesLead: string;
    caseStudyLabels: {
      situation: string;
      systems: string;
      proof: string;
      commercial: string;
      problem: string;
      systemBuilt: string;
      outcome: string;
      metrics: string;
      decisionImpact: string;
    };
    caseStudies: {
      kicker: string;
      title: string;
      situation: string;
      systems: string;
      proof: string;
      commercial: string;
      decisionImpact: string;
    }[];
    fitSectionTitle: string;
    fitSectionLead: string;
    fitColumnTitle: string;
    nonFitColumnTitle: string;
    fitBullets: string[];
    nonFitBullets: string[];
    diagramSectionTitle: string;
    diagramLead: string;
    diagrams: {
      title: string;
      columns: { label: string; body: string }[];
      footer: string;
      diagramType?: "architecture" | "flow" | "integration";
      explanation?: string;
    }[];
    roiSectionTitle: string;
    roiLead: string;
    roiFormulaLabel: string;
    roiFormula: string;
    roiInputsTitle: string;
    roiInputs: string[];
    roiCards: { title: string; body: string }[];
    roiReducedTitle: string;
    roiAutomatedTitle: string;
    roiGainedTitle: string;
    roiReduced: string[];
    roiAutomated: string[];
    roiGained: string[];
    roiInvestmentScope: string;
    /** Heading above qualitative investment scope + variables (no fabricated numbers). */
    roiInvestmentProfileTitle: string;
    roiInvestmentVariables: string[];
    dealEntryTitle: string;
    dealEntryLead: string;
    dealEntryChecklistLabel: string;
    qualificationRequiredLabel: string;
    qualificationOptionalLabel: string;
    scopedEngagementCtaEyebrow: string;
    executionTrace: {
      title: string;
      happyPath: { label: string; steps: string[] };
      failurePath: { label: string; steps: string[] };
      footer: string;
    };
    diagramTypeLabels: Record<"architecture" | "flow" | "integration", string>;
    dealEntryCards: {
      title: string;
      body: string;
      checklist: string[];
      ctaLabel: string;
      messageTemplate: string;
      intent: string;
      qualificationRequired: string[];
      qualificationOptional: string[];
    }[];
    mediaPlaceholder: string;
    finalCtaEyebrow: string;
    /** Link affordance on programme cards */
    programCardContinue: string;
    /** Pull-quotes and bridges — guided sales conversation (EN/AR). */
    salesMicro: {
      afterHero: string;
      afterPractice: string;
      afterPrograms: string;
      beforeProof: string;
      afterProof: string;
      afterCases: string;
      afterFit: string;
      afterRoi: string;
      afterDiagrams: string;
      beforeDeliverables: string;
      processObjection: string;
    };
    commitmentPanel: {
      title: string;
      body: string;
    };
    preQualification: {
      eyebrow: string;
      mustHaveTitle: string;
      mustHave: string[];
      nextTitle: string;
      next: string[];
      notAcceptedTitle: string;
      notAccepted: string[];
    };
    dealPathMicro: {
      ENTERPRISE_AI: { focus: string; expectation: string };
      AUTOMATION: { focus: string; expectation: string };
      PLATFORM_BUILD: { focus: string; expectation: string };
    };
    structuredEngagementLine: string;
    closingPressure: {
      title: string;
      body: string;
    };
    scopeControl: string;
  };
  footerContact: {
    web: string;
    phone: string;
    email: string;
  };
  navPrimaryAria: string;
  /** Logo link aria-label; include literal `{name}` for brand display name */
  brandHomeAria: string;
  theme: {
    switchToLight: string;
    switchToDark: string;
  };
  mobileNav: {
    navAria: string;
    openMenu: string;
    closeMenu: string;
    closeOverlay: string;
  };
};

const en: MarketingMessages = {
  skipToMain: "Skip to main content",
  breadcrumbAria: "Breadcrumb",
  breadcrumbHome: "Home",
  serviceDetail: {
    allServices: "All services",
    viewAllServices: "View all services",
    capabilities: "Capabilities",
    idealClients: "Ideal clients & use cases",
    whatYouReceive: "What you receive",
    deliverablesIntro:
      "Every engagement specifies contractual deliverables — documented, reviewed against acceptance criteria, and handed over with operational artefacts.",
    howWeWork: "Execution model",
    howWeWorkIntro:
      "Phased delivery with defined gates, written acceptance criteria, and rollback paths at each stage.",
    definitionOfDoneLabel: "Definition of done",
  },
  guidedSectionKicker: "What are you launching?",
  homeMetadataTitleSuffix:
    "Launch-ready AI visuals, websites & campaign content for GCC brands | Muscat",
  about: {
    seoTitle: "About",
    seoDescription:
      "Estio — premium AI-powered visual production and digital execution for GCC brands, from Muscat: governed creative output, websites, content systems, and enterprise automation under written scope.",
    kicker: "About Estio",
    h1: "Premium production for GCC brands — visuals, websites, content, and automation when you need it",
    introP1:
      "Estio is a Muscat-based production firm: campaign imagery, short-form video, bilingual websites with CMS handoff, launch content calendars, and — when your brief requires it — workflow automation your operations team can run. You receive written deliverable lists, review stages, and launch-ready files. We document decisions and ship work leadership and IT can approve — not experiments.",
    introP2:
      "We do not pitch trends. We define deliverables, accept accountability, and operate against the criteria you set when the engagement started. If we are not the right fit, we say so before you spend.",
    principlesKicker: "Delivery practices",
    principlesH2: "Four production lines — one delivery standard",
    values: [
      {
        title: "Digital platforms and experiences",
        body: "Corporate sites, product and campaign destinations, and web applications where performance, accessibility, and bilingual presentation are baseline requirements — not optional polish.",
      },
      {
        title: "Content and channel programmes",
        body: "Calendars, production, and publishing aligned to how your business actually sells and operates — so marketing output stays consistent with commercial reality.",
      },
      {
        title: "Governed AI creative",
        body: "Accelerated imagery, copy, and video where AI is allowed only within rules you set; human review before anything customer-facing goes live.",
      },
      {
        title: "Workflow automation & governed retrieval",
        body: "Deterministic integrations across named systems; retrieval services bound to allow-listed corpora; identity and logging enforced in configuration for IT-operated production.",
      },
    ],
    capabilitiesKicker: "Operating model",
    capabilitiesH2: "How we run your project",
    capabilitiesLead:
      "Whether you are launching a site or automating a workflow: one lead, written deliverables, visible checkpoints, and no silent scope creep.",
    capabilities: [
      {
        title: "Accountable ownership",
        body: "A single lead is responsible end-to-end. You are not passed through layers of account managers who cannot answer technical or delivery questions.",
      },
      {
        title: "Scope and change control",
        body: "Deliverables, timeline, and dependencies are agreed before build. Changes go through an explicit decision, with impact on time and cost stated in writing.",
      },
      {
        title: "Evidence over updates",
        body: "You receive regular checkpoints with artefacts — demos, documents, test results — not vague status reports.",
      },
      {
        title: "Deliberate capacity",
        body: "We limit concurrent engagements so each project gets senior attention and predictable response times.",
      },
    ],
    positionKicker: "Operating position",
    positionH2: "Designed for GCC procurement and operating reality",
    positionBody:
      "We work from Qurum with GCC time zones, business culture, and bilingual stakeholder communication in mind. Proximity matters when decisions need a same-day conversation or an on-site session with your IT and compliance teams.",
    sidebar: [
      {
        title: "Decision-maker fluency",
        body: "We speak to CIOs, CMOs, and owners in the language of risk, ROI, and operational fit — not channel metrics in isolation.",
      },
      {
        title: "Arabic and English as working languages",
        body: "Copy, UI, and workshops are produced natively in the language of the audience, including RTL product and web delivery where required.",
      },
      {
        title: "Long-term fit",
        body: "We optimise for maintainable systems and documented handover so you are not locked to us for every small change — unless you want an ongoing run arrangement.",
      },
      {
        title: "What we don’t do",
        body: "We don’t sell retainers filled with unspecified hours, promise AI without data and governance clarity, or take on work we cannot staff to our own standard. If we are not the right fit, we say so early.",
      },
    ],
    ctaH2: "Ready for a concrete next step?",
    ctaBody:
      "Share the outcome, constraints, and systems in play. We respond with a clear view of fit, effort, and phasing — or an honest redirect if we are not the right firm.",
    ctaButton: "Book a consultation",
  },
  contact: {
    seoTitle: "Contact",
    seoDescription:
      "Tell Estio what you need — AI visuals, video, brand packs, websites, or automation. Muscat-based team; written reply within one business day.",
    kicker: "Contact",
    h1: "Talk to Estio",
    lead:
      "Tell us what you are launching and how to reach you. We reply within one business day — with a clear quote path, a short call, or WhatsApp if that is faster for you.",
    formH2: "How we can help",
    formLead:
      "A few lines are enough: what you are launching, deliverables you need, deadline, and any brand links. We reply with a clear scope list or focused questions — no endless back-and-forth.",
    asideDirectH3: "Prefer phone or WhatsApp?",
    whatsapp: "WhatsApp",
    officeH3: "Office",
    nextH3: "What happens after you send this",
    nextSteps: [
      "Within one business day: a reply by email, call, or WhatsApp — whichever you prefer.",
      "We confirm fit honestly. If we are not right, we say so early.",
      "If we proceed: a written deliverable list, timeline, and project quote — so you know what you are buying.",
    ],
    mapIframeTitle: "Map",
    openInGoogleMaps: "Open in Google Maps",
  },
  contactForm: {
    serviceInterestOptions: [
      { value: "WEB_DESIGN_DEVELOPMENT", label: "Website design & development" },
      { value: "CONTENT_CAMPAIGNS", label: "Content creation & campaigns" },
      { value: "AI_CREATIVE", label: "AI creative services" },
      { value: "AI_STUDIO", label: "AI Studio \u2014 image, video, or brand packs" },
      { value: "ENTERPRISE_AI", label: "Governed retrieval & internal knowledge surfaces" },
      { value: "AUTOMATION", label: "Workflow automation & integrations" },
      { value: "PLATFORM_BUILD", label: "Platform build & technical programme" },
      { value: "UNSURE", label: "Not sure yet" },
    ],
    successTitle: "Thanks — we have your message",
    successBody:
      "We will review what you sent and reply within one business day. If something is urgent, you can also reach us by phone or WhatsApp.",
    submitAnother: "Send another message",
    name: "Full name",
    namePh: "Your name",
    email: "Business email",
    emailPh: "you@company.com",
    phone: "Phone (optional)",
    phonePh: "+968 …",
    company: "Company / organisation",
    companyPh: "Organisation name",
    interest: "Area of interest",
    interestPlaceholder: "Select a service area",
    message: "Anything else we should know? (optional)",
    messagePh:
      "Goals, deadlines, channels, brand links, or questions — even bullet points are fine.",
    error:
      "Something went wrong. Please try again or write to",
    sending: "Sending...",
    submit: "Send enquiry",
    qualificationHeading: "Nice to have",
    qualificationIntro:
      "Share what you know today — launch date, channels, languages. We will turn it into a deliverable list and quote; we only ask for gaps that affect pricing.",
    qualificationRequiredHeading: "Helps us quote faster",
    qualificationOptionalHeading: "Extra detail",
    qualificationByIntent: {
      AUTOMATION: {
        required: [
          "Process name and business owner (named).",
          "Monthly volume or ticket count.",
          "Systems touched (read/write).",
        ],
        optional: ["Exception rate or delay today.", "Regulator or security constraints."],
      },
      ENTERPRISE_AI: {
        required: [
          "Approved knowledge sources (or explicit none yet).",
          "Access / identity owner.",
          "Target channels (chat, portal, ticket).",
        ],
        optional: ["Blocked question categories.", "Bilingual or review policy."],
      },
      PLATFORM_BUILD: {
        required: [
          "Sponsor who can sign off pilot success.",
          "Baseline delay or effort today.",
          "Hard dates or integration constraints.",
        ],
        optional: ["Prior attempt and why it stalled.", "Expansion criteria."],
      },
      AI_STUDIO: {
        required: [
          "Image, short video, or brand pack — what are you leaning toward?",
          "Rough volume (e.g. number of shots or clips).",
          "Any brand links, mood refs, or a short note on look and feel.",
        ],
        optional: [
          "Where it will run (web, social, print).",
          "When you need it.",
        ],
      },
    },
    intakeProcessEyebrow: "How we handle enquiries",
    intakeProcessTitle: "Clear, structured follow-up",
    intakeProcessBody:
      "We route each enquiry to the right production team and respond with focused questions or a scoped quote. One missing detail gets one direct ask — not weeks of discovery.",
    enterprisePreSubmitEyebrow: "Before you submit",
    enterprisePreSubmitTitle: "Enterprise enquiries — what speeds up our reply",
    enterprisePreSubmitMustHaveTitle: "Helpful to have ready",
    enterprisePreSubmitMustHave: [
      "Named systems in scope — not “our stack” in the abstract.",
      "An internal owner who can answer access and integration questions within one business week.",
      "Expectation that first value is pilot-shaped: phased, measured, then scaled.",
    ],
    enterprisePreSubmitNextTitle: "After you submit",
    enterprisePreSubmitNext: [
      "Written reply with path-specific questions — or a polite no.",
      "No commercial proposal until scope boundaries are explicit.",
      "Terms only after phase-one acceptance tests are agreed in writing.",
    ],
    structuredEngagementBeforeSubmit:
      "Your submission starts a structured conversation. The clearer the scope, the faster and more accurate our reply.",
    submitEnterpriseDeal: "Book a consultation",
  },
  servicesListing: {
    seoTitle: "Services",
    seoDescription:
      "Four delivery practices: platforms, content operations, governed AI creative, and enterprise automation — scoped engagement from Estio, Muscat.",
    kicker: "Services",
    h1: "What Estio delivers for GCC brands",
    lead:
      "Four production lines — each with a deliverable list you can approve before work starts: websites with handoff, launch content, AI visuals and video, and business workflow automation.",
    lead2:
      "Hospitality, retail, healthcare, and real estate teams use Estio to accelerate campaign rollout, unify brand presentation, and deploy Arabic + English assets from Muscat.",
    practicesSectionKicker: "Choose a service line",
    practicesSectionLead:
      "Open the line that matches your goal. Not sure? Tell us the outcome — we will point you to the right team.",
    learnMore: "View service →",
    bottomH2: "Not sure which service fits?",
    bottomBody:
      "Describe the business outcome, timeline, and channels. We reply with the right path and a project quote — or an honest referral if we are not the fit.",
    bottomCta: "Get a project quote",
  },
  faq: {
    seoTitle: "FAQ",
    seoDescription:
      "How Estio prices, starts projects, delivers AI and automation, and what we need from clients — direct answers.",
    kicker: "FAQ",
    h1: "Straight answers",
    lead: "What we are often asked before an engagement begins. Unusual situations belong in qualification — use the contact intake with specifics; we do not answer bespoke procurement questions here.",
    items: [
      {
        title: "How does pricing work?",
        body: "We price from scope: deliverables, timeline, and risk. You receive a fixed proposal for defined work, or a phased plan with a clear cap per phase. We do not sell open-ended “hours buckets” without a work breakdown. Internal automation and governed retrieval work is typically phased: assessment, narrow pilot on one workflow, then build.",
      },
      {
        title: "What timelines should we expect?",
        body: "A focused marketing site often runs weeks to a few months depending on content readiness and approvals. Content programmes are ongoing by design. Enterprise work depends on integration complexity and your IT change windows — we quote ranges after discovery, not generic promises.",
      },
      {
        title: "How do projects start?",
        body: "Enquiry, a short alignment call, then a written proposal. Work begins after signed agreement and, where needed, access to your brand assets, stakeholders, and technical contacts. No work starts on handshake alone.",
      },
      {
        title: "What do you need from us as the client?",
        body: "A single owner on your side who can decide or escalate. Timely access to subject-matter experts for enterprise work. Brand and legal sign-off paths for public-facing deliverables. For automation: documentation or walkthroughs of current processes — accuracy here determines success.",
      },
      {
        title: "How do your AI services actually work?",
        body: "For creative AI, we define what may be generated, what must be human-reviewed, and what is out of bounds. For internal retrieval systems, we ground responses on knowledge you approve, enforce access by role, and log usage where required. We do not train public models on your confidential data without an explicit agreement.",
      },
      {
        title: "Do you work on-site?",
        body: "When the project requires it — workshops, discovery with IT, or launch operations. Most delivery is remote with structured checkpoints. We are in Muscat for regional clients who need face-to-face sessions.",
      },
      {
        title: "Who owns the work product?",
        body: "As agreed in the contract: typically you own paid-for deliverables and we retain no rights beyond portfolio reference unless you opt out. Source code and automation configurations are handed over with documentation unless a managed service is contracted separately.",
      },
      {
        title: "What happens after launch?",
        body: "We define post-launch stabilisation periods on web projects. For automation and governed retrieval deployments, we align run-state SLAs to your operational requirements. Ad-hoc requests are scoped as small engagements — not unlimited email access.",
      },
      {
        title: "Do you subcontract everything?",
        body: "No. Estio leads every engagement with in-house accountability. We use specialist resources only where disclosed and where it serves the outcome — never as an undisclosed bait-and-switch.",
      },
      {
        title: "Who writes the Resources guides?",
        body: "Estio’s delivery team in Muscat — web, campaign production, AI Studio, and enterprise scoping. A second person reads each guide before it goes live. We do not publish thin translations or unreviewed machine drafts. Editorial standards, including how we treat advertising on content pages, are published at /resources/editorial-standards.",
      },
      {
        title: "How do you use cookies and ads?",
        body: "We use essential cookies for site appearance, Google tags for measurement, and — only on pages with substantial publisher content — Google AdSense. Privacy, terms, and cookie policies are linked in the footer. You can opt out of personalised Google ads via Google Ads Settings. Ads do not run on checkout, generation tools, or legal pages.",
      },
    ],
  },
  footerContact: {
    web: "Web",
    phone: "Phone",
    email: "Email",
  },
  navPrimaryAria: "Primary",
  brandHomeAria: "{name} home",
  theme: {
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
  },
  mobileNav: {
    navAria: "Mobile navigation",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    closeOverlay: "Close menu",
  },
  enterpriseAppendix: {
    title: "Delivery tracks",
    deepLinks: [
      {
        label: "Private AI assistant",
        description:
          "Answers from your approved knowledge base, with role-based access, logging, and integration into the channels your teams already use.",
      },
      {
        label: "Workflow automation",
        description:
          "End-to-end flows across CRM, operations, and messaging — with error handling, monitoring, and runbooks your IT team can own.",
      },
    ],
  },
  homeEnterpriseBridge: {
    eyebrow: "Enterprise & automation",
    secondaryCtaLabel: "Explore enterprise",
  },
  enterpriseLanding: {
    heroKicker: "Enterprise systems & governed AI",
    heroAudienceLine:
      "For leadership teams reducing manual handoffs, speeding internal answers from approved documents, and launching with runbooks their staff can run — scoped in writing, delivered in phases.",
    secondaryCtaLabel: "View programmes",
    practiceSectionTitle: "1. System under delivery",
    practiceLead:
      "Object types: (A) deterministic workflow across a closed integration inventory; (B) retrieval service bound to allow-listed corpora and identity configuration; (C) internal operator tools where scoped. Each engagement specifies: integration list (R/W), data classes, phase acceptance tests, rollback, L1 handover package.",
    practiceBlocks: [
      {
        title: "Retrieval + access control",
        body:
          "Corpus allow-list; role → source mapping; blocklist intents; channel placement; log retention aligned to your record rule — all configuration, not prompt text alone.",
      },
      {
        title: "Integration + orchestration",
        body:
          "Read/write contracts per system; retry and idempotency where required; exception type and owner field on every failed step; documented rollback.",
      },
      {
        title: "Handover",
        body:
          "Runbook, escalation matrix, monitoring dashboard or alert route, admin UI for corpus or workflow tuning — owned by your ops unless SLA states otherwise.",
      },
    ],
    integrationSurfacesTitle: "1.1 Illustrative integration inventory (non-exhaustive)",
    integrationSurfacesIntro:
      "Contractual scope uses your CMDB / application list. The table below names common classes only — for reviewer orientation, not as implied warranty of vendor support.",
    integrationSurfacesGroups: [
      {
        heading: "Commercial & CRM",
        examples:
          "Opportunity / account objects; CPQ outputs; contract metadata; e-sign callback endpoints; case / ticket creation from workflow events.",
      },
      {
        heading: "ERP & finance",
        examples:
          "GL / cost-centre posting interfaces; AP/AR approval APIs; budget-holder workflow; vendor / customer master read paths.",
      },
      {
        heading: "Identity, documents, operations rail",
        examples:
          "OIDC / SAML IdP; HRIS role feeds where in scope; SharePoint / S3 / document DB with ACL model; ServiceNow / Jira / internal chat as notification or human-gate surfaces.",
      },
    ],
    integrationNamedSystemsTitle: "Typical systems in scope",
    integrationNamedSystems: [
      { category: "CRM", examples: "Salesforce, HubSpot, Microsoft Dynamics, custom CRM" },
      { category: "Finance", examples: "SAP, Oracle ERP, NetSuite, internal ERP / GL" },
      { category: "Internal", examples: "REST APIs, internal dashboards, document management systems, ticketing (ServiceNow, Jira)" },
    ],
    integrationNamedSystemsFooter: "Exact systems are defined during qualification. We scope against your application inventory — not a vendor compatibility list.",
    proofSectionTitle: "2. Pre-build artefacts (exist before capital commit)",
    evidenceLabels: {
      case: "Control artefact",
      internal: "Operating measurement",
      simulation: "Workflow / load model",
      reference_architecture: "System boundary",
    },
    verificationLabels: {
      internal: "Internal control",
      observed: "Observed at cutover",
      repeatable: "Repeatable path",
      contractual: "In contract / SOW",
    },
    decisionSummaryForTeams:
      "CIO / COO / Head of Ops — accountable for production outcome, risk, and run cost; not a lab without IT sign-off.",
    decisionSummaryRequires:
      "Sponsor with budget or escalation rights. Systems + data classes in scope in writing. Security and change constraints stated. Phased gates with signed pass/fail per phase.",
    decisionSummaryDelivers:
      "Deployable subsystem: closed integration inventory, signed access matrix, logging retention, runbooks, queryable trace — operable by your staff per handover.",
    proofItems: [
      {
        title: "Scope map precedes build budget",
        body:
          "Metric: workflow step → interface → data class → owner table complete; SOW references same row set.",
        evidenceType: "reference_architecture",
        verificationLevel: "contractual",
        verificationNote: "Discovery pack → SOW.",
      },
      {
        title: "Access model signed before live traffic",
        body:
          "Metric: one document — invoke rights, corpora, blocklists, log retention — approved by security or named delegate.",
        evidenceType: "internal",
        verificationLevel: "contractual",
      },
      {
        title: "Cutover gate",
        body:
          "Metric: checklist closed; rollback tested or written; L1 + escalation named.",
        evidenceType: "case",
        verificationLevel: "observed",
        verificationNote: "Pilot go-live record.",
      },
      {
        title: "Workflow exceptions are typed and queued",
        body:
          "Metric: each failure class maps to queue + owner; visible outside mail threads.",
        evidenceType: "internal",
        verificationLevel: "repeatable",
      },
    ],
    caseStudiesTitle: "Reference patterns (composite)",
    caseStudiesLead:
      "No client names. Each row: failure mode, built components, observable delta, validation method, decision unlocked.",
    caseStudyLabels: {
      situation: "Situation",
      systems: "Systems",
      proof: "Proof",
      commercial: "Commercial lens",
      problem: "Problem",
      systemBuilt: "System built",
      outcome: "Outcome",
      metrics: "Validation",
      decisionImpact: "Decision impact",
    },
    caseStudies: [
      {
        kicker: "PRIVATE AI",
        title: "Policy Q&A with citation and role boundary",
        decisionImpact:
          "Board or risk committee can approve or reject enterprise-wide policy chat: citation requirement, role matrix, and blocklist are explicit in the access model.",
        situation:
          "Distributed ops repeats the same policy and product questions; authoritative text lives in files and mail threads, not one queryable, governed surface.",
        systems:
          "Retrieval service over role-scoped corpora; IdP integration; internal chat or portal client; admin review queue for blocked intents; corpus publish workflow; audit log export; L1 runbook.",
        proof:
          "Shorter time to first cited answer on tier-1 policy questions; reduction in escalations to subject-matter owners; sampled QA shows fewer contradictory answers across sites after corpus lock.",
        commercial:
          "Measured on ticket samples and spot audits — not percentage promises without your baseline.",
      },
      {
        kicker: "AUTOMATION",
        title: "Commercial document path with fixed gates",
        decisionImpact:
          "Finance and sales leadership can enforce cycle-time SLAs on the RFQ path because status and exceptions are system-owned, not inbox-owned.",
        situation:
          "RFQ status is chased across CRM, finance approval, and legal review; stalled items lack a single accountable queue.",
        systems:
          "CRM-opportunity state machine; ERP or finance approval API; document render service; notification channel; exception queue with SLA owner field; immutable event log for approvals.",
        proof:
          "Fewer days with status “unknown” on in-flight RFQs; document version mismatches detected before customer send; weekly exception count visible by failure class.",
        commercial:
          "Tracked against your historical cycle-time sample and error log — bounded claims only.",
      },
      {
        kicker: "BILINGUAL OPS",
        title: "One corpus, two languages, shared change control",
        decisionImpact:
          "Legal and HR can run one change programme for policy text instead of parallel EN/AR shadow copies with divergent enforcement.",
        situation:
          "EN and AR answers diverge because translations and approvals happen in separate channels without linked versioning.",
        systems:
          "Versioned bilingual record store; paired publish workflow; assistant surfaces for EN/AR with shared governance hooks; defect tickets linked to corpus version; locale-specific evaluation set.",
        proof:
          "Policy updates publish to both languages under one change ticket; fewer employee-reported conflicts between language variants post-release.",
        commercial:
          "Compared to pre-change helpdesk or HR case tags — qualitative volume trend, not fabricated uplift.",
      },
    ],
    fitSectionTitle: "Is this the right engagement?",
    fitSectionLead:
      "We work best with teams that can name systems, owners, and success criteria. If the left column sounds like you, we should talk. If the right column fits better, we will still help you find the right next step.",
    fitColumnTitle: "Strong fit",
    nonFitColumnTitle: "Better suited elsewhere",
    fitBullets: [
      "Named sponsor who can commit scope, approve access changes, and sign off production go-live.",
      "You can list — in writing — every system touched (read/write) and the data classes involved.",
      "You require written artefacts: access model, integration map, runbooks, and acceptance tests. Not just a 'working system'.",
      "You accept phased delivery: discovery → narrow pilot → scale — with a contractual stop line if phase one misses the bar.",
    ],
    nonFitBullets: [
      "Open-ended AI experiments without a named workflow or approved knowledge boundary.",
      "No internal owner available to approve access, integrations, or go-live within a reasonable window.",
      "Fixed price and date required before we have documented systems and constraints — we scope first, then quote.",
    ],
    diagramSectionTitle: "Reference diagrams",
    diagramLead:
      "Topology figure when set in CMS; then decomposed views — each column is a control or ownership boundary for IT review.",
    diagrams: [
      {
        title: "Private assistant — control stack",
        diagramType: "architecture",
        explanation:
          "Structural change: authoritative text moves behind version control + identity; responses become citations into that store; override path is admin-only and logged.",
        columns: [
          {
            label: "Before",
            body: "Uncontrolled search, forwarded PDFs, and inconsistent verbal guidance across sites.",
          },
          {
            label: "Corpus boundary",
            body: "Explicit allow-list of sources; versioned updates; no silent drift into unapproved text.",
          },
          {
            label: "Policy + identity",
            body: "Role → permitted corpora → blocklist intents; logging retention matches your record-keeping rule.",
          },
          {
            label: "After — owned channel",
            body: "Same chat or portal surface; answers cite sources; humans queue for exceptions; ops owns monitoring.",
          },
        ],
        footer:
          "Boundary: who may publish corpus changes; who may override a block; retention of query logs.",
      },
      {
        title: "Automation — closed control loop",
        diagramType: "flow",
        explanation:
          "Structural change: workflow state lives in the orchestration store; human approvals are records with user + timestamp; stalled items inherit SLA from queue config.",
        columns: [
          {
            label: "Before",
            body: "Manual copy between tools; status requests by message; exceptions without a ticket class.",
          },
          {
            label: "Trigger + orchestration",
            body: "System events drive steps; integrations retry; partial failure does not corrupt downstream records.",
          },
          {
            label: "Human gate",
            body: "Judgement-only steps stay human; system records who approved, when, and on which revision.",
          },
          {
            label: "After — observable ops",
            body: "Dashboards for queue depth and failure class; alert routes to named on-call; rollback documented.",
          },
        ],
        footer:
          "Ownership: queue owner per failure class; integration owner per system pair.",
      },
    ],
    roiSectionTitle: "Economics (qualitative unless you supply baseline)",
    roiLead:
      "Value axes: clock time (specialist hours, queue wait), defect rate (rework, compliance variance), inter-system handoff count and status dwell time on the scoped path. Cost drivers: integration count, auth mode count, logging + human-review ratio, pilot headcount, regulated or bilingual corpus handling, L1/L2 owner (you vs vendor SLA). No percentage ROI without your baseline measurement on the same workflow.",
    roiFormulaLabel: "Ledger framing",
    roiFormula:
      "(Δ time + Δ defects + Δ handoff dwell) − (discovery + pilot implementation + run)",
    roiInputsTitle: "Bring to the first working session",
    roiInputs: [
      "Single workflow name and business owner.",
      "Monthly volume: tickets, documents, or cases on that path.",
      "Minutes per case today — handoff to handoff.",
      "Exception or error classes you already count (or agree to count).",
      "Systems touched, approval chains, and non-negotiable security rules.",
    ],
    roiCards: [
      {
        title: "Time",
        body: "Repeat retrieval or automated field moves vs manual search and copy.",
      },
      {
        title: "Errors",
        body: "Wrong document versions, policy drift, untracked exceptions.",
      },
      {
        title: "Handoffs",
        body: "Count of system-to-system hops and time in unknown state before the next recorded status.",
      },
    ],
    roiReducedTitle: "What is reduced",
    roiAutomatedTitle: "What is automated",
    roiGainedTitle: "What is gained",
    roiReduced: [
      "Status threads and manual updates between named systems on the scoped path.",
      "Repeated policy or product answers handled without retrieval, citation, or queue.",
      "Rework from version drift, missing handoff context, or untracked exceptions.",
    ],
    roiAutomated: [
      "Deterministic routing and field updates across the integration inventory.",
      "Grounded retrieval with identity-scoped corpora and configured blocklists.",
      "Exception objects with class, owner, and SLA instead of informal follow-up.",
    ],
    roiGained: [
      "Checkpoints per phase: design review, pilot traffic review, scale gate — each with pass/fail criteria.",
      "Evidence pack: logs, citations, configuration export where contract allows, runbooks.",
      "Expansion only when phase-one measures meet the bar written in the proposal.",
    ],
    roiInvestmentScope:
      "Spend tracks phases: fixed discovery, capped pilot, optional scale — each gated on signed prerequisites from your side (access, data samples, change windows).",
    roiInvestmentProfileTitle: "What moves the fee and the calendar",
    roiInvestmentVariables: [
      "Number of integrations and auth modes; volume and peak-load requirement.",
      "Logging depth, retention, and human review ratio you require.",
      "Pilot population size and geography; bilingual or regulated content handling.",
      "Who operates L1/L2 — your staff, Estio under SLA, or mixed — and required response times.",
    ],
    executionTrace: {
      title: "Example execution trace",
      happyPath: {
        label: "Normal path",
        steps: [
          "Request",
          "System trigger",
          "Workflow routing",
          "Approval gate",
          "System action",
          "Logged output",
        ],
      },
      failurePath: {
        label: "Failure path",
        steps: [
          "Exception",
          "Typed queue",
          "Named owner",
          "Retry or escalate",
          "Audit log",
        ],
      },
      footer: "State is persisted at each transition. Every step is traceable, every failure is owned, every output is logged. This is what production-grade means.",
    },
    diagramTypeLabels: {
      architecture: "Architecture",
      flow: "Control flow",
      integration: "Integration map",
    },
    dealEntryTitle: "Qualification entry — one path per submission",
    dealEntryLead:
      "Each button below opens a single qualification path. If you combine automation, retrieval, and strategy in one message, we split it or decline — pick one path and complete its checklist.",
    dealEntryChecklistLabel: "Include in your first note",
    qualificationRequiredLabel: "Required in your first note",
    qualificationOptionalLabel: "Strongly helps",
    scopedEngagementCtaEyebrow: "Qualification",
    dealEntryCards: [
      {
        title: "Scope one manual workflow",
        body:
          "Choose when work moves by hand between CRM, finance, legal, ticketing, or mail — and you can name the monthly volume on that path.",
        checklist: [
          "Process name and owner",
          "Monthly transaction volume",
          "Common failure or exception path",
        ],
        ctaLabel: "Book a consultation",
        messageTemplate:
          "We want to scope one manual workflow.\nProcess name:\nBusiness owner:\nMonthly volume:\nCurrent failure points:\nSystems involved:\nDesired outcome:",
        intent: "AUTOMATION",
        qualificationRequired: [
          "Process name and business owner (named person).",
          "Monthly volume or ticket count for that path.",
          "Systems that must be touched (read/write).",
        ],
        qualificationOptional: [
          "Current exception rate or average delay.",
          "Security or regulator constraints we should know on day one.",
        ],
      },
      {
        title: "Assess a private AI assistant",
        body:
          "Choose when answers must come only from corpora you approve, under identity rules, inside channels you already operate — not from public tools.",
        checklist: [
          "Knowledge sources in scope",
          "Access and security owners",
          "High-risk question categories",
        ],
        ctaLabel: "Book a consultation",
        messageTemplate:
          "We want to assess a private AI assistant.\nPrimary use case:\nApproved knowledge sources:\nUsers or teams:\nAccess constraints:\nWhat the assistant must never do:",
        intent: "ENTERPRISE_AI",
        qualificationRequired: [
          "Approved knowledge sources list (or explicit “none yet”).",
          "Identity / access owner and data classification boundary.",
          "Channels where answers will surface (chat, portal, ticket).",
        ],
        qualificationOptional: [
          "High-risk question categories to block or route to humans.",
          "Languages and review policy for bilingual teams.",
        ],
      },
      {
        title: "Build the pilot ROI case",
        body:
          "Choose when the board or finance needs a single-workflow business case with explicit phase-one success tests before funding scale.",
        checklist: [
          "Named sponsor or decision-maker",
          "Baseline effort or delay today",
          "Success criteria for phase one",
        ],
        ctaLabel: "Book a consultation",
        messageTemplate:
          "We want to build the ROI case for a narrow governed-assistant or automation pilot.\nPilot candidate:\nDecision-maker:\nCurrent effort or delay:\nWhat success would look like in phase one:\nConstraints or dependencies:",
        intent: "PLATFORM_BUILD",
        qualificationRequired: [
          "Sponsor who can commit budget and accept pilot success criteria.",
          "Baseline: delay, rework, or hours tied to the workflow today.",
          "Hard constraints: integrations, compliance, go-live window.",
        ],
        qualificationOptional: [
          "Internal benchmark or prior failed attempt — what broke.",
          "Expansion criteria if phase one meets bar.",
        ],
      },
    ],
    mediaPlaceholder: "Visual",
    finalCtaEyebrow: "Entry",
    programCardContinue: "Book a consultation",
    salesMicro: {
      afterHero: "The strongest enquiries name the workflow, the systems involved, and who signs off in production. We can help you get there if you are still shaping scope.",
      afterPractice: "What you read above is what we deploy — documented, testable, and handed over to your team.",
      afterPrograms: "If your brief spans multiple tracks, we will split scope clearly so pricing and delivery stay predictable.",
      beforeProof: "Each proof point below ties to a deliverable you can review before you commit.",
      afterProof: "Use these patterns to map your internal requirements — we align the SOW to the same structure.",
      afterCases: "Read the decision-impact column to see what approval each pattern unlocks on your side.",
      afterFit: "If the left column matches your organisation, the next step is a focused qualification call — not an open-ended sales cycle.",
      afterRoi: "We do not fabricate ROI. Your volumes, your constraints, and your phase boundaries determine the fee and the calendar. Bring numbers, not aspirations.",
      afterDiagrams: "If the diagrams feel dense, that is by design. Named boundaries, visible handoffs, and auditable sequence. Vague architecture is the start of a twelve-month failure.",
      beforeDeliverables: "What follows are contractual deliverables — what the SOW binds us to. Not a wish-list of capabilities.",
      processObjection:
        "The process is deliberately heavy. Lightweight engagements produce silent production failures. Phases exist so you can stop early with limited damage — that answers 'how long does this take?'",
    },
    commitmentPanel: {
      title: "What we need to start well",
      body:
        "A named sponsor, a written list of systems in scope, and realistic change windows for IT. If something is missing, we will tell you what to prepare — we prefer a strong start over a rushed one.",
    },
    preQualification: {
      eyebrow: "Before you enquire",
      mustHaveTitle: "Helpful to have ready",
      mustHave: [
        "A written list of systems the workflow touches (read and write) — not “our stack” or “various tools”. Name them.",
        "A named person who can approve identity changes, integration access, and production go-live within your change process — within one business week.",
        "A single workflow name and approximate monthly volume — enough to bound pilot traffic and validate the investment case.",
      ],
      nextTitle: "What happens after you submit",
      next: [
        "Written classification against your chosen path — specific questions, a direct decline, or a request for one missing artefact. No open-ended discovery calls.",
        "No commercial proposal until integration inventory and constraints are documented mutually.",
        "A scoping call only when your brief clears the qualification bar. Otherwise, async communication only.",
      ],
      notAcceptedTitle: "We may defer if",
      notAccepted: [
        "The brief is only “AI strategy” without a named workflow, systems list, or owner.",
        "No one on your side can approve access, integrations, or production go-live.",
        "Price and date are fixed before we have documented scope — we quote after boundaries are clear.",
      ],
    },
    dealPathMicro: {
      ENTERPRISE_AI: {
        focus:
          "Internal intelligence on approved corpora — identity rules, logging policy, and channels you already run.",
        expectation:
          "Expect access reviews, content-governance hooks, and a narrow pilot before any enterprise-wide rollout.",
      },
      AUTOMATION: {
        focus:
          "Workflows between named systems — retries, visible exception queues, rollback paths operations can execute.",
        expectation:
          "Expect process maps, an integration inventory, and phased cutover — not a weekend “just connect it” miracle.",
      },
      PLATFORM_BUILD: {
        focus:
          "Internal tools, dashboards, and technical programmes where the sponsor signs pilot success in writing.",
        expectation:
          "Expect one workflow’s ROI logic first, hard dates stated, and expansion criteria deferred until phase one passes.",
      },
    },
    structuredEngagementLine:
      "Your enquiry starts a structured conversation — we reply with questions, a fit view, or a suggested call. Clear scope leads to accurate pricing.",
    closingPressure: {
      title: "We take on a focused number of enterprise programmes at a time.",
      body: "If you have a named workflow, systems list, and sponsor — we would like to hear from you. If not yet, we can still advise what to prepare before a formal scope.",
    },
    scopeControl: "We do not expand scope mid-engagement without redefinition.",
  },
};

const ar: MarketingMessages = {
  skipToMain: "تخطي إلى المحتوى الرئيسي",
  breadcrumbAria: "مسار التنقل",
  breadcrumbHome: "الرئيسية",
  serviceDetail: {
    allServices: "جميع الخدمات",
    viewAllServices: "عرض جميع الخدمات",
    capabilities: "نطاق التنفيذ",
    idealClients: "من يناسبهم العمل",
    whatYouReceive: "مخرجات التعاقد",
    deliverablesIntro:
      "كل تعاقد يحدّد مخرجات معلنة، ومراجعة قبل التسليم، وتسليم يمكن الرجوع إليه في التشغيل والتدقيق.",
    howWeWork: "مسار التنفيذ",
    howWeWorkIntro:
      "مراحل واضحة، ومسؤوليات معلنة، وتسليم يمكن قياسه — لا عمل مفتوح النهاية.",
    definitionOfDoneLabel: "تعريف الإنجاز",
  },
  guidedSectionKicker: "ماذا تطلقون؟",
  homeMetadataTitleSuffix:
    "إنتاج بصري بالذكاء الاصطناعي وتنفيذ رقمي لعلامات الخليج | مسقط",
  about: {
    seoTitle: "من نحن",
    seoDescription:
      "إستيو — إنتاج بصري رفيع المستوى مدعوم بالذكاء الاصطناعي وتنفيذ رقمي لعلامات الخليج من مسقط: مخرجات إبداعية محكومة، مواقع، أنظمة محتوى، وأتمتة مؤسسية ضمن نطاق معلن.",
    kicker: "عن إستيو",
    h1: "إنتاج رفيع لعلامات الخليج — مرئيات ومواقع ومحتوى وأتمتة عند الحاجة",
    introP1:
      "إستيو في مسقط: صور حملات، فيديو قصير، مواقع ثنائية اللغة مع تسليم إدارة محتوى، تقويم محتوى للإطلاق، و—عند الحاجة—أتمتة يشغّلها فريق التشغيل. تستلمون قوائم مخرجات ومراحل مراجعة وملفات جاهزة للنشر. نوثّق القرارات ونسلّم عملاً تستطيع الإدارة وتقنية المعلومات اعتماده — لا تجارب عشوائية.",
    introP2:
      "لا نبيع «الاتجاهات». نحدّد المخرجات قبل البناء، ونلتزم بمعايير قبول، ونقيس على ما اتفقنا أنه النجاح. إن لم نكن المناسبين نقول ذلك مبكراً.",
    principlesKicker: "ماذا ننفّذ",
    principlesH2: "أربعة خطوط إنتاج، ومعيار تسليم واحد",
    values: [
      {
        title: "منصّات وتجارب رقمية",
        body: "مواقع مؤسسات ووجهات حملات وتطبيقات ويب حيث الأداء والإتاحة والثنائية اللغوية أساس — لا زينة لاحقة.",
      },
      {
        title: "محتوى وقنوات",
        body: "تقويم وإنتاج ونشر يتماشى مع كيف تبيعون وتشغّلون فعلياً — حتى لا يبقى التسويق منفصلاً عن أعمالكم.",
      },
      {
        title: "إبداع بذكاء محكوم",
        body: "تسريع صورة ونص وفيديو حيث يُسمح للذكاء فقط بما تحدّدونه؛ ومراجعة بشرية قبل أي نشر يصل للعميل.",
      },
      {
        title: "أتمتة واسترجاع داخلي محكوم",
        body:
          "تنسيق بين أنظمة مسماة، وخدمات استرجاع على مصادر تدخلونها في نطاق المعتمد، وهوية وصلاحيات وسجلات حسب سياساتكم — بيئة يشغّلها فريق تقنية المعلومات لديكم.",
      },
    ],
    capabilitiesKicker: "كيف نعمل",
    capabilitiesH2: "كيف نُدير مشروعكم",
    capabilitiesLead:
      "سواء أطلقتم موقعاً أو أتمتتم مساراً: مسؤول واحد، مخرجات مكتوبة، نقاط تفتيش ظاهرة، ولا توسّع صامت للنطاق.",
    capabilities: [
      {
        title: "مسؤولية مباشرة",
        body: "مسؤول واحد من البداية للنهاية — لا سلسلة من مديري حسابات لا يجيبون عن السؤال التقني أو التنفيذي.",
      },
      {
        title: "نطاق وتغيير معلنان",
        body: "مخرجات وجدول وتبعيات قبل البناء. أي تعديل يمرّ بقرار صريح مع أثره على الزمن والكلفة كتابةً.",
      },
      {
        title: "دليل لا خطاب حالة",
        body: "نقاط تفتيش مع مخرجات — عروض، وثائق، اختبارات — لا تقارير حالة مبهمة.",
      },
      {
        title: "سعة مقصودة",
        body: "نحدّ عدد التعاقدات المتزامنة ليبقى الانتباه والاستجابة متوقّعين.",
      },
    ],
    positionKicker: "لماذا إستيو",
    positionH2: "ملائمة لتشغيل الخليج",
    positionBody:
      "نعمل من مسقط مع مراعاة التوقيت والثقافة التجارية والتواصل ثنائي اللغة مع أصحاب القرار. القرب يهمّ عندما يلزم اجتماع في اليوم نفسه أو جلسة مع IT والامتثال في موقعكم.",
    sidebar: [
      {
        title: "حديث بلغة صاحب القرار",
        body: "نخاطب التقنية والتسويق والملكية بلغة المخاطر والعائد والملاءمة التشغيلية — لا مؤشرات قناة من دون سياق أعمال.",
      },
      {
        title: "عربي وإنجليزي كعمل يومي",
        body: "صياغة وواجهات وورش بأسلوب أصلي للجمهور، بما فيها منتج وويب باتجاه RTL عند الحاجة.",
      },
      {
        title: "ملاءمة طويلة الأجل",
        body: "نفضّل أنظمة قابلة للصيانة وتسليماً موثّقاً كي لا تُحبسوا عندنا لكل تعديل صغير — إلا إن رغبتم بترتيب تشغيل مستمر.",
      },
      {
        title: "ما لا نفعله",
        body: "لا نبيع اشتراكات ساعات غامضة، ولا نعدّ ذكاءً دون وضوح بيانات وحوكمة، ولا نأخذ عملاً لا نستطيع تغطيته بمعيارنا. إن لم نكن المناسبين نقول ذلك مبكراً.",
      },
    ],
    ctaH2: "جاهزون لخطوة تالية واضحة؟",
    ctaBody:
      "اذكروا المخرج والقيود والأنظمة المعنية. نرد برؤية صريحة للملاءمة والجهد والمراحل — أو بتوجيه صادق إن لم نكن الشريك المناسب.",
    ctaButton: "احجز استشارة",
  },
  contact: {
    seoTitle: "تواصل",
    seoDescription:
      "صفوا ما تحتاجونه لإستيو — صور وفيديو بالذكاء الاصطناعي، حزم علامة، مواقع، أو أتمتة. فريق مسقط؛ ردّ كتابي خلال يوم عمل.",
    kicker: "تواصل",
    h1: "تواصلوا مع إستيو",
    lead:
      "صفوا ما تطلقونه وكيف نصل إليكم. نرد خلال يوم عمل — بمسار عرض سعر واضح، أو مكالمة قصيرة، أو واتساب إن كان أسرع لكم.",
    formH2: "كيف يمكننا المساعدة",
    formLead:
      "سطران يكفيان: ما تطلقونه، المخرجات المطلوبة، الموعد، وروابط العلامة. نرد بقائمة نطاق واضحة أو أسئلة مركّزة — دون مراسلات لا تنتهي.",
    asideDirectH3: "تفضّلون الهاتف أو واتساب؟",
    whatsapp: "واتساب",
    officeH3: "الموقع",
    nextH3: "بعد إرسال الطلب",
    nextSteps: [
      "خلال يوم عمل: رد بالبريد أو مكالمة أو واتساب — كما تفضّلون.",
      "نؤكد الملاءمة بصراحة. إن لم نكن الأنسب، نقول ذلك مبكراً.",
      "عند المتابعة: قائمة مخرجات وجدول وعرض سعر — لتعرفوا ما تشتريون.",
    ],
    mapIframeTitle: "موقع المكتب على الخريطة",
    openInGoogleMaps: "الموقع على خرائط Google",
  },
  contactForm: {
    serviceInterestOptions: [
      { value: "WEB_DESIGN_DEVELOPMENT", label: "تصميم وتطوير المواقع" },
      { value: "CONTENT_CAMPAIGNS", label: "المحتوى والحملات" },
      { value: "AI_CREATIVE", label: "إبداع معزّز بالذكاء" },
      { value: "AI_STUDIO", label: "استوديو الذكاء — صور، فيديو، أو حزم علامة" },
      { value: "ENTERPRISE_AI", label: "استرجاع داخلي محكوم وقواعد معرفة" },
      { value: "AUTOMATION", label: "أتمتة سير العمل والتكاملات" },
      { value: "PLATFORM_BUILD", label: "بناء منصة وبرنامج تقني" },
      { value: "UNSURE", label: "لم يُحدَّد بعد" },
    ],
    successTitle: "شكراً — استلمنا رسالتكم",
    successBody:
      "سنراجع ما أرسلتموه ونرد خلال يوم عمل. إن كان الأمر عاجلاً يمكنكم التواصل بالهاتف أو واتساب.",
    submitAnother: "إرسال رسالة أخرى",
    name: "الاسم الكامل",
    namePh: "الاسم كما يظهر في المراسلات",
    email: "البريد المهني",
    emailPh: "you@company.com",
    phone: "الهاتف (اختياري)",
    phonePh: "+۹۶۸ …",
    company: "الشركة أو الجهة",
    companyPh: "اسم المؤسسة",
    interest: "مجال الاهتمام",
    interestPlaceholder: "اختروا مجالًا",
    message: "أي تفاصيل إضافية؟ (اختياري)",
    messagePh: "أهداف، مواعيد، قنوات، روابط علامة، أو أسئلة — حتى نقاط بسيطة تكفي.",
    error: "تعذّر الإرسال. أعيدوا المحاولة، أو أرسلوا مباشرة إلى",
    sending: "جارٍ الإرسال…",
    submit: "أرسلوا الاستفسار",
    qualificationHeading: "مفيد لو توفّر",
    qualificationIntro:
      "شاركوا ما تعرفونه اليوم — موعد الإطلاق والقنوات واللغات. نحوّله إلى قائمة مخرجات وعرض سعر؛ نسأل فقط ما يؤثر على التسعير.",
    qualificationRequiredHeading: "يسرّع عرض السعر",
    qualificationOptionalHeading: "تفاصيل إضافية",
    qualificationByIntent: {
      AUTOMATION: {
        required: [
          "اسم العملية ومالك أعمال (مسمّى).",
          "الحجم الشهري أو عدد التذاكر.",
          "الأنظمة التي تُلمس (قراءة/كتابة).",
        ],
        optional: ["معدل الاستثناء أو التأخير اليوم.", "قيود جهة تنظيمية أو أمنية."],
      },
      ENTERPRISE_AI: {
        required: [
          "مصادر معرفة معتمدة (أو لا يوجد بعد صراحة).",
          "مالك الوصول / الهوية.",
          "قنوات الإجابة (دردشة، بوابة، تذكرة).",
        ],
        optional: ["فئات أسئلة محظورة.", "سياسة لغات ومراجعة."],
      },
      PLATFORM_BUILD: {
        required: [
          "راعٍ يوقع نجاح المرحلة الأولى.",
          "خط أساس للتأخير أو الجهد اليوم.",
          "قيود صلبة: تواريخ أو تكاملات.",
        ],
        optional: ["محاولة سابقة وفشلها.", "معايير التوسع."],
      },
      AI_STUDIO: {
        required: [
          "صور، فيديو قصير، أو حزمة علامة — ما الذي تفضّلونه؟",
          "حجم تقريبي (عدد لقطات أو مقاطع).",
          "روابط علامة، مراجع مزاجية، أو وصف قصير للمظهر.",
        ],
        optional: [
          "أين سيُعرض (ويب، سوشال، طباعة).",
          "متى تحتاجونه.",
        ],
      },
    },
    intakeProcessEyebrow: "كيف نتعامل مع الاستفسارات",
    intakeProcessTitle: "متابعة واضحة ومنظمة",
    intakeProcessBody:
      "نوجّه كل استفسار لفريق الإنتاج المناسب ونرد بأسئلة مركّزة أو عرض مُحدّد النطاق. تفصيل ناقص واحد يُطلب مرة واحدة — لا أسابيع اكتشاف.",
    enterprisePreSubmitEyebrow: "قبل الإرسال",
    enterprisePreSubmitTitle: "استفسارات المؤسسات — ما يسرّع الرد",
    enterprisePreSubmitMustHaveTitle: "مفيد أن يكون جاهزاً",
    enterprisePreSubmitMustHave: [
      "أنظمة مسماة ضمن النطاق — لا «مكدسنا» بشكل مجرد.",
      "مالكاً داخلياً يجيب عن الوصول والتكامل خلال أسبوع عمل.",
      "توقعاً بمرحلة أولى واضحة: نطاق، قياس، ثم توسعة عند النجاح.",
    ],
    enterprisePreSubmitNextTitle: "بعد الإرسال",
    enterprisePreSubmitNext: [
      "ردّ كتابي بأسئلة محددة أو توجيه صادق.",
      "لا مقترح تجاري قبل توثيق حدود النطاق.",
      "الشروط التجارية بعد الاتفاق على معايير نجاح المرحلة الأولى.",
    ],
    structuredEngagementBeforeSubmit:
      "الإرسال يبدأ حواراً منظماً. كلما كان النطاق أوضح، كان الرد أسرع وأدق.",
    submitEnterpriseDeal: "احجز استشارة",
  },
  servicesListing: {
    seoTitle: "الخدمات",
    seoDescription:
      "أربع ممارسات تنفيذ من إستيو، مسقط: منصّات رقمية، تشغيل محتوى وحملات، إبداع محكوم، وأتمتة واسترجاع داخلي — كلها بنطاق كتابي وقبول مرحلي.",
    kicker: "الخدمات",
    h1: "ما تقدّمه إستيو لعلامات الخليج",
    lead:
      "أربعة خطوط إنتاج — لكل منها قائمة مخرجات توافقون عليها قبل البدء: مواقع مع تسليم، محتوى إطلاق، مرئيات وفيديو بالذكاء، وأتمتة سير العمل.",
    lead2:
      "فرق الضيافة والتجزئة والصحة والعقار تستخدم إستيو لتسريع الحملات وتوحيد عرض العلامة ونشر أصول عربية وإنجليزية من مسقط.",
    practicesSectionKicker: "اختر خط الخدمة",
    practicesSectionLead:
      "افتحوا الخط الأقرب لهدفكم. غير متأكدين؟ صفوا النتيجة — نوجّهكم للفريق المناسب.",
    learnMore: "عرض الخدمة ←",
    bottomH2: "غير متأكدين من الخدمة المناسبة؟",
    bottomBody:
      "صفوا النتيجة التجارية والجدول والقنوات. نرد بالمسار المناسب وعرض سعر — أو توجيه صادق إن لم نكن الشريك الأنسب.",
    bottomCta: "احصل على عرض سعر",
  },
  faq: {
    seoTitle: "الأسئلة الشائعة",
    seoDescription:
      "التسعير، بداية المشاريع، الذكاء والأتمتة، وما نحتاجه من العميل — إجابات مباشرة.",
    kicker: "الأسئلة الشائعة",
    h1: "إجابات مباشرة",
    lead: "أسئلة تتكرر قبل التوقيع. الحالات الخاصة تمرّ عبر مدخل التأهيل — نفضّل موجزاً مفصلاً على أسئلة عامة هنا.",
    items: [
      {
        title: "كيف يتم التسعير؟",
        body: "من النطاق: المخرجات والجدول والمخاطر. مقترح ثابت لعمل معلن، أو مراحل بحد أعلى لكل مرحلة. لا نبيع «ساعات مفتوحة» دون تفكيك عمل. الذكاء والأتمتة المؤسسية غالباً بمراحل: تقييم، إثبات على نطاق ضيق، ثم بناء.",
      },
      {
        title: "ما الجداول الزمنية المتوقعة؟",
        body: "موقع تسويقي مركّز: أسابيع إلى بضعة أشهر حسب جاهزية المحتوى والاعتمادات. برامج المحتوى مستمرة بالتعريف. العمل المؤسسي يعتمد على تعقيد التكامل ونوافذ التغيير في IT — نذكر مدىً بعد الاستكشاف لا وعوداً عامة.",
      },
      {
        title: "كيف تبدأ المشاريع؟",
        body: "استفسار، اتصال توضيحي قصير، ثم مقترح كتابي. يبدأ التنفيذ بعد اتفاق وتوقيع، وعند الحاجة وصول لأصول العلامة وأصحاب المصلحة وجهات الاتصال التقنية. لا عمل باتفاق شفهي فقط.",
      },
      {
        title: "ماذا نحتاج منكم كعميل؟",
        body: "مالك قرار واحد يقرر أو يصعّد. وصول في الوقت المناسب لخبراء المجال في العمل المؤسسي. مسارات اعتماد العلامة والقانون للمخرجات العلنية. للأتمتة: توثيق أو جولة على العمليات الحالية — دقتها تحدد النجاح.",
      },
      {
        title: "كيف تعمل خدمات الذكاء فعلياً؟",
        body: "للإبداع: نحدد ما يُسمح بإنتاجه وما يجب مراجعته بشرياً وما الممنوع. للمؤسسة: إجابات من معرفة تعتمدونها، وصلاحيات حسب الدور، وسجلات عند الحاجة. لا ندرّب نماذج عامة على بياناتكم السرية دون اتفاق صريح.",
      },
      {
        title: "هل يوجد عمل في الموقع؟",
        body: "عند الحاجة — ورش، استكشاف مع IT، أو دعم إطلاق. أغلب التنفيذ عن بُعد مع نقاط تفتيش منظمة. نحن في مسقط لمن يحتاج جلسات وجهاً لوجه في المنطقة.",
      },
      {
        title: "من يملك المخرجات؟",
        body: "كما في العقد: عادةً أنتم تملكون المدفوع منها ولا نحتفظ بحقوق تتجاوز المرجع في المحفظة إلا باستثناء منكم. الشيفرة والأتمتة تُسلَّم مع توثيق إلا إن رُتّب صيانة منفصلة.",
      },
      {
        title: "ماذا بعد الإطلاق؟",
        body: "فترات تثبيت معلنة لمشاريع الويب. للأتمتة ومسارات الاسترجاع الداخلي نربط اتفاق الدعم باحتياج التشغيل. الطلبات المؤقتة تُعرَّف كنطاق صغير منفصل — لا صندوق بريد مفتوح.",
      },
      {
        title: "هل تستأجرون كل شيء خارجياً؟",
        body: "لا. إستيو يقود كل تعاقد بمساءلة داخلية. نستخدم تخصصاً خارجياً فقط حيث يُعلَن ويخدم المخرج — لا استبدالاً خفياً.",
      },
      {
        title: "من يكتب أدلة المقالات؟",
        body: "فريق التسليم في مسقط — الويب وإنتاج الحملات واستوديو الذكاء وتحديد النطاق المؤسسي. يقرأ شخص ثانٍ كل دليل قبل النشر. لا ننشر ترجمات رقيقة ولا مسودات آلية بلا مراجعة. معايير التحرير، بما في ذلك حصر الإعلان في صفحات المحتوى الجوهرية، منشورة في /resources/editorial-standards.",
      },
      {
        title: "كيف تستخدمون الكوكيز والإعلانات؟",
        body: "نستخدم كوكيز أساسية لمظهر الموقع، ووسوم جوجل للقياس، و—فقط على صفحات تملك محتوى ناشراً جوهرياً—إعلانات جوجل. سياسات الخصوصية والشروط وملفات الارتباط في التذييل. يمكن إيقاف الإعلانات المخصّصة من إعدادات إعلانات جوجل. لا تعمل الإعلانات على الدفع أو أدوات التوليد أو الصفحات القانونية.",
      },
    ],
  },
  footerContact: {
    web: "الموقع الإلكتروني",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
  },
  navPrimaryAria: "التنقل الرئيسي",
  brandHomeAria: "{name} — الصفحة الرئيسية",
  theme: {
    switchToLight: "التبديل إلى الوضع الفاتح",
    switchToDark: "التبديل إلى الوضع الداكن",
  },
  mobileNav: {
    navAria: "القائمة — الجوال",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    closeOverlay: "إغلاق القائمة",
  },
  enterpriseAppendix: {
    title: "ملاحق البرامج",
    deepLinks: [
      {
        label: "الاسترجاع الداخلي المحكوم",
        description:
          "إجابات من مصادر تدخلونها في قائمة المعتمد؛ صلاحيات هوية وسجلات؛ وقنوات هي نفسها التي يعمل عليها فريقكم اليوم.",
      },
      {
        label: "أتمتة سير العمل بين الأنظمة",
        description:
          "تدفقات محددة بين إدارة العملاء والمالية والتذاكر والمراسلات — مع استثناءات مصنّفة ومراقبة وأدلة تشغيل يتولاها فريق تقنية المعلومات لديكم.",
      },
    ],
  },
  homeEnterpriseBridge: {
    eyebrow: "تسليم مؤسسي",
    secondaryCtaLabel: "قسم المؤسسات",
  },
  enterpriseLanding: {
    heroKicker: "أنظمة مؤسسية وذكاء محكوم",
    heroAudienceLine:
      "للقيادات التي تقلّل التمرير اليدوي، وتسرّع الإجابات من وثائق معتمدة، وتطلق بأدلة تشغيل يملكها فريقها — بنطاق مكتوب وتسليم مرحلي.",
    secondaryCtaLabel: "عرض البرامج",
    practiceSectionTitle: "١. النظام قيد التسليم",
    practiceLead:
      "فئات الكائنات: (أ) سير عمل حتمي عبر جرد تكامل متفق عليه؛ (ب) خدمة استرجاع مربوطة بمجموعات معتمدة وإعدادات هوية؛ (ج) أدوات تشغيل داخلية ضمن النطاق. يحدد كل تعاقد: قائمة التكامل (قراءة/كتابة)، وفئات البيانات، اختبارات القبول لكل مرحلة، التراجع، وحزمة تسليم المستوى الأول.",
    practiceBlocks: [
      {
        title: "استرجاع وحكم وصول",
        body:
          "قائمة معرفة معتمدة؛ ربط الدور بالمصدر؛ نوايا محظورة؛ قنوات النشر؛ احتفاظ السجلات وفق سياسة السجلات لديكم — كلها إعدادات تشغيلية لا تعتمد على الصياغة وحدها.",
      },
      {
        title: "أتمتة سير العمل",
        body:
          "تدفقات موثّقة عبر CRM وتذاكر ومالية ومراسلات — مع معالجة أخطاء ومراقبة ومسارات تراجع بدلاً من سكربتات غير رسمية.",
      },
      {
        title: "لوحات وأدوات داخلية",
        body:
          "رؤية تشغيلية وتسليم يمكن صيانته: أدلة تشغيل ومسارات تصعيد وواجهات يمكن لفرقكم الإبقاء عليها بعد الإطلاق.",
      },
    ],
    integrationSurfacesTitle: "١.١ جرد أسطح التكامل — أمثلة توضيحية غير شاملة",
    integrationSurfacesIntro:
      "النطاق الفعلي يُبنى على جرد تطبيقاتكم. ما يلي فئات شائعة في بيئات الخليج — لتوجيه المراجع فقط، لا كتعهد ضمني بدعم كل مورّد.",
    integrationSurfacesGroups: [
      {
        heading: "المبيعات وإدارة علاقات العملاء (CRM)",
        examples:
          "فرص وحسابات؛ تسعير وعروض (CPQ)؛ بيانات وصفية للعقود؛ ربط التوقيع الإلكتروني؛ فتح تذكرة أو حالة من أحداث سير العمل.",
      },
      {
        heading: "المالية وأنظمة تخطيط الموارد (ERP)",
        examples:
          "ترحيل إلى دفتر الأستاذ ومراكز التكلفة؛ موافقات الذمم المدينة/الدائنة؛ مسار صاحب الميزانية؛ قراءة السجلات الرئيسية للمورّدين والعملاء.",
      },
      {
        heading: "الهوية والوثائق وقناة التشغيل",
        examples:
          "مزود هوية (مثل بروتوكولات OIDC/SAML)؛ تغذية أدوار من الموارد البشرية عند الدخول في النطاق؛ مستودعات وثائق (SharePoint/S3 ونحوها) مع صلاحيات؛ ServiceNow أو Jira أو مراسلة داخلية كقنوات إشعار أو بوابة بشرية.",
      },
    ],
    integrationNamedSystemsTitle: "أنظمة نموذجية ضمن النطاق",
    integrationNamedSystems: [
      { category: "CRM", examples: "Salesforce، HubSpot، Microsoft Dynamics، CRM مخصص" },
      { category: "مالية", examples: "SAP، Oracle ERP، NetSuite، ERP داخلي" },
      { category: "داخلي", examples: "واجهات REST، لوحات داخلية، أنظمة إدارة وثائق، تذاكر (ServiceNow، Jira)" },
    ],
    integrationNamedSystemsFooter: "الأنظمة الدقيقة تُحدد أثناء التأهيل. نُحدد النطاق مقابل جرد تطبيقاتكم — لا قائمة توافق مورّدين.",
    proofSectionTitle: "٢. مخرجات التحضير قبل الالتزام المالي",
    evidenceLabels: {
      case: "إثبات من حالة",
      internal: "قياس داخلي",
      simulation: "محاكاة / نموذج",
      reference_architecture: "معمارية مرجعية",
    },
    verificationLabels: {
      internal: "تحكم داخلي",
      observed: "ملاحظ في التسليم",
      repeatable: "مسار تشغيل قابل للتكرار",
      contractual: "صريح في العقد / النطاق",
    },
    decisionSummaryForTeams:
      "هذا للفرق التي تمتلك تغييراً إنتاجياً — رؤساء تقنية وتشغيل ورعاة تحول مسؤولون أمام IT والمجلس.",
    decisionSummaryRequires:
      "يتطلّب: راعٍ مسمّى، وأنظمة ضمن النطاق، وقيود أمن معلنة، واستعداد لقبول مرحلي بمعايير.",
    decisionSummaryDelivers:
      "يقدّم: أتمتة أو ذكاء خاص محكومان بسير عمل مسماً — مع أدلة تشغيل وسياسة سجلات وقابلية تتبع — لا برمجيات عامة بلا تمييز.",
    proofItems: [
      {
        title: "أنظمة مسماة داخل النطاق",
        body:
          "كل عرض يربط القيمة بأنظمة ومالكين ومسارات بيانات حقيقية — لا بسردية ذكاء عامة.",
      },
      {
        title: "نموذج وصول صريح",
        body:
          "من يسأل، وماذا يمكن إرجاعه، وما الذي يجب تسجيله، يُعرّف قبل أي إطلاق.",
      },
      {
        title: "قبول وأدلة تشغيل",
        body:
          "معايير النجاح، ومسارات الفشل، وتسليم الملكية مكتوبة داخل مسار التنفيذ.",
      },
      {
        title: "حالة تجارية واضحة",
        body:
          "المرحلة الأولى تُبنى على حجم فعلي، وتأخير، وإعادة عمل، ووقت خبراء — لا على وعود كفاءة ضبابية.",
      },
    ],
    caseStudiesTitle: "حالات تمثيلية",
    caseStudiesLead:
      "ليست شعارات عملاء على شريحة. هذه هي أشكال الصفقات التي تصل عادة عندما يحتاج القرار إلى إثبات، وسيطرة، ومسار ضيق نحو القيمة.",
    caseStudyLabels: {
      situation: "الوضع",
      systems: "الأنظمة",
      proof: "الإثبات",
      commercial: "المنظور التجاري",
      problem: "المشكلة",
      systemBuilt: "النظام المُنفَّذ",
      outcome: "النتيجة",
      metrics: "مقاييس محدودة",
      decisionImpact: "أثر القرار",
    },
    caseStudies: [
      {
        kicker: "استرجاع داخلي",
        title: "مساعد سياسات لعمليات موزعة",
        decisionImpact:
          "يمكّن قراراً بشأن الدردشة المؤسسية للسياسات: من يحق له السؤال، ماذا يُستشهد به، وما الذي لا يخرج من الحدود.",
        situation:
          "الفرق تكرر أسئلة السياسات والمنتج بين الفروع، بينما الإجابات المعتمدة موزعة بين PDF ومجلدات داخلية ورسائل قديمة.",
        systems:
          "مزود هوية، ومستودع وثائق معتمد، ودردشة أو بوابة داخلية، وسجل تدقيق.",
        proof:
          "إجابات موثقة بالمصدر، وصلاحيات حسب الدور، وصف انتظار للمراجعة الإدارية، ودليل تشغيل لملكية ما بعد الإطلاق.",
        commercial:
          "القيمة تظهر في تسريع أول رد، وتقليل التصعيد إلى المختصين، وتقليل اختلاف تفسير السياسات بين الفرق.",
      },
      {
        kicker: "أتمتة",
        title: "مسار طلب العرض إلى الاعتماد — بنقاط تحكم مسماة",
        decisionImpact:
          "يزيل الغموض عن زمن الدورة والملكية: التجاري يدافع عن الحالة في CRM والمالية دون أرشفة بريد.",
        situation:
          "الفرق التجارية تطارد الحالة بين CRM والمالية والقانوني والبريد، بينما تضيع الاستثناءات في متابعة يدوية غير مرئية.",
        systems:
          "CRM، وخط اعتماد مالي أو ERP، وتوليد مستندات، وإشعارات، وصف للاستثناءات.",
        proof:
          "خريطة سير، وبوابات اعتماد مسماة، وإعادة محاولة، وسجل فشل، ومسار تراجع قبل التوسعة.",
        commercial:
          "القيمة تأتي من تقليص زمن الدورة، وتقليل المناولات اليدوية، وخفض الأخطاء في أوراق العروض والتعاقد.",
      },
      {
        kicker: "تشغيل ثنائي اللغة",
        title: "تدفق معرفة عربي/إنجليزي تحت نموذج تحكم واحد",
        decisionImpact:
          "يفتح نموذج حوكمة واحداً للإجابات الثنائية: نفس المصادر، نفس السياسة، تغييرات قابلة للتدقيق.",
        situation:
          "الفرق الإقليمية تحتاج إجابات متسقة باللغتين، لكن الترجمة والتسليم بين الفرق يؤخران القرار.",
        systems:
          "قاعدة معرفة ثنائية اللغة معتمدة، وطبقة مساعد، ونظام تذاكر أو بوابة، ولوحة مراقبة.",
        proof:
          "حوكمة مشتركة لتغيير المحتوى، وتقييم خاص بكل لغة، وأثر للإجابة، وإطلاق مرحلي حسب الفرق.",
        commercial:
          "القيمة تظهر في تقليل إعادة العمل، وتحسين الالتحاق، ورفع اتساق الخدمة بين المواقع.",
      },
    ],
    fitSectionTitle: "هل هذا النموذج يناسبكم؟",
    fitSectionLead:
      "نستخدم هذه القائمة لضبط التوقعات — لا لاستبعادكم مسبقاً. إن تطابقت معظم النقاط اليسرى، الخطوة التالية استشارة مركّزة.",
    fitColumnTitle: "غالباً مناسب",
    nonFitColumnTitle: "قد نؤجّل حتى",
    fitBullets: [
      "يمكنكم تسمية راعٍ وسير عمل وأنظمة ضمن النطاق.",
      "تريدون أدلة يستطيع فريق تقنية المعلومات مراجعتها: نموذج وصول، وسجلات، وأدلة تشغيل.",
      "تقبلون إطلاقاً مرحلياً بمعايير قبول — لا تفاؤلاً كاملاً دفعة واحدة.",
    ],
    nonFitBullets: [
      "تحتاجون مورّداً لـ«تجربة الذكاء» دون سير عمل محدود أو حدود بيانات.",
      "لا يوجد مالك يستطيع اعتماد الوصول أو التكامل أو الإطلاق.",
      "تريدون سعراً ثابتاً «سحرياً» دون استكشاف مسارات بيانات وقيود حقيقية.",
    ],
    diagramSectionTitle: "مخططات أنظمة يمكن فحصها",
    diagramLead:
      "نبيع نموذج التشغيل بقدر ما نبيع الميزة. هذه المخططات توضّح ما الذي يجب أن يوجد فعلاً قبل الوثوق بمساعد خاص أو أتمتة في بيئة إنتاجية.",
    diagrams: [
      {
        title: "بنية الاسترجاع الداخلي المحكوم",
        diagramType: "architecture",
        explanation:
          "من اليسار إلى اليمين: مصادر معتمدة، طبقة سياسات مفروضة، القنوات المستخدمة، ثم ملكية تشغيلية.",
        columns: [
          {
            label: "معرفة معتمدة",
            body: "سياسات وحقائق منتج وإجراءات ووثائق تسمحون بها صراحة داخل النطاق.",
          },
          {
            label: "طبقة الاسترجاع والسياسات",
            body: "قواعد وصول، وربط بالمصادر، وضوابط تعليمات متوافقة مع الهوية وسياسة البيانات.",
          },
          {
            label: "الواجهة في قنوات العمل الحالية",
            body: "الأسئلة تمر عبر الدردشة أو البوابة أو التذاكر التي تعتمدونها أصلاً — بلا قناة معزولة.",
          },
          {
            label: "سجلات وملكية",
            body: "مراجعة إدارية، وقياس جودة، ومراقبة، وأدلة تشغيل لدعم اليوم التالي.",
          },
        ],
        footer:
          "المقصود ليس الدردشة بحد ذاتها، بل إجابات مضبوطة داخل نموذج تشغيل قابل للتدقيق.",
      },
      {
        title: "حلقة التحكم في أتمتة سير العمل",
        diagramType: "flow",
        explanation:
          "حلقة مغلقة: محفّز → تنسيق → بوابة بشرية → مراقبة. الاستثناءات لا تختفي في البريد الشخصي.",
        columns: [
          {
            label: "حدث مُطلق",
            body: "تذكرة أو نموذج أو تحديث CRM أو وصول مستند يبدأ التدفق.",
          },
          {
            label: "طبقة التنسيق",
            body: "قواعد وتكاملات وإعادة محاولة ومعالجة استثناءات لنقل العمل بين الأنظمة.",
          },
          {
            label: "اعتماد بشري",
            body: "نقاط تحكم مسماة تبقى حيث يلزم الحكم أو السياسة أو التوقيع.",
          },
          {
            label: "مراقبة وتصعيد",
            body: "الفشل يظهر للمالكين مع سجلات وتنبيهات ومسار استعادة موثّق.",
          },
        ],
        footer:
          "المقصود ليس إزالة البشر، بل إزالة النسخ الأعمى مع الإبقاء على السيطرة.",
      },
    ],
    roiSectionTitle: "كيف نؤطر عائد الاستثمار",
    roiLead:
      "لا نبيع الذكاء على حماسٍ مجرّد. نربط القيمة بسير عمل مسمى، وحجم شهري معروف، وكلفة ظاهرة للتأخير أو الخطأ أو وقت المختص.",
    roiFormulaLabel: "الصياغة المعتادة",
    roiFormula:
      "ساعات مستردة + إعادة عمل متجنبة + زمن دورة أسرع - كلفة التنفيذ والدعم",
    roiInputsTitle: "أحضروا هذه الأرقام إلى الاجتماع الأول",
    roiInputs: [
      "اسم العملية ومالكها من جهة الأعمال",
      "الحجم الشهري: تذاكر أو مستندات أو استفسارات",
      "الدقائق المهدورة في كل حالة أو كل مناولة",
      "كلفة الخطأ أو التأخير أو الإجابة الخاطئة",
      "الأنظمة والاعتمادات والقيود الأمنية",
    ],
    roiCards: [
      {
        title: "طاقة مستردة",
        body:
          "ابدؤوا حيث يقضي أصحاب الخبرة وقتهم في تكرار إجابات معتمدة أو نقل البيانات يدوياً بين الأنظمة.",
      },
      {
        title: "استثناءات أقل",
        body:
          "القيمة كثيراً ما تظهر في خفض إعادة العمل، وتقليل التصعيد، وتحسين جاهزية المستندات للتدقيق أو المراجعة المالية.",
      },
      {
        title: "قرارات أسرع",
        body:
          "تحسين زمن الدورة مهم عندما تصبح الاعتمادات أو الالتحاق أو الاستجابة للخدمة عائقاً أمام الإيراد أو التشغيل.",
      },
    ],
    roiReducedTitle: "ما يُخفَّض",
    roiAutomatedTitle: "ما يُؤتمَت",
    roiGainedTitle: "ما يُكتسب",
    roiReduced: [
      "المناولات اليدوية بين الأنظمة عندما يكون المسار موثّقاً وقابلاً للتكرار.",
      "وقت المختص في إجابات سياسات أو منتجات معتمدة تتكرر.",
      "إعادة العمل الناتجة عن غياب أو تضارب حالة بين الفرق.",
    ],
    roiAutomated: [
      "التوجيه وتحديث الحالة والإشعارات بين أنظمة مسماة.",
      "الاسترجاع من مصادر معتمدة مع فحص الهوية والسياسات في الإعداد لا في التلميح فقط.",
      "صفوف استثناءات حيث لا يزال الحكم البشري مطلوباً — لكن مرئية لا مخفية في البريد.",
    ],
    roiGained: [
      "زمن دورة أسرع للسير العمل المسمى مع نقاط قياس واضحة.",
      "قابلية تتبع: سجلات ومصادر وأدلة تشغيل للتشغيل والتدقيق.",
      "مرحلة أولى قابلة للتوسع لأن حدود النطاق كانت صريحة من اليوم الأول.",
    ],
    roiInvestmentScope:
      "الاستثمار دائماً بمحدودية النطاق: استكشاف، ثم مرحلة أولى ضيقة على مسارات حقيقية، ثم التوسع — الجهد والتبعيات تُذكر قبل البناء لا بعده.",
    roiInvestmentProfileTitle: "ملف الاستثمار",
    roiInvestmentVariables: [
      "وقت الإدارة والخبراء لورش التصنيف والاعتمادات.",
      "قدرة IT على التكامل والهوية ونوافذ التغيير.",
      "المفاضلة بين سرعة الإطلاق وعمق السجلات وبوابات المراجعة.",
      "تكلفة التشغيل: نموذج دعم ومسارات تصعيد يختارها العميل أو إستيو.",
    ],
    executionTrace: {
      title: "مثال على مسار التنفيذ",
      happyPath: {
        label: "المسار الطبيعي",
        steps: [
          "طلب",
          "محفّز النظام",
          "توجيه سير العمل",
          "بوابة اعتماد",
          "إجراء النظام",
          "مخرج مسجّل",
        ],
      },
      failurePath: {
        label: "مسار الفشل",
        steps: [
          "استثناء",
          "صف مصنّف",
          "مالك مسمّى",
          "إعادة محاولة أو تصعيد",
          "سجل تدقيق",
        ],
      },
      footer: "الحالة محفوظة في كل انتقال. كل خطوة قابلة للتتبع، كل فشل له مالك، كل مخرج مسجّل. هذا ما يعنيه مستوى الإنتاج.",
    },
    diagramTypeLabels: {
      architecture: "معمارية",
      flow: "تدفق تحكم",
      integration: "خريطة تكامل",
    },
    dealEntryTitle: "اختر مساراً واحداً لكل استفسار",
    dealEntryLead:
      "كل زر يفتح مساراً واضحاً. إن كان طلبكم يجمع عدة مسارات، نوضّح النطاق في الرد — اختاروا الأقرب واذكروا ما في القائمة.",
    dealEntryChecklistLabel: "أدرجوه في أول رسالة",
    qualificationRequiredLabel: "مطلوب في أول رسالة",
    qualificationOptionalLabel: "يُحسّن الجودة",
    scopedEngagementCtaEyebrow: "الخطوة التالية",
    dealEntryCards: [
      {
        title: "تحديد سير عمل يدوي واحد",
        body:
          "استخدموا هذا عندما يكون الاحتكاك بين CRM والمالية والقانوني والتذاكر والبريد أو الجداول.",
        checklist: [
          "اسم العملية ومالكها",
          "الحجم الشهري للمعاملات",
          "أشهر مسار فشل أو استثناء",
        ],
        ctaLabel: "احجز استشارة",
        messageTemplate:
          "نريد تحديد نطاق سير عمل يدوي واحد.\nاسم العملية:\nالمالك من جهة الأعمال:\nالحجم الشهري:\nنقاط الفشل الحالية:\nالأنظمة المعنية:\nالنتيجة المطلوبة:",
        intent: "AUTOMATION",
        qualificationRequired: [
          "اسم العملية ومالك أعمال (شخص مسمّى).",
          "الحجم الشهري أو عدد التذاكر للمسار.",
          "الأنظمة التي يجب لمسها (قراءة/كتابة).",
        ],
        qualificationOptional: [
          "معدل الاستثناء أو التأخير الحالي.",
          "قيود جهة تنظيمية أو أمنية يجب معرفتها من اليوم الأول.",
        ],
      },
      {
        title: "تأهيل مسار المعرفة الداخلية المحكوم",
        body:
          "للفرق التي تحتاج إجابات من سياسات ومنتجات وإجراءات معتمدة — بحدود مصدر وصلاحية، دون إرسال بياناتكم إلى أدوات استهلاكية غير مضبوطة.",
        checklist: [
          "مصادر المعرفة داخل النطاق",
          "مالكو الوصول والأمن",
          "فئات الأسئلة عالية الحساسية",
        ],
        ctaLabel: "احجز استشارة",
        messageTemplate:
          "نريد تأهيل مسار المعرفة الداخلية المحكوم.\nحالة الاستخدام الأساسية:\nمصادر المعرفة المعتمدة:\nالمستخدمون أو الفرق:\nقيود الوصول:\nما الذي يجب ألا يُجاب عنه آلياً:",
        intent: "ENTERPRISE_AI",
        qualificationRequired: [
          "قائمة مصادر معرفة معتمدة (أو «لا يوجد بعد» صراحة).",
          "مالك الهوية/الوصول وتصنيف حدود البيانات.",
          "القنوات التي ستظهر فيها الإجابات (دردشة، بوابة، تذكرة).",
        ],
        qualificationOptional: [
          "فئات أسئلة عالية الخطورة لحظرها أو توجيهها لبشري.",
          "اللغات وسياسة المراجعة للفرق الثنائية.",
        ],
      },
      {
        title: "بناء حالة عائد لمرحلة أولى",
        body:
          "استخدموا هذا عندما تحتاج الإدارة إلى مرحلة ضيقة بمنطق تجاري واضح قبل اعتماد توسعة أوسع.",
        checklist: [
          "راعٍ أو صاحب قرار مسمى",
          "الجهد أو التأخير الحالي",
          "معايير نجاح المرحلة الأولى",
        ],
        ctaLabel: "احجز استشارة",
        messageTemplate:
          "نريد بناء حالة عائد لمرحلة أولى ضيقة في الذكاء المؤسسي أو الأتمتة.\nمرشح المرحلة الأولى:\nصاحب القرار:\nالجهد أو التأخير الحالي:\nكيف يبدو النجاح في المرحلة الأولى:\nالقيود أو التبعيات:",
        intent: "PLATFORM_BUILD",
        qualificationRequired: [
          "راعٍ يستطيع الالتزام بالميزانية ومعايير نجاح المرحلة الأولى.",
          "خط أساس: تأخير أو إعادة عمل أو ساعات مرتبطة بالسير اليوم.",
          "قيود صلبة: تكاملات، امتثال، نافذة إطلاق.",
        ],
        qualificationOptional: [
          "محاولة سابقة وفشلها — ماذا انكسر.",
          "معايير التوسع إذا نجحت المرحلة الأولى.",
        ],
      },
    ],
    mediaPlaceholder: "مرئي",
    finalCtaEyebrow: "الخطوة التالية",
    programCardContinue: "احجز استشارة",
    salesMicro: {
      afterHero:
        "أقوى الاستفسارات تسمّي سير العمل والأنظمة ومن يوقّع في الإنتاج. نساعدكم على صياغة ذلك إن كان النطاق ما زال يتشكّل.",
      afterPractice:
        "ما قرأتموه أعلاه هو ما ننشره — موثّقاً، قابلاً للاختبار، وقابلاً للتسليم لفريقكم.",
      afterPrograms:
        "إن شمل الطلب أكثر من مسار، نوضّح النطاق في الرد حتى يبقى التسعير والتسليم متوقعين.",
      beforeProof: "كل نقطة إثبات أدناه مرتبطة بمخرج يمكن مراجعته قبل الالتزام.",
      afterProof:
        "استخدموا هذه الأنماط لربط متطلباتكم الداخلية — نُوائم نطاق العمل لنفس الهيكل.",
      afterCases:
        "اقرأوا عمود أثر القرار لمعرفة أي موافقة داخلية يفتح كل نمط.",
      afterFit:
        "إن تطابقت معظم نقاط العمود الأيسر، الخطوة التالية استشارة مركّزة — لا دورة مبيعات مفتوحة.",
      afterRoi:
        "لا نختلق عائد استثمار. أحجامكم وقيودكم وحدود المراحل تحدد السعر والجدول. أحضروا أرقاماً لا طموحات عامة.",
      afterDiagrams:
        "إن بدا كثيفاً فذلك مقصود: حدود مسماة، وتسليمات ظاهرة، وتسلسل قابل للتدقيق.",
      beforeDeliverables:
        "ما يلي مخرجات تعاقدية — ما يلزمنا به نطاق العمل، لا قائمة رغبات.",
      processObjection:
        "العملية متعمدة التفصيل. المراحل تتيح التوقف مبكراً بضرر محدود — هذا جواب «كم يستغرق؟»",
    },
    commitmentPanel: {
      title: "ما نحتاجه لبداية قوية",
      body:
        "راعٍ مسمّى، وقائمة أنظمة ضمن النطاق، ونوافذ تغيير واقعية من تقنية المعلومات. إن نقص شيء، نخبركم بما تجهّزوه — نفضّل بداية واضحة على استعجال.",
    },
    preQualification: {
      eyebrow: "قبل الاستفسار",
      mustHaveTitle: "مفيد أن يكون جاهزاً",
      mustHave: [
        "قائمة كتابية بالأنظمة التي يلمسها السير (قراءة وكتابة) — لا «مكدسنا» بلا تسمية.",
        "شخص يستطيع اعتماد الهوية والتكامل والإطلاق خلال أسبوع عمل.",
        "اسم سير عمل واحد وحجم شهري تقريبي — يكفي لتحديد حركة المرحلة الأولى.",
      ],
      nextTitle: "بعد الإرسال",
      next: [
        "تصنيف كتابي حسب المسار — أسئلة محددة، أو توجيه صادق، أو طلب مستند واحد ناقص.",
        "لا مقترح تجاري قبل توثيق جرد التكامل والقيود.",
        "مكالمة تحديد نطاق فقط عندما يجتاز الموجز الحد؛ وإلا مراسلة كتابية.",
      ],
      notAcceptedTitle: "قد نؤجّل إذا",
      notAccepted: [
        "الطلب «استراتيجية ذكاء» فقط بلا سير عمل مسمى أو قائمة أنظمة.",
        "لا أحد يستطيع اعتماد الوصول أو التكامل أو الإطلاق.",
        "سعر وتاريخ ثابتان قبل توثيق النطاق — نُسعّر بعد وضوح الحدود.",
      ],
    },
    dealPathMicro: {
      ENTERPRISE_AI: {
        focus:
          "ذكاء داخلي على مصادر معتمدة — قواعد هوية، وسياسة سجلات، وقنوات تشغّلونها أصلاً.",
        expectation:
          "توقعوا مراجعات وصول، وخطافات حوكمة محتوى، ومرحلة أولى ضيقة قبل أي توسعة مؤسسية.",
      },
      AUTOMATION: {
        focus:
          "سير عمل بين أنظمة مسماة — إعادة محاولة، وصفوف استثناء مرئية، ومسارات تراجع يمكن للتشغيل تنفيذها.",
        expectation:
          "توقعوا خرائط عمل، وجرد تكامل، وإطلاقاً مرحلياً — لا «اربطوه في عطلة نهاية الأسبوع».",
      },
      PLATFORM_BUILD: {
        focus:
          "أدوات داخلية ولوحات وبرامج تقنية حيث يوقع الراعي نجاح المرحلة الأولى كتابياً.",
        expectation:
          "توقعوا منطق عائد لسير عمل واحد أولاً، وتواريخ صلبة، ومعايير توسعة مؤجلة حتى تجتاز المرحلة الأولى.",
      },
    },
    structuredEngagementLine:
      "الإرسال يبدأ حواراً منظماً — نرد بأسئلة أو رؤية ملاءمة أو اقتراح مكالمة. نطاق واضح يعني تسعيراً دقيقاً.",
    closingPressure: {
      title: "نخصّص عدداً محدوداً من البرامج المؤسسية في الوقت نفسه.",
      body: "إن لديكم سير عمل مسمّى وقائمة أنظمة وراعٍ — نرحب بالاستفسار. وإن لم يكن جاهزاً بعد، ننصحكم بما تُجهّزونه قبل نطاق رسمي.",
    },
    scopeControl: "لا نوسّع النطاق أثناء التعاقد دون إعادة تعريف.",
  },
};

const byLocale: Record<AppLocale, MarketingMessages> = { en, ar };

export function getMessages(locale: AppLocale): MarketingMessages {
  return byLocale[locale];
}
