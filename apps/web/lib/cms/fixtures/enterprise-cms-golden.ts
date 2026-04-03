import type { MarketingPageSectionsCMS } from "@/lib/cms/types";

/**
 * Canonical enterprise `Page.sections` fragment for regression tests.
 * Anonymized; covers proof, cases, ROI, fit, deal entry, diagrams, decision summary.
 */
export const enterpriseCmsGoldenFixture: MarketingPageSectionsCMS = {
  enterpriseAudience:
    "For operations and IT sponsors who need bounded workflow automation or governed retrieval — not undifferentiated software rollouts.",
  enterpriseDecisionSummary: {
    forTeams:
      "This is for teams that own production change and can name systems, owners, and acceptance criteria.",
    requires:
      "Requires: a named sponsor, in-scope systems, security constraints, and appetite for phased delivery.",
    delivers:
      "Delivers: traceable workflows or assistants with runbooks — bounded scope, not open-ended build.",
  },
  enterpriseProofEngine: {
    title: "What a buyer can inspect",
    items: [
      {
        claim: "Every scope ties to named systems and data paths",
        metric: "Written mapping from workflow step → system → owner before build.",
        evidenceType: "reference_architecture",
        verification: {
          level: "internal",
          note: "Captured in discovery pack; not a third-party audit.",
        },
        visual: {
          assetRole: "diagram",
          assetPurpose: "explanation",
          assetPriority: "supporting",
        },
      },
      {
        claim: "Access and logging policy is defined before go-live",
        metric: "Documented who may invoke, what may be returned, and retention posture.",
        evidenceType: "internal",
        verification: { level: "observed", note: "Reviewed in pilot cutover checklist." },
      },
      {
        claim: "Pilot framed on live volume, not slides",
        metric: "Monthly volume, minutes per case, and exception rate captured for one path.",
        evidenceType: "simulation",
        verification: { level: "repeatable", note: "Same workshop template across programmes." },
      },
    ],
  },
  enterpriseFit: {
    title: "Fit decision",
    lead: "Use this block to disqualify politely — fewer unqualified conversations.",
    fitTitle: "Good fit",
    nonFitTitle: "Usually not a fit",
    fit: [
      "You can name the workflow and the business owner.",
      "You accept phased delivery with written acceptance criteria.",
    ],
    nonFit: [
      "Looking for a generic chatbot without knowledge boundaries.",
      "No sponsor who can commit scope or sign off a pilot.",
    ],
  },
  enterpriseCaseStudies: {
    title: "Representative cases",
    lead: "Operational shape only — no client identifiers.",
    items: [
      {
        kicker: "PRIVATE AI",
        title: "Policy Q&A for distributed teams",
        problem: "Approved answers scattered across PDFs, folders, and inbox history.",
        systemBuilt: "Retrieval over approved corpus, identity-aware access, review queue.",
        outcome: "First-line answers with citations; escalations routed with context.",
        decisionImpact:
          "Enables go/no-go on enterprise chat: boundary, citations, and blocklist are explicit.",
        metrics: ["Reduced specialist interruptions for tier-1 policy questions."],
        visual: {
          imageUrl: "https://example.invalid/case-a.svg",
          imageAlt: "Diagram: policy retrieval boundary",
          assetRole: "case",
          assetPurpose: "trust",
          assetPriority: "supporting",
        },
      },
      {
        kicker: "AUTOMATION",
        title: "RFQ-to-approval with named gates",
        problem: "Status chased across CRM, finance, and email; exceptions vanish.",
        systemBuilt: "Orchestrated steps, human approvals, exception queue, logging.",
        outcome: "Cycle time visible in CRM; fewer manual status threads.",
        decisionImpact:
          "Removes ambiguity on ownership and delay — commercial can defend status without inbox archaeology.",
        metrics: ["Fewer manual handoffs on the RFQ path."],
      },
    ],
  },
  enterpriseRoi: {
    title: "How ROI is framed",
    lead: "Qualitative operating deltas — no fabricated percentages in CMS.",
    formulaLabel: "Framing",
    formula: "Recovered time + fewer exceptions + faster cycle − scoped implementation effort",
    inputsTitle: "Bring to first workshop",
    inputs: ["Process name", "Monthly volume", "Minutes per case", "Systems in scope"],
    investmentProfile: {
      scope:
        "Discovery, narrow pilot on real traffic, then scale — dependencies stated before build.",
      variables: [
        "SME and sponsor time for workshops and sign-offs.",
        "IT windows for integrations and identity changes.",
      ],
    },
    reduced: ["Manual status chasing between teams."],
    automated: ["Routed updates between named systems."],
    gained: ["Measurable checkpoints on the named workflow."],
    reducedTitle: "Reduced",
    automatedTitle: "Automated",
    gainedTitle: "Gained",
  },
  enterpriseDealEntry: {
    title: "Choose an entry point",
    lead: "Open with one concrete motion — we match it to the right first phase.",
    checklistLabel: "Include in your brief",
    items: [
      {
        title: "Scope one manual workflow",
        body: "When friction is between CRM, finance, ticketing, or spreadsheets.",
        intent: "AUTOMATION",
        ctaLabel: "Start qualification",
        messageTemplate: "We want to scope one workflow.\nProcess:\nOwner:\nVolume:\nSystems:",
        checklist: ["Process name", "Owner", "Monthly volume"],
        qualification: {
          required: ["Named process owner.", "Systems touched (read/write)."],
          optional: ["Typical delay or exception rate today."],
        },
      },
      {
        title: "Assess private assistant fit",
        body: "When answers must stay inside approved corpora and channels.",
        intent: "ENTERPRISE_AI",
        ctaLabel: "Start qualification",
        messageTemplate: "We want to assess a private assistant.\nSources:\nChannels:\nConstraints:",
        checklist: ["Knowledge sources", "Access owner", "Channels"],
        qualification: {
          required: ["Source list or explicit none yet.", "Identity / access owner."],
          optional: ["High-risk question categories."],
        },
      },
    ],
  },
  enterpriseDiagrams: {
    title: "How the system reads",
    lead: "Each diagram includes type + explanation on the public page.",
    items: [
      {
        title: "Control plane overview",
        diagramType: "architecture",
        explanation:
          "Shows where policy, identity, and content boundaries sit relative to user channels.",
        columns: [
          { label: "Sources", body: "Approved corpora and systems of record." },
          { label: "Control", body: "Access rules, logging, review queues." },
        ],
        footer: "Not a product map — an operating boundary map.",
      },
      {
        title: "Workflow loop",
        diagramType: "flow",
        explanation: "Trigger → orchestration → human gate → monitoring.",
        columns: [],
        footer: "",
      },
    ],
  },
  enterpriseVisuals: {
    systemDiagram: {
      imageUrl: "https://example.invalid/system-diagram.svg",
      imageAlt: "Reference architecture diagram",
      assetRole: "diagram",
      assetPurpose: "explanation",
      assetPriority: "critical",
    },
  },
  enterprisePractice: {
    title: "Practice pillars",
    lead: "How delivery is organised.",
    blocks: [
      { title: "Private AI", body: "Grounded assistants with explicit boundaries." },
      { title: "Automation", body: "Documented integrations and exception paths." },
    ],
  },
  enterpriseProof: {
    title: "Legacy strip",
    items: [{ title: "Legacy A", body: "Fallback when proof engine empty in CMS." }],
  },
};
