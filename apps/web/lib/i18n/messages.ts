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
    proofSectionTitle: string;
    proofItems: { title: string; body: string }[];
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
    };
    dealPathMicro: {
      ENTERPRISE_AI: { focus: string; expectation: string };
      AUTOMATION: { focus: string; expectation: string };
      PLATFORM_BUILD: { focus: string; expectation: string };
    };
    structuredEngagementLine: string;
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
      "Every engagement includes clearly defined deliverables — documented, reviewed, and handed over with full transparency.",
    howWeWork: "How we work",
    howWeWorkIntro:
      "A structured process designed for clarity, accountability, and predictable outcomes.",
    definitionOfDoneLabel: "Definition of done",
  },
  guidedSectionKicker: "Get started",
  homeMetadataTitleSuffix: "Premium Digital Services & Applied AI | Muscat, Oman",
  about: {
    seoTitle: "About",
    seoDescription:
      "Estio designs and builds digital platforms, content programmes, governed AI creative output, and enterprise-grade automation — from Muscat for GCC organisations that require accountable delivery.",
    kicker: "About Estio",
    h1: "Digital execution and applied AI for organisations that answer to boards, regulators, and customers",
    introP1:
      "Estio is a Muscat-based firm that delivers websites and applications, sustained content and campaigns, AI-assisted creative production under brand and legal guardrails, and private AI and automation tied to your systems and data. We exist because regional enterprises need a supplier who signs up to scope, documents decisions, and ships work that survives internal review — not slide decks and experiments.",
    introP2:
      "We are not a generalist agency pitching trends. We are a delivery partner: named ownership, clear artefacts, and outcomes measured against what you said mattered when the engagement started.",
    principlesKicker: "What we do",
    principlesH2: "Four practices, one standard of delivery",
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
        title: "Enterprise AI and automation",
        body: "Private assistants on approved knowledge, integrations, and workflow automation designed for IT-operated production environments — with access control and auditability built in.",
      },
    ],
    capabilitiesKicker: "How we work",
    capabilitiesH2: "Structure you can hold us to",
    capabilitiesLead:
      "The same operating model applies whether the engagement is a site build or a multi-system automation: agreed scope, visible progress, and no silent scope creep.",
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
    positionKicker: "Why Estio",
    positionH2: "Built for GCC operating reality",
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
    ctaH2: "Start with a direct conversation",
    ctaBody:
      "Describe the outcome you need and the constraints you operate under. We will respond with a concrete view of approach, effort, and timeline — or a referral if another path is better.",
    ctaButton: "Contact Estio",
  },
  contact: {
    seoTitle: "Contact",
    seoDescription:
      "Reach Estio in Muscat for project enquiries. Expect a substantive reply within one business day and a clear view of next steps.",
    kicker: "Contact",
    h1: "Tell us what you need to achieve",
    lead: "Use the form or call. We aim to respond within one business day (Sunday–Thursday, Muscat time). You will get a substantive reply — not an auto-acknowledgement — and, where useful, a short call to clarify scope before any proposal.",
    formH2: "Project definition",
    formLead:
      "State the outcome, constraints, and internal approvals. Specific inputs reduce ambiguity and speed up fit and effort assessment.",
    asideDirectH3: "Prefer phone or WhatsApp?",
    whatsapp: "WhatsApp",
    officeH3: "Office",
    nextH3: "What happens after you send this",
    nextSteps: [
      "Within one business day: written response with initial questions or a time proposal for a 20–30 minute call.",
      "On the call: we confirm objectives, constraints, stakeholders, and whether Estio is the right partner.",
      "If we proceed: a written proposal with scope, milestones, dependencies on your side, and commercial terms.",
    ],
    mapIframeTitle: "Map",
  },
  contactForm: {
    serviceInterestOptions: [
      { value: "WEB_DESIGN_DEVELOPMENT", label: "Website design & development" },
      { value: "CONTENT_CAMPAIGNS", label: "Content creation & campaigns" },
      { value: "AI_CREATIVE", label: "AI creative services" },
      { value: "ENTERPRISE_AI", label: "Enterprise AI & knowledge systems" },
      { value: "AUTOMATION", label: "Workflow automation & integrations" },
      { value: "PLATFORM_BUILD", label: "Platform build & technical programme" },
      { value: "UNSURE", label: "Not sure yet" },
    ],
    successTitle: "Thank you for reaching out",
    successBody:
      "A member of our team will review your enquiry and respond within one business day. For urgent matters, please call or message us on WhatsApp.",
    submitAnother: "Submit another enquiry",
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
    message: "Project brief",
    messagePh:
      "Objectives, systems in scope, constraints, success criteria, and who approves...",
    error:
      "Something went wrong. Please try again or contact us directly at",
    sending: "Sending...",
    submit: "Send enquiry",
    qualificationHeading: "Before you submit",
    qualificationIntro:
      "We prioritise enquiries that include the items below for your selected area — it reduces back-and-forth and tells us if we are the right firm.",
    qualificationRequiredHeading: "Required context for this area",
    qualificationOptionalHeading: "Strongly helps",
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
    },
    intakeProcessEyebrow: "Qualified intake",
    intakeProcessTitle: "You are entering a qualification process",
    intakeProcessBody:
      "Submissions are classified by path and reviewed for fit. Thin briefs receive a short decline or a request for specifics — not an open-ended series of discovery calls.",
    enterprisePreSubmitEyebrow: "Minimum bar",
    enterprisePreSubmitTitle: "Enterprise enquiries we actually respond to",
    enterprisePreSubmitMustHaveTitle: "Confirm you have",
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
      "This does not start delivery. It starts qualification. If you want a generic vendor conversation, say so plainly — we may redirect you.",
    submitEnterpriseDeal: "Submit for qualification",
  },
  servicesListing: {
    seoTitle: "Services",
    seoDescription:
      "Platforms, content programmes, governed AI creative, and enterprise automation — scoped delivery from Estio, Muscat.",
    kicker: "Services",
    h1: "What we build and deliver",
    lead:
      "ESTIO delivers websites and digital platforms, content and campaign execution, AI creative services, and enterprise AI & automation for organisations that expect clear scope and dependable delivery.",
    lead2:
      "Each group below addresses a distinct commercial need: how your business presents itself, how it stays visible in the market, how creative output scales without losing control, and how internal operations become faster and more consistent.",
    learnMore: "Learn more →",
    bottomH2: "Unsure which group applies first?",
    bottomBody:
      "Send a short note on your priority outcome. We will suggest a sequencing of work — sometimes one stream, sometimes two in parallel — with dependencies stated clearly.",
    bottomCta: "Contact Estio",
  },
  faq: {
    seoTitle: "FAQ",
    seoDescription:
      "How Estio prices, starts projects, delivers AI and automation, and what we need from clients — direct answers.",
    kicker: "FAQ",
    h1: "Straight answers",
    lead: "What we are often asked before an engagement begins. If your situation is unusual, ask on the contact page — we prefer specificity to generic FAQs.",
    items: [
      {
        title: "How does pricing work?",
        body: "We price from scope: deliverables, timeline, and risk. You receive a fixed proposal for defined work, or a phased plan with a clear cap per phase. We do not sell open-ended “hours buckets” without a work breakdown. Enterprise AI and automation is typically phased: assessment, proof on a narrow use case, then build.",
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
        body: "For creative AI, we define what may be generated, what must be human-reviewed, and what is out of bounds. For enterprise AI, we ground responses on knowledge you approve, enforce access by role, and log usage where required. We do not train public models on your confidential data without an explicit agreement.",
      },
      {
        title: "Do you work on-site?",
        body: "When the project requires it — workshops, discovery with IT, or launch support. Most delivery is remote with structured checkpoints. We are in Muscat for regional clients who need face-to-face sessions.",
      },
      {
        title: "Who owns the work product?",
        body: "As agreed in the contract: typically you own paid-for deliverables and we retain no rights beyond portfolio reference unless you opt out. Source code and automation configurations are handed over with documentation unless a managed service is contracted separately.",
      },
      {
        title: "What if we need support after launch?",
        body: "We offer defined post-launch periods on web projects. For automation and enterprise AI, we align support SLAs to your operational needs. Ad-hoc requests are scoped as small engagements — not unlimited email support.",
      },
      {
        title: "Do you subcontract everything?",
        body: "No. Estio leads every engagement with in-house accountability. We use specialist resources only where disclosed and where it serves the outcome — never as an undisclosed bait-and-switch.",
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
    title: "Solution tracks",
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
    eyebrow: "Operational systems",
    secondaryCtaLabel: "Enterprise overview",
  },
  enterpriseLanding: {
    heroKicker: "Enterprise systems",
    heroAudienceLine:
      "For CIOs, COOs, and transformation owners who sign off on production change — not slide decks.",
    secondaryCtaLabel: "Review programme paths",
    practiceSectionTitle: "Where this lands in the operating model",
    practiceLead:
      "Enterprise delivery is not a brighter UI. It is a named workflow, a defined knowledge boundary, and an operating model your IT and compliance teams can inspect before rollout.",
    practiceBlocks: [
      {
        title: "Private AI systems",
        body:
          "Assistants and retrieval grounded on corpora you approve — with identity-aware access, logging where required, and deployment patterns that match your security model.",
      },
      {
        title: "Workflow automation",
        body:
          "Documented flows across CRM, ticketing, finance, and messaging — with error handling, monitoring, and rollback paths instead of informal scripts.",
      },
      {
        title: "Internal dashboards & tools",
        body:
          "Operational visibility and handover artefacts: runbooks, escalation paths, and interfaces your teams can sustain after go-live.",
      },
    ],
    proofSectionTitle: "What the buyer can inspect",
    evidenceLabels: {
      case: "Case evidence",
      internal: "Internal measurement",
      simulation: "Simulation / model",
      reference_architecture: "Reference architecture",
    },
    verificationLabels: {
      internal: "Internal control",
      observed: "Observed in delivery",
      repeatable: "Repeatable operating path",
      contractual: "Explicit in contract / SOW",
    },
    decisionSummaryForTeams:
      "This is for teams that own production change — CIOs, COOs, and transformation sponsors accountable to IT and the board.",
    decisionSummaryRequires:
      "Requires: a named sponsor, systems in scope, security constraints stated, and appetite for phased acceptance criteria.",
    decisionSummaryDelivers:
      "Delivers: governed automation or private AI tied to named workflows — with runbooks, logging policy, and traceability — not undifferentiated software.",
    proofItems: [
      {
        title: "Named systems in scope",
        body:
          "Every proposal ties value to real systems, owners, and data paths — not to a generic AI narrative.",
      },
      {
        title: "Explicit access model",
        body:
          "Who can ask, what can be returned, and what must be logged are defined before anything goes live.",
      },
      {
        title: "Acceptance and runbooks",
        body:
          "Success criteria, failure handling, and owner handoff are written into the implementation path.",
      },
      {
        title: "Commercial case",
        body:
          "The pilot case is framed around live volume, delay, rework, and specialist time — not vague efficiency claims.",
      },
    ],
    caseStudiesTitle: "Representative case studies",
    caseStudiesLead:
      "Not logos on a slide. These are the mandate shapes buyers usually bring when they need proof, control, and a narrow path to value.",
    caseStudyLabels: {
      situation: "Situation",
      systems: "Systems",
      proof: "Proof",
      commercial: "Commercial lens",
      problem: "Problem",
      systemBuilt: "System built",
      outcome: "Outcome",
      metrics: "Bounded metrics",
      decisionImpact: "Decision impact",
    },
    caseStudies: [
      {
        kicker: "PRIVATE AI",
        title: "Policy assistant for distributed operations",
        decisionImpact:
          "Enables a go/no-go on enterprise chat for policy: who may ask, what may be cited, and what must never leave the boundary.",
        situation:
          "Teams ask the same policy and product questions across branches, but approved answers live in PDFs, SharePoint folders, and inbox history.",
        systems:
          "Identity provider, approved document store, internal chat or portal, and audit logging.",
        proof:
          "Grounded answers with citations, role-aware access, admin review queue, and runbook for ownership after go-live.",
        commercial:
          "Value comes from faster first-response time, fewer escalations to specialists, and less policy drift between teams.",
      },
      {
        kicker: "AUTOMATION",
        title: "RFQ-to-approval workflow with named checkpoints",
        decisionImpact:
          "Removes ambiguity on cycle time and ownership: commercial can defend status in CRM and finance without inbox archaeology.",
        situation:
          "Commercial teams chase status between CRM, finance, legal, and email, while exceptions disappear into manual follow-up.",
        systems:
          "CRM, finance or ERP approval step, document generation, notifications, and an exception queue.",
        proof:
          "Workflow map, named approval gates, retry handling, failure logging, and rollback path before scale-up.",
        commercial:
          "Value comes from cycle-time compression, fewer manual handoffs, and fewer errors in commercial paperwork.",
      },
      {
        kicker: "BILINGUAL OPS",
        title: "English and Arabic knowledge flow under one control model",
        decisionImpact:
          "Unlocks one governance model for bilingual answers: same sources, same policy, auditable changes — no parallel shadow wikis.",
        situation:
          "Regional teams need consistent answers in both languages, but translation and handoff delay decisions.",
        systems:
          "Approved bilingual knowledge base, assistant layer, ticketing or portal, and a monitoring dashboard.",
        proof:
          "Shared governance for content changes, language-specific evaluation, answer traceability, and staged rollout by team.",
        commercial:
          "Value comes from reduced rework, cleaner onboarding, and more consistent service across locations.",
      },
    ],
    fitSectionTitle: "Fit decision",
    fitSectionLead:
      "Use this to decide whether the engagement model matches how your organisation buys and runs change.",
    fitColumnTitle: "Fit",
    nonFitColumnTitle: "Not a fit",
    fitBullets: [
      "You can name a sponsor, a workflow, and systems in scope.",
      "You want artefacts IT can review: access model, logging, runbooks.",
      "You accept phased rollout with acceptance criteria — not big-bang optimism.",
    ],
    nonFitBullets: [
      "You need a vendor to “just try AI” without a bounded workflow or data boundary.",
      "No owner exists who can approve access, integrations, or go-live.",
      "You want fixed-price magic without discovery on real data paths and constraints.",
    ],
    diagramSectionTitle: "System diagrams buyers can inspect",
    diagramLead:
      "We sell the operating model as much as the feature. These diagrams show what actually has to exist before a private assistant or automation can be trusted in production.",
    diagrams: [
      {
        title: "Private AI assistant architecture",
        diagramType: "architecture",
        explanation:
          "Read left to right: approved corpora, enforced policy layer, channels teams already use, then operational ownership.",
        columns: [
          {
            label: "Approved knowledge",
            body: "Policies, product facts, SOPs, and documents you explicitly allow into scope.",
          },
          {
            label: "Retrieval + policy layer",
            body: "Access rules, source grounding, and prompt controls aligned to identity and data policy.",
          },
          {
            label: "Assistant in work channels",
            body: "Teams ask inside chat, portal, or ticketing flows they already use.",
          },
          {
            label: "Logs + ownership",
            body: "Admin review, quality sampling, monitoring, and runbooks for day-two support.",
          },
        ],
        footer:
          "The point is not chat. The point is controlled answers inside an auditable operating model.",
      },
      {
        title: "Workflow automation control loop",
        diagramType: "flow",
        explanation:
          "A closed loop: trigger → orchestration → human gate → monitoring. Exceptions never disappear into personal inboxes.",
        columns: [
          {
            label: "Trigger event",
            body: "Ticket, form submission, CRM update, or document arrival starts the flow.",
          },
          {
            label: "Orchestration layer",
            body: "Rules, integrations, retries, and exception handling move work between systems.",
          },
          {
            label: "Human approval",
            body: "Named checkpoints remain where judgement, policy, or sign-off is required.",
          },
          {
            label: "Monitoring + escalation",
            body: "Failures surface to owners with logs, alerting, and a documented recovery path.",
          },
        ],
        footer:
          "The point is not removing people. The point is removing blind copy-paste while keeping control.",
      },
    ],
    roiSectionTitle: "How the ROI case is framed",
    roiLead:
      "We do not sell AI on abstract enthusiasm. We frame value against a named workflow, a known monthly volume, and a visible cost of delay, error, or specialist time.",
    roiFormulaLabel: "Typical framing",
    roiFormula:
      "Recovered hours + avoided rework + faster cycle time - implementation and support cost",
    roiInputsTitle: "Bring these numbers to the first meeting",
    roiInputs: [
      "Process name and business owner",
      "Monthly volume, tickets, documents, or enquiries",
      "Minutes lost per case or per handoff",
      "Cost of exception, delay, or wrong answer",
      "Systems, approvals, and security constraints",
    ],
    roiCards: [
      {
        title: "Recovered capacity",
        body:
          "Start where skilled people spend time repeating approved answers or manually moving data between systems.",
      },
      {
        title: "Fewer exceptions",
        body:
          "Value often appears in lower rework, fewer escalations, and cleaner documentation for audit or finance review.",
      },
      {
        title: "Faster decisions",
        body:
          "Cycle-time improvement matters when approvals, onboarding, or service response are blocking revenue or operations.",
      },
    ],
    roiReducedTitle: "What is reduced",
    roiAutomatedTitle: "What is automated",
    roiGainedTitle: "What is gained",
    roiReduced: [
      "Manual handoffs between systems when the path is documented and repeatable.",
      "Specialist time spent answering the same approved policy or product questions.",
      "Rework caused by missing or inconsistent status between teams.",
    ],
    roiAutomated: [
      "Routing, status updates, and notifications between named systems.",
      "Retrieval from approved corpora with policy and identity checks enforced in configuration.",
      "Exception queues where human judgement is still required — but visible, not hidden in email.",
    ],
    roiGained: [
      "Faster cycle time on the named workflow with measurable checkpoints.",
      "Traceability: logs, citations, and runbooks for operations and audit.",
      "A pilot that can expand because scope boundaries were explicit from day one.",
    ],
    roiInvestmentScope:
      "Investment is always scoped: discovery, a narrow pilot on real paths, then scale — effort and dependency are stated before build, not after.",
    roiInvestmentProfileTitle: "Investment profile",
    roiInvestmentVariables: [
      "Executive and SME time for workshops, data classification, and sign-offs.",
      "IT capacity for integrations, identity, and change windows.",
      "Trade-off between speed of rollout and depth of logging / review gates.",
      "Run cost: support model and escalation paths you want Estio or your team to own.",
    ],
    diagramTypeLabels: {
      architecture: "Architecture",
      flow: "Control flow",
      integration: "Integration map",
    },
    dealEntryTitle: "Pick one intake path — we do not merge these in email",
    dealEntryLead:
      "Each card is a different qualification. If your note mixes automation, assistant, and “strategy”, we ask you to split it or we decline. That is how both sides avoid wasted quarters.",
    dealEntryChecklistLabel: "Include in your first note",
    qualificationRequiredLabel: "Required in your first note",
    qualificationOptionalLabel: "Strongly helps",
    scopedEngagementCtaEyebrow: "Qualified intake",
    dealEntryCards: [
      {
        title: "Scope one manual workflow",
        body:
          "Use this when the friction sits between CRM, finance, legal, ticketing, email, or spreadsheet handoffs.",
        checklist: [
          "Process name and owner",
          "Monthly transaction volume",
          "Common failure or exception path",
        ],
        ctaLabel: "Start workflow qualification",
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
          "Use this when teams need faster answers from approved policies, products, or procedures without exposing data to uncontrolled tools.",
        checklist: [
          "Knowledge sources in scope",
          "Access and security owners",
          "High-risk question categories",
        ],
        ctaLabel: "Start assistant qualification",
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
          "Use this when leadership needs a narrow pilot with commercial logic before approving a broader rollout.",
        checklist: [
          "Named sponsor or decision-maker",
          "Baseline effort or delay today",
          "Success criteria for phase one",
        ],
        ctaLabel: "Start pilot ROI qualification",
        messageTemplate:
          "We want to build the ROI case for a narrow enterprise AI or automation pilot.\nPilot candidate:\nDecision-maker:\nCurrent effort or delay:\nWhat success would look like in phase one:\nConstraints or dependencies:",
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
    finalCtaEyebrow: "Deal entry",
    programCardContinue: "Continue",
    salesMicro: {
      afterHero:
        "If the problem is unnamed, the system will be wrong. Name the workflow, the systems, and who signs off when it fails in production.",
      afterPractice:
        "This is operational reality — not an interface layer on top of informal email and spreadsheets.",
      afterPrograms:
        "Each programme path has different qualification. Pick one concrete motion; we do not merge paths in the first conversation.",
      beforeProof: "Proof you can inspect — not claims you have to trust.",
      afterProof:
        "This is not theoretical. It is how scope, evidence, and acceptance are set before build.",
      afterCases:
        "Read decision impact first. If you cannot map it to a vote you need internally, pause before you enquire.",
      afterFit:
        "If you cannot name systems in scope and an internal owner for access, this will not move forward.",
      afterRoi:
        "We do not invent ROI. Your volumes, constraints, and phase boundaries determine price and timeline.",
      afterDiagrams:
        "If this looks heavy, that is the point: named boundaries, visible hand-offs, and an order of operations you can audit. Hand-wavy “platform” diagrams are how eighteen-month failures start.",
      beforeDeliverables:
        "Deliverables below are what the contract holds us to — not a capabilities wish list.",
      processObjection:
        "Heavy on purpose: light engagements create silent production failures. Phases exist so you can stop early without collateral damage — that is the answer to “how long”.",
    },
    commitmentPanel: {
      title: "What we expect before we commit capacity",
      body:
        "A named sponsor with authority to escalate or commit budget. A written list of systems in scope. Realistic IT change windows. Without those three, we decline — it saves both organisations months of friction.",
    },
    preQualification: {
      eyebrow: "Before you use the buttons below",
      mustHaveTitle: "What you must have",
      mustHave: [
        "Systems in scope, named — integrations are not guessed in a workshop.",
        "Internal owner for access, data classification, and go-live approval.",
        "Timeline realism: discovery, narrow pilot, then scale — not organisation-wide instant rollout.",
      ],
      nextTitle: "What happens next",
      next: [
        "Structured written response tied to the path you chose — not a brochure email.",
        "A short alignment call only if the brief clears the bar.",
        "Proposal with phases, dependencies on your side, and explicit acceptance tests for phase one.",
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
      "This is a structured engagement, not a generic consultation.",
  },
};

const ar: MarketingMessages = {
  skipToMain: "تخطي إلى المحتوى الرئيسي",
  breadcrumbAria: "مسار التنقل",
  breadcrumbHome: "الرئيسية",
  serviceDetail: {
    allServices: "صفحة الخدمات",
    viewAllServices: "عرض صفحة الخدمات",
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
  guidedSectionKicker: "اختر المسار",
  homeMetadataTitleSuffix: "خدمات رقمية وتطبيقات ذكاء اصطناعي | مسقط، عُمان",
  about: {
    seoTitle: "من نحن",
    seoDescription:
      "إستيو: منصّات رقمية، برامج محتوى، إبداع بذكاء محكوم، وأتمتة مؤسسية — من مسقط لمؤسسات الخليج التي تطلب تسليماً موثّقاً ومساءلة واضحة.",
    kicker: "عن إستيو",
    h1: "تنفيذ رقمي وذكاء تطبيقي لمؤسسات تقدّم تقاريرها لمجالس الإدارة والجهات التنظيمية",
    introP1:
      "إستيو شركة في القرم، مسقط: ننفّذ مواقع وتطبيقات ويب، وبرامج محتوى وحملات مستمرة، وإنتاجاً إبداعياً بمساعدة ذكاء اصطناعي ضمن حدود العلامة والالتزام القانوني، وذكاءً مؤسسياً وأتمتة مربوطة بأنظمتكم وبياناتكم. وجودنا مبرّر لأن المؤسسة الإقليمية تحتاج مورّداً يوقّع على نطاق، ويوثّق القرار، ويسلّم عملاً يصمد أمام المراجعة الداخلية — لا عروضاً ولا تجارب معزولة.",
    introP2:
      "لسنا وكالة عامة تبيع «الاتجاهات». نحن شريك تنفيذ: مسؤول مسمّى، وثائق واضحة، ومقاييس ترتبط بما اتفقنا أنه الهدف عند بدء التعاقد.",
    principlesKicker: "ماذا ننفّذ",
    principlesH2: "أربعة مجالات، ومعيار تسليم واحد",
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
        title: "ذكاء مؤسسي وأتمتة",
        body: "مساعد على معرفة معتمدة، وتكاملات، وأتمتة سير عمل لبيئات يشغّلها IT — مع صلاحيات وسجلات تدقيق.",
      },
    ],
    capabilitiesKicker: "كيف نعمل",
    capabilitiesH2: "إطار يمكن محاسبتنا عليه",
    capabilitiesLead:
      "نفس الأسلوب في مشروع موقع أو في أتمتة متعددة الأنظمة: نطاق معلن، وتقدّم ظاهر، ولا توسّع صامت للنطاق.",
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
    ctaH2: "ابدأوا بحوار مباشر",
    ctaBody:
      "صفوا النتيجة المطلوبة والقيود التي تعملون ضمنها. نرد برؤية عملية للمسار والجهد والجدول — أو بتوجيه إن كان مسار آخر أنسب.",
    ctaButton: "تواصل مع إستيو",
  },
  contact: {
    seoTitle: "اتصل بنا",
    seoDescription:
      "التواصل مع إستيو في مسقط لطلبات المشاريع — ردّ ذو معنى خلال يوم عمل ومسار تالٍ واضح.",
    kicker: "التواصل",
    h1: "صفوا المطلوب تحقيقه",
    lead:
      "عبر النموذج أو الهاتف. نستهدف الرد خلال يوم عمل واحد (الأحد–الخميس بتوقيت مسقط). يصلكم ردّ مفيد — لا رسالة آلية فقط — وعند الحاجة اتصال قصير لضبط النطاق قبل أي مقترح.",
    formH2: "تعريف المشروع",
    formLead:
      "اذكروا النتيجة المطلوبة والقيود والاعتمادات الداخلية. التفاصيل تقلل الغموض وتسرّع تقييم الملاءمة والجهد.",
    asideDirectH3: "هاتف أو واتساب؟",
    whatsapp: "واتساب",
    officeH3: "الموقع",
    nextH3: "بعد إرسال الطلب",
    nextSteps: [
      "خلال يوم عمل: ردّ كتابي بأسئلة أولية أو اقتراح وقت لاتصال 20–30 دقيقة.",
      "في الاتصال: تأكيد الأهداف والقيود وأصحاب المصلحة وهل إستيو الشريك المناسب.",
      "إن اتفقنا على المتابعة: مقترح كتابي بالنطاق والمراحل والتبعيات من جهتكم والشروط التجارية.",
    ],
    mapIframeTitle: "موقع المكتب على الخريطة",
  },
  contactForm: {
    serviceInterestOptions: [
      { value: "WEB_DESIGN_DEVELOPMENT", label: "تصميم وتطوير المواقع" },
      { value: "CONTENT_CAMPAIGNS", label: "المحتوى والحملات" },
      { value: "AI_CREATIVE", label: "إبداع معزّز بالذكاء" },
      { value: "ENTERPRISE_AI", label: "ذكاء مؤسسي وأنظمة معرفة" },
      { value: "AUTOMATION", label: "أتمتة سير العمل والتكاملات" },
      { value: "PLATFORM_BUILD", label: "بناء منصة وبرنامج تقني" },
      { value: "UNSURE", label: "لم يُحدَّد بعد" },
    ],
    successTitle: "تم استلام رسالتكم",
    successBody:
      "سيتابع فريقنا الاستفسار ويعود إليكم خلال يوم عمل واحد. للعاجل، يُرجى الاتصال أو التواصل عبر واتساب.",
    submitAnother: "إرسال استفسار جديد",
    name: "الاسم الكامل",
    namePh: "الاسم كما يظهر في المراسلات",
    email: "البريد المهني",
    emailPh: "name@company.com",
    phone: "الهاتف (اختياري)",
    phonePh: "+968 …",
    company: "الشركة أو الجهة",
    companyPh: "اسم المؤسسة",
    interest: "مجال الاهتمام",
    interestPlaceholder: "اختروا مجالًا",
    message: "موجز المشروع",
    messagePh: "الأهداف، الأنظمة ضمن النطاق، القيود، معايير النجاح، ومن يعتمد…",
    error: "تعذّر الإرسال. أعيدوا المحاولة أو راسلونا على",
    sending: "جارٍ الإرسال…",
    submit: "إرسال الاستفسار",
    qualificationHeading: "قبل الإرسال",
    qualificationIntro:
      "نرجّح الطلبات التي تتضمن البنود أدناه حسب المجال المختار — يقلل الرسائل ذهاباً وإياباً ويوضح إن كنا الشريك المناسب.",
    qualificationRequiredHeading: "السياق المطلوب لهذا المجال",
    qualificationOptionalHeading: "يُحسّن الجودة بشكل كبير",
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
    },
    intakeProcessEyebrow: "استقبال مؤهّل",
    intakeProcessTitle: "أنتم تدخلون مسار تأهيل",
    intakeProcessBody:
      "نصنّف الطلبات حسب المسار ونراجع الملاءمة. الموجزات الضعيفة تتلقى رفضاً موجزاً أو طلب تفاصيل — لا سلسلة مكالمات استكشاف مفتوحة.",
    enterprisePreSubmitEyebrow: "الحد الأدنى",
    enterprisePreSubmitTitle: "استفسارات المؤسسات التي نردّ عليها فعلياً",
    enterprisePreSubmitMustHaveTitle: "أكّدوا أن لديكم",
    enterprisePreSubmitMustHave: [
      "أنظمة مسماة ضمن النطاق — لا «مكدسنا» بشكل مجرد.",
      "مالكاً داخلياً يجيب عن الوصول والتكامل خلال أسبوع عمل.",
      "توقعاً أن القيمة الأولى بشكل مرحلة أولى: مراحل، قياس، ثم توسعة.",
    ],
    enterprisePreSubmitNextTitle: "بعد الإرسال",
    enterprisePreSubmitNext: [
      "ردّ كتابي بأسئلة خاصة بالمسار — أو رفض مهذب.",
      "لا مقترح تجاري قبل أن تكون حدود النطاق صريحة.",
      "الشروط التجارية فقط بعد الاتفاق كتابياً على اختبارات قبول المرحلة الأولى.",
    ],
    structuredEngagementBeforeSubmit:
      "هذا لا يبدأ التنفيذ. يبدأ التأهيل. إن أردتم حوار مورّد عام، اذكروا ذلك صراحة — قد نحوّلكم.",
    submitEnterpriseDeal: "إرسال للتأهيل",
  },
  servicesListing: {
    seoTitle: "الخدمات",
    seoDescription:
      "منصّات، برامج محتوى، إبداع بذكاء محكوم، وأتمتة مؤسسية — نطاق معلن من إستيو، مسقط.",
    kicker: "الخدمات",
    h1: "ما الذي نبنيه وننفّذه",
    lead:
      "تقدّم إستيو مواقع ومنصّات رقمية، وتنفيذ محتوى وحملات، وخدمات إبداع بالذكاء الاصطناعي، والذكاء المؤسسي والأتمتة للجهات التي تريد نطاقاً واضحاً وتسليماً يمكن الاعتماد عليه.",
    lead2:
      "كل مجموعة أدناه تعالج حاجة تجارية مختلفة: كيف تظهرون رقمياً، وكيف تحافظون على حضوركم في السوق، وكيف تزيدون الإنتاج الإبداعي دون فقدان السيطرة، وكيف تصبح العمليات الداخلية أسرع وأكثر اتساقاً.",
    learnMore: "التفاصيل ←",
    bottomH2: "غير متأكدين أين تبدأون؟",
    bottomBody:
      "أرسلوا ملخّصاً للنتيجة المطلوبة. نقترح ترتيب العمل — أحياناً مسار واحد، وأحياناً مساران متوازيان — مع ذكر التبعيات بوضوح.",
    bottomCta: "تواصل مع إستيو",
  },
  faq: {
    seoTitle: "الأسئلة الشائعة",
    seoDescription:
      "التسعير، بداية المشاريع، الذكاء والأتمتة، وما نحتاجه من العميل — إجابات مباشرة.",
    kicker: "الأسئلة الشائعة",
    h1: "إجابات مباشرة",
    lead: "ما يُكرّر سؤاله قبل التعاقد. إن كان وضعكم استثنائياً، استخدموا صفحة التواصل — نفضّل التفاصيل على الإجابات العامة.",
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
        body: "فترات تثبيت معلنة لمشاريع الويب. للأتمتة والذكاء نربط اتفاق الدعم باحتياج التشغيل. الطلبات المؤقتة تُ scoped كمشاريع صغيرة — ليست دعماً بريدياً غير محدود.",
      },
      {
        title: "هل تستأجرون كل شيء خارجياً؟",
        body: "لا. إستيو يقود كل تعاقد بمساءلة داخلية. نستخدم تخصصاً خارجياً فقط حيث يُعلَن ويخدم المخرج — لا استبدالاً خفياً.",
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
    title: "مسارات التنفيذ",
    deepLinks: [
      {
        label: "مساعد ذكاء خاص",
        description:
          "إجابات من معرفتكم المعتمدة، بصلاحيات وسجلات، وربط بالقنوات التي يستخدمها فريقكم أصلاً.",
      },
      {
        label: "أتمتة سير العمل",
        description:
          "تدفقات كاملة عبر CRM والعمليات والمراسلات — مع معالجة أخطاء ومراقبة وأدلة تشغيل يمتلكها فريق تقنيتكم.",
      },
    ],
  },
  homeEnterpriseBridge: {
    eyebrow: "أنظمة تشغيلية",
    secondaryCtaLabel: "نظرة على المؤسسات",
  },
  enterpriseLanding: {
    heroKicker: "أنظمة مؤسسية",
    heroAudienceLine:
      "لرؤساء تقنية وتشغيل وتحول يوقعون على تغيير إنتاجي — لا على شرائح عرض.",
    secondaryCtaLabel: "مراجعة مسارات البرامج",
    practiceSectionTitle: "أين يهبط هذا داخل نموذج التشغيل",
    practiceLead:
      "التسليم المؤسسي ليس واجهة أجمل. بل سير عمل مسمى، وحدود معرفة واضحة، ونموذج تشغيل يستطيع فريق التقنية والالتزام فحصه قبل الإطلاق.",
    practiceBlocks: [
      {
        title: "أنظمة ذكاء خاصة",
        body:
          "مساعدة واسترجاع مرتبطان بمصادر تعتمدونها — بصلاحيات هوية وسجلات عند الحاجة وأنماط نشر تناسب نموذج الأمن لديكم.",
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
    proofSectionTitle: "ما يستطيع المشتري فحصه",
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
        kicker: "ذكاء خاص",
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
        title: "سير RFQ إلى الاعتماد مع نقاط تحكم مسماة",
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
    fitSectionTitle: "قرار الملاءمة",
    fitSectionLead:
      "لتحديد ما إذا كان نموذج التعاقد يتوافق مع كيفية شراء مؤسستكم وتشغيل التغيير.",
    fitColumnTitle: "ملاءم",
    nonFitColumnTitle: "غير ملاءم",
    fitBullets: [
      "يمكنكم تسمية راعٍ وسير عمل وأنظمة ضمن النطاق.",
      "تريدون أدلة يستطيع فريق IT مراجعتها: نموذج وصول، وسجلات، وأدلة تشغيل.",
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
        title: "معمارية المساعد الخاص",
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
            label: "المساعد داخل قنوات العمل",
            body: "الفرق تسأل من داخل الدردشة أو البوابة أو مسارات التذاكر التي تستخدمها أصلاً.",
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
    diagramTypeLabels: {
      architecture: "معمارية",
      flow: "تدفق تحكم",
      integration: "خريطة تكامل",
    },
    dealEntryTitle: "مدخل واحد فقط — لا ندمج المسارات في بريد واحد",
    dealEntryLead:
      "كل بطاقة تأهيل مختلف. إن خلطتم الأتمتة والمساعد و«الاستراتيجية» في رسالة واحدة نطلب تقسيم الموجز أو نرفض. هكذا يتجنب الطرفان أرباعاً ضائعة.",
    dealEntryChecklistLabel: "أدرجوه في أول رسالة",
    qualificationRequiredLabel: "مطلوب في أول رسالة",
    qualificationOptionalLabel: "يُحسّن الجودة",
    scopedEngagementCtaEyebrow: "استقبال مؤهّل",
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
        ctaLabel: "بدء تأهيل سير العمل",
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
        title: "تقييم مساعد ذكاء خاص",
        body:
          "استخدموا هذا عندما تحتاج الفرق إلى إجابات أسرع من سياسات أو منتجات أو إجراءات معتمدة دون تعريض البيانات لأدوات غير مضبوطة.",
        checklist: [
          "مصادر المعرفة داخل النطاق",
          "مالكو الوصول والأمن",
          "فئات الأسئلة عالية الحساسية",
        ],
        ctaLabel: "بدء تأهيل المساعد",
        messageTemplate:
          "نريد تقييم مساعد ذكاء خاص.\nحالة الاستخدام الأساسية:\nمصادر المعرفة المعتمدة:\nالمستخدمون أو الفرق:\nقيود الوصول:\nما الذي يجب ألا يفعله المساعد أبداً:",
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
        ctaLabel: "بدء تأهيل عائد المرحلة الأولى",
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
    finalCtaEyebrow: "مدخل الصفقة",
    programCardContinue: "متابعة",
    salesMicro: {
      afterHero:
        "إن لم تُسمَّ المشكلة، سيكون النظام خاطئاً. سمّوا سير العمل والأنظمة ومن يوقع عند الفشل في الإنتاج.",
      afterPractice:
        "هذا واقع تشغيلي — لا طبقة واجهة فوق بريد وجداول غير رسمية.",
      afterPrograms:
        "لكل مسار برنامج تأهيل مختلف. اختاروا حركة واحدة ملموسة؛ لا ندمج المسارات في أول محادثة.",
      beforeProof: "إثبات يمكن فحصه — لا ادعاءات تُسلَّم بالثقة فقط.",
      afterProof:
        "هذا ليس نظرياً. هكذا يُضبط النطاق والإثبات والقبول قبل البناء.",
      afterCases:
        "اقرأوا أثر القرار أولاً. إن لم تربطوه بصوت داخلي تحتاجون الفوز به، توقفوا قبل الاستفسار.",
      afterFit:
        "إن لم تستطيعوا تسمية أنظمة ضمن النطاق ومالك داخلي للوصول، لن يتقدّم الطلب.",
      afterRoi:
        "لا نخترع عائد استثمار. أحجامكم وقيودكم وحدود المراحل تحدد السعر والجدول.",
      afterDiagrams:
        "إن بدا ثقيلاً فذلك مقصود: حدود مسماة، وتسليمات ظاهرة، وتسلسل يمكن تدقيقه. مخططات «منصة» الضبابية هي بداية فشل لاثني عشر شهراً.",
      beforeDeliverables:
        "المخرجات أدناه هي ما يلزمنا به العقد — لا قائمة أمنيات قدرات.",
      processObjection:
        "الثقل مقصود: التعاقدات الخفيفة تولّد فشلاً صامتاً في الإنتاج. المراحل لتتمكنوا من التوقف مبكراً بضرر محدود — هذا جواب «كم يستغرق؟».",
    },
    commitmentPanel: {
      title: "ما نتوقعه قبل أن نخصص سعة",
      body:
        "راعٍ مسمّى بصلاحية التصعيد أو الالتزام بالميزانية. قائمة كتابية بالأنظمة ضمن النطاق. نوافذ تغيير واقعية من IT. بدونها نرفض — يوفر ذلك أشهر احتكاك لكلا الطرفين.",
    },
    preQualification: {
      eyebrow: "قبل استخدام الأزرار أدناه",
      mustHaveTitle: "ما يجب أن يتوفر",
      mustHave: [
        "أنظمة مسماة ضمن النطاق — التكاملات لا تُخمَّن في ورشة.",
        "مالك داخلي للوصول، وتصنيف البيانات، واعتماد الإطلاق.",
        "واقعية زمنية: استكشاف، مرحلة أولى ضيقة، ثم توسعة — لا إطلاق فوري على المؤسسة كاملة.",
      ],
      nextTitle: "ماذا يحدث بعد ذلك",
      next: [
        "ردّ كتابي مرتبط بالمسار الذي اخترتموه — لا بريد كتيب.",
        "اتصال توضيحي قصير فقط إذا اجتاز الموجز الحدّ.",
        "مقترح بمراحل وتبعيات من جهتكم واختبارات قبول صريحة للمرحلة الأولى.",
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
      "هذا تعاقد منظم، لا استشارة عامة.",
  },
};

const byLocale: Record<AppLocale, MarketingMessages> = { en, ar };

export function getMessages(locale: AppLocale): MarketingMessages {
  return byLocale[locale];
}
