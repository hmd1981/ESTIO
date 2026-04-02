import type {
  CmsVisual,
  EnterpriseDiagramType,
  EnterpriseEvidenceType,
  EnterpriseVerificationLevel,
  HomeListItem,
  MarketingPageSectionsCMS,
} from "@/lib/cms/types";
import { brand } from "@/lib/content/site";
import type { AppLocale } from "@/lib/i18n/config";

function firstNonEmpty(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return "";
}

/** Merge CMS hero copy with i18n fallbacks (about/contact/services intros). */
export function mergeMarketingHero(
  cms: MarketingPageSectionsCMS | undefined,
  fallback: {
    kicker: string;
    h1: string;
    leadP1: string;
    leadP2?: string;
  },
  options?: {
    cmsEn?: MarketingPageSectionsCMS;
    locale?: AppLocale;
  },
) {
  const cmsEn = options?.cmsEn;
  const locale = options?.locale;
  const h1Raw = firstNonEmpty(
    cms?.title,
    locale === "ar" ? cmsEn?.title : undefined,
    fallback.h1,
  );
  const lead1 = firstNonEmpty(
    cms?.lead,
    locale === "ar" ? cmsEn?.lead : undefined,
    fallback.leadP1,
  );
  const lead2 = firstNonEmpty(
    cms?.body,
    locale === "ar" ? cmsEn?.body : undefined,
    fallback.leadP2 ?? "",
  );
  const kicker = firstNonEmpty(
    cms?.kicker,
    locale === "ar" ? cmsEn?.kicker : undefined,
    fallback.kicker,
  );
  const subtitle = firstNonEmpty(
    cms?.subtitle,
    locale === "ar" ? cmsEn?.subtitle : undefined,
  );

  const heroVisual = {
    imageUrl: firstNonEmpty(
      cms?.heroVisual?.imageUrl,
      locale === "ar" ? cmsEn?.heroVisual?.imageUrl : undefined,
    ),
    imageAlt: firstNonEmpty(
      cms?.heroVisual?.imageAlt,
      locale === "ar" ? cmsEn?.heroVisual?.imageAlt : undefined,
    ),
    imageMediaAssetId: firstNonEmpty(
      cms?.heroVisual?.imageMediaAssetId,
      locale === "ar" ? cmsEn?.heroVisual?.imageMediaAssetId : undefined,
    ),
  };

  return {
    kicker: kicker.replace(/^Estio /, `${brand.name} `),
    subtitle,
    h1: h1Raw.replace(/^Estio /, `${brand.name} `),
    leadP1: lead1.replace(/^Estio /, `${brand.name} `),
    leadP2: lead2.replace(/^Estio /, `${brand.name} `),
    heroVisual:
      heroVisual.imageUrl || heroVisual.imageAlt || heroVisual.imageMediaAssetId
        ? heroVisual
        : undefined,
  };
}

/** Office / trust / map — AR → EN CMS → empty */
export function mergeMarketingContactBlocks(
  cms: MarketingPageSectionsCMS | undefined,
  cmsEn: MarketingPageSectionsCMS | undefined,
  locale: AppLocale,
) {
  return {
    officeVisual: {
      imageUrl: firstNonEmpty(
        cms?.officeVisual?.imageUrl,
        locale === "ar" ? cmsEn?.officeVisual?.imageUrl : undefined,
      ),
      imageAlt: firstNonEmpty(
        cms?.officeVisual?.imageAlt,
        locale === "ar" ? cmsEn?.officeVisual?.imageAlt : undefined,
      ),
      imageMediaAssetId: firstNonEmpty(
        cms?.officeVisual?.imageMediaAssetId,
        locale === "ar" ? cmsEn?.officeVisual?.imageMediaAssetId : undefined,
      ),
    },
    trustVisual: {
      imageUrl: firstNonEmpty(
        cms?.trustVisual?.imageUrl,
        locale === "ar" ? cmsEn?.trustVisual?.imageUrl : undefined,
      ),
      imageAlt: firstNonEmpty(
        cms?.trustVisual?.imageAlt,
        locale === "ar" ? cmsEn?.trustVisual?.imageAlt : undefined,
      ),
      imageMediaAssetId: firstNonEmpty(
        cms?.trustVisual?.imageMediaAssetId,
        locale === "ar" ? cmsEn?.trustVisual?.imageMediaAssetId : undefined,
      ),
    },
    mapEmbedUrl: firstNonEmpty(
      cms?.mapEmbedUrl,
      locale === "ar" ? cmsEn?.mapEmbedUrl : undefined,
    ),
  };
}

export function mergeAboutVisuals(
  cms: MarketingPageSectionsCMS | undefined,
  cmsEn: MarketingPageSectionsCMS | undefined,
  locale: AppLocale,
) {
  const av = cms?.aboutVisuals;
  const avEn = locale === "ar" ? cmsEn?.aboutVisuals : undefined;
  const pick = (key: "brand" | "oman" | "delivery") => ({
    imageUrl: firstNonEmpty(av?.[key]?.imageUrl, avEn?.[key]?.imageUrl),
    imageAlt: firstNonEmpty(av?.[key]?.imageAlt, avEn?.[key]?.imageAlt),
    imageMediaAssetId: firstNonEmpty(
      av?.[key]?.imageMediaAssetId,
      avEn?.[key]?.imageMediaAssetId,
    ),
  });
  return {
    brand: pick("brand"),
    oman: pick("oman"),
    delivery: pick("delivery"),
  };
}

export type MergedServiceGroupVisual = {
  groupId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageMediaAssetId?: string;
  /** By service slug (e.g. web-design-development) or `enterprise` for the enterprise card */
  itemImages: Record<
    string,
    CmsVisual & {
      title?: string;
      description?: string;
      href?: string;
    }
  >;
};

/** Merge optional imagery for services overview groups (AR CMS → EN CMS). */
export function mergeMarketingServiceGroups(
  cms: MarketingPageSectionsCMS | undefined,
  cmsEn: MarketingPageSectionsCMS | undefined,
  locale: AppLocale,
  groupIds: string[],
): Record<string, MergedServiceGroupVisual> {
  const out: Record<string, MergedServiceGroupVisual> = {};
  for (const groupId of groupIds) {
    const g = cms?.serviceGroups?.find((x) => x.groupId === groupId);
    const ge =
      locale === "ar"
        ? cmsEn?.serviceGroups?.find((x) => x.groupId === groupId)
        : undefined;
    const slugSet = new Set([
      ...(g?.itemImages?.map((i) => i.slug) ?? []),
      ...(ge?.itemImages?.map((i) => i.slug) ?? []),
    ]);
    const itemImages: Record<string, CmsVisual> = {};
    for (const slug of slugSet) {
      const ii = g?.itemImages?.find((i) => i.slug === slug);
      const iie = ge?.itemImages?.find((i) => i.slug === slug);
      const vis: CmsVisual & {
        title?: string;
        description?: string;
        href?: string;
      } = {
        title: firstNonEmpty(ii?.title, iie?.title),
        description: firstNonEmpty(ii?.description, iie?.description),
        href: firstNonEmpty(ii?.href, iie?.href),
        imageUrl: firstNonEmpty(ii?.imageUrl, iie?.imageUrl),
        imageAlt: firstNonEmpty(ii?.imageAlt, iie?.imageAlt),
        imageMediaAssetId: firstNonEmpty(
          ii?.imageMediaAssetId,
          iie?.imageMediaAssetId,
        ),
      };
      if (
        vis.title ||
        vis.description ||
        vis.href ||
        vis.imageUrl ||
        vis.imageAlt ||
        vis.imageMediaAssetId
      ) {
        itemImages[slug] = vis;
      }
    }
    out[groupId] = {
      groupId,
      title: firstNonEmpty(g?.title, ge?.title),
      description: firstNonEmpty(g?.description, ge?.description),
      imageUrl: firstNonEmpty(g?.imageUrl, ge?.imageUrl),
      imageAlt: firstNonEmpty(g?.imageAlt, ge?.imageAlt),
      imageMediaAssetId: firstNonEmpty(g?.imageMediaAssetId, ge?.imageMediaAssetId),
      itemImages,
    };
  }
  return out;
}

function visualOrEmpty(
  v: CmsVisual | undefined,
  vEn: CmsVisual | undefined,
  locale: AppLocale,
): CmsVisual {
  return {
    imageUrl: firstNonEmpty(v?.imageUrl, locale === "ar" ? vEn?.imageUrl : undefined),
    imageAlt: firstNonEmpty(v?.imageAlt, locale === "ar" ? vEn?.imageAlt : undefined),
    imageMediaAssetId: firstNonEmpty(
      v?.imageMediaAssetId,
      locale === "ar" ? vEn?.imageMediaAssetId : undefined,
    ),
    assetRole: v?.assetRole ?? (locale === "ar" ? vEn?.assetRole : undefined),
    assetPurpose: v?.assetPurpose ?? (locale === "ar" ? vEn?.assetPurpose : undefined),
    assetPriority: v?.assetPriority ?? (locale === "ar" ? vEn?.assetPriority : undefined),
  };
}

export type MergedEnterpriseVisuals = {
  hero: CmsVisual;
  capability: CmsVisual;
  process: CmsVisual;
  systemDiagram: CmsVisual;
  programCards: HomeListItem[];
};

/** Enterprise marketing route visuals (hero, capability strip, process, program cards). */
export function mergeEnterpriseVisuals(
  cms: MarketingPageSectionsCMS | undefined,
  cmsEn: MarketingPageSectionsCMS | undefined,
  locale: AppLocale,
): MergedEnterpriseVisuals {
  const ev = cms?.enterpriseVisuals;
  const evEn = locale === "ar" ? cmsEn?.enterpriseVisuals : undefined;
  const hero = visualOrEmpty(ev?.hero, evEn?.hero, locale);
  const capability = visualOrEmpty(ev?.capability, evEn?.capability, locale);
  const process = visualOrEmpty(ev?.process, evEn?.process, locale);
  const systemDiagram = visualOrEmpty(
    ev?.systemDiagram,
    evEn?.systemDiagram,
    locale,
  );

  const pcA = ev?.programCards ?? [];
  const pcE = evEn?.programCards ?? [];
  const len = Math.max(pcA.length, pcE.length);
  const programCards: HomeListItem[] = [];
  for (let i = 0; i < len; i++) {
    const a = pcA[i];
    const e = pcE[i];
    const card: HomeListItem = {
      title: firstNonEmpty(a?.title, a?.label, locale === "ar" ? e?.title : undefined, e?.label),
      label: firstNonEmpty(a?.label, locale === "ar" ? e?.label : undefined),
      description: firstNonEmpty(
        a?.description,
        locale === "ar" ? e?.description : undefined,
      ),
      href: firstNonEmpty(a?.href, locale === "ar" ? e?.href : undefined),
      imageUrl: firstNonEmpty(a?.imageUrl, locale === "ar" ? e?.imageUrl : undefined),
      imageAlt: firstNonEmpty(a?.imageAlt, locale === "ar" ? e?.imageAlt : undefined),
      imageMediaAssetId: firstNonEmpty(
        a?.imageMediaAssetId,
        locale === "ar" ? e?.imageMediaAssetId : undefined,
      ),
    };
    const has =
      card.title?.trim() ||
      card.label?.trim() ||
      card.description?.trim() ||
      card.href?.trim() ||
      card.imageUrl?.trim();
    if (has) programCards.push(card);
  }

  return { hero, capability, process, systemDiagram, programCards };
}

/** Single practice block after merge (title/body + optional media). */
export type EnterprisePracticeBlockMerged = {
  title: string;
  body: string;
} & CmsVisual;

export type EnterpriseTextCardMerged = {
  title: string;
  body: string;
};

export type EnterpriseProofEngineItemMerged = {
  claim: string;
  metric: string;
  evidenceType: EnterpriseEvidenceType;
  visual: CmsVisual;
  verification: {
    level: EnterpriseVerificationLevel;
    note: string;
  };
};

/** Anonymized case — problem / system / outcome / bounded metrics. */
export type EnterpriseCaseStudyMerged = {
  kicker: string;
  title: string;
  body?: string;
  problem: string;
  systemBuilt: string;
  outcome: string;
  metrics: string[];
  decisionImpact: string;
  visual: CmsVisual;
};

export type EnterpriseDiagramMerged = {
  title: string;
  body?: string;
  /** Merged explanation (CMS explanation || body). */
  explanation: string;
  diagramType: EnterpriseDiagramType;
  columns: Array<{ label: string; body: string }>;
  footer: string;
};

export type EnterpriseRoiMetricMerged = {
  metric: string;
  value: string;
  body: string;
};

export type EnterpriseDealEntryMerged = {
  title: string;
  body: string;
  checklist: string[];
  ctaLabel: string;
  messageTemplate: string;
  /** Contact query `interest` prefill — enterprise intake intents. */
  intent: string;
  qualification: {
    required: string[];
    optional: string[];
  };
};

export type EnterpriseDecisionSummaryMerged = {
  forTeams: string;
  requires: string;
  delivers: string;
};

export type EnterpriseFitMerged = {
  title: string;
  lead: string;
  fitTitle: string;
  nonFitTitle: string;
  fit: string[];
  nonFit: string[];
};

export type MergedEnterpriseLanding = {
  /** Optional “who this is for” — empty hides. */
  audienceLine: string;
  /** Sticky decision strip — at least one line shows bar. */
  decisionSummary: EnterpriseDecisionSummaryMerged;
  proofEngine: {
    title: string;
    items: EnterpriseProofEngineItemMerged[];
  };
  practice: {
    title: string;
    lead: string;
    blocks: EnterprisePracticeBlockMerged[];
  };
  /** Legacy strip — kept for admin / JSON parity; page prefers `proofEngine`. */
  proof: {
    title: string;
    items: { title: string; body: string }[];
  };
  caseStudies: {
    title: string;
    lead: string;
    labels: {
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
    items: EnterpriseCaseStudyMerged[];
  };
  diagrams: {
    title: string;
    lead: string;
    items: EnterpriseDiagramMerged[];
  };
  roi: {
    title: string;
    lead: string;
    formulaLabel: string;
    formula: string;
    inputsTitle: string;
    inputs: string[];
    metrics: EnterpriseRoiMetricMerged[];
    cards: EnterpriseTextCardMerged[];
    reducedTitle: string;
    automatedTitle: string;
    gainedTitle: string;
    reduced: string[];
    automated: string[];
    gained: string[];
    investmentProfile: {
      scope: string;
      variables: string[];
    };
  };
  dealEntry: {
    title: string;
    body?: string;
    lead: string;
    checklistLabel: string;
    primaryCta?: { label: string; href: string } | null;
    secondaryCta?: { label: string; href: string } | null;
    items: EnterpriseDealEntryMerged[];
  };
  fit: EnterpriseFitMerged;
};

function textValue(value: string | { text?: string } | undefined): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && !Array.isArray(value)) {
    const t = (value as { text?: unknown }).text;
    return typeof t === "string" ? t.trim() : "";
  }
  return "";
}

const EVIDENCE_VALUES: EnterpriseEvidenceType[] = [
  "case",
  "internal",
  "simulation",
  "reference_architecture",
];

function normalizeEvidence(raw: string | undefined): EnterpriseEvidenceType {
  const t = raw?.trim();
  if (t && (EVIDENCE_VALUES as readonly string[]).includes(t)) {
    return t as EnterpriseEvidenceType;
  }
  return "reference_architecture";
}

const VERIFICATION_VALUES: EnterpriseVerificationLevel[] = [
  "internal",
  "observed",
  "repeatable",
  "contractual",
];

function normalizeVerificationLevel(
  raw: string | undefined,
): EnterpriseVerificationLevel {
  const t = raw?.trim();
  if (t && (VERIFICATION_VALUES as readonly string[]).includes(t)) {
    return t as EnterpriseVerificationLevel;
  }
  return "internal";
}

const DIAGRAM_TYPES: EnterpriseDiagramType[] = [
  "architecture",
  "flow",
  "integration",
];

function normalizeDiagramType(raw: string | undefined): EnterpriseDiagramType {
  const t = raw?.trim();
  if (t && (DIAGRAM_TYPES as readonly string[]).includes(t)) {
    return t as EnterpriseDiagramType;
  }
  return "architecture";
}

function mergeVisualPartial(
  a: Partial<CmsVisual> | undefined,
  e: Partial<CmsVisual> | undefined,
  locale: AppLocale,
): CmsVisual {
  return {
    imageUrl: firstNonEmpty(a?.imageUrl, locale === "ar" ? e?.imageUrl : undefined),
    imageAlt: firstNonEmpty(a?.imageAlt, locale === "ar" ? e?.imageAlt : undefined),
    imageMediaAssetId: firstNonEmpty(
      a?.imageMediaAssetId,
      locale === "ar" ? e?.imageMediaAssetId : undefined,
    ),
    assetRole: a?.assetRole ?? (locale === "ar" ? e?.assetRole : undefined),
    assetPurpose: a?.assetPurpose ?? (locale === "ar" ? e?.assetPurpose : undefined),
    assetPriority: a?.assetPriority ?? (locale === "ar" ? e?.assetPriority : undefined),
  };
}

function metricLineFromEntry(
  m: string | { text?: string; label?: string; value?: string } | undefined,
): string {
  if (m == null) return "";
  if (typeof m === "string") return m.trim();
  if (typeof m !== "object" || Array.isArray(m)) return "";
  const o = m as { text?: unknown; label?: unknown; value?: unknown };
  const parts = [o.label, o.value, o.text]
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);
  return parts.join(" — ").trim();
}

function resolvedCount(defaultLength: number, ...arrays: ArrayLike<unknown>[]) {
  const configured = arrays.reduce((max, arr) => {
    const len = typeof arr?.length === "number" ? arr.length : 0;
    return len > max ? len : max;
  }, 0);
  return configured > 0 ? configured : defaultLength;
}

/**
 * Merge enterprise landing copy: CMS (with EN fallback for AR) + i18n defaults.
 * Supports proof-driven sections while keeping i18n defaults as the final fallback.
 */
export function mergeEnterpriseLandingSections(
  cms: MarketingPageSectionsCMS | undefined,
  cmsEn: MarketingPageSectionsCMS | undefined,
  locale: AppLocale,
  defaults: {
    audienceLine: string;
    decisionSummary: EnterpriseDecisionSummaryMerged;
    proofEngine: {
      title: string;
      items: EnterpriseProofEngineItemMerged[];
    };
    practice: {
      title: string;
      lead: string;
      blocks: Array<{ title: string; body: string }>;
    };
    proof: {
      title: string;
      items: Array<{ title: string; body: string }>;
    };
    caseStudies: {
      title: string;
      lead: string;
      labels: {
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
      items: Array<
        Pick<
          EnterpriseCaseStudyMerged,
          | "kicker"
          | "title"
          | "problem"
          | "systemBuilt"
          | "outcome"
          | "metrics"
          | "decisionImpact"
          | "visual"
        > & { body?: string }
      >;
    };
    diagrams: {
      title: string;
      lead: string;
      items: EnterpriseDiagramMerged[];
    };
    roi: {
      title: string;
      lead: string;
      formulaLabel: string;
      formula: string;
      inputsTitle: string;
      inputs: string[];
      metrics?: EnterpriseRoiMetricMerged[];
      cards: EnterpriseTextCardMerged[];
      reducedTitle: string;
      automatedTitle: string;
      gainedTitle: string;
      reduced: string[];
      automated: string[];
      gained: string[];
      investmentProfile: {
        scope: string;
        variables: string[];
      };
    };
    dealEntry: {
      title: string;
      body?: string;
      lead: string;
      checklistLabel: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
      items: EnterpriseDealEntryMerged[];
    };
    fit: EnterpriseFitMerged;
  },
): MergedEnterpriseLanding {
  const p = cms?.enterprisePractice;
  const pr = cms?.enterpriseProof;
  const prEn = locale === "ar" ? cmsEn?.enterpriseProof : undefined;
  const pe = cms?.enterpriseProofEngine;
  const peEn = locale === "ar" ? cmsEn?.enterpriseProofEngine : undefined;
  const cs = cms?.enterpriseCaseStudies;
  const csEn = locale === "ar" ? cmsEn?.enterpriseCaseStudies : undefined;
  const dg = cms?.enterpriseDiagrams;
  const dgEn = locale === "ar" ? cmsEn?.enterpriseDiagrams : undefined;
  const roi = cms?.enterpriseRoi;
  const roiEn = locale === "ar" ? cmsEn?.enterpriseRoi : undefined;
  const de = cms?.enterpriseDealEntry;
  const deEn = locale === "ar" ? cmsEn?.enterpriseDealEntry : undefined;
  const fit = cms?.enterpriseFit;
  const fitEn = locale === "ar" ? cmsEn?.enterpriseFit : undefined;

  const audienceLine = firstNonEmpty(
    cms?.enterpriseAudience,
    locale === "ar" ? cmsEn?.enterpriseAudience : undefined,
    defaults.audienceLine,
  );

  const ds = cms?.enterpriseDecisionSummary;
  const dsEn = locale === "ar" ? cmsEn?.enterpriseDecisionSummary : undefined;
  const decisionSummary: EnterpriseDecisionSummaryMerged = {
    forTeams: firstNonEmpty(
      ds?.forTeams,
      dsEn?.forTeams,
      defaults.decisionSummary.forTeams,
    ),
    requires: firstNonEmpty(
      ds?.requires,
      dsEn?.requires,
      defaults.decisionSummary.requires,
    ),
    delivers: firstNonEmpty(
      ds?.delivers,
      dsEn?.delivers,
      defaults.decisionSummary.delivers,
    ),
  };

  const practiceTitle = firstNonEmpty(
    p?.title,
    locale === "ar" ? cmsEn?.enterprisePractice?.title : undefined,
    defaults.practice.title,
  );
  const practiceLead = firstNonEmpty(
    p?.lead,
    locale === "ar" ? cmsEn?.enterprisePractice?.lead : undefined,
    defaults.practice.lead,
  );

  const blocks: EnterprisePracticeBlockMerged[] = [];
  for (let i = 0; i < 3; i++) {
    const def = defaults.practice.blocks[i] ?? {
      title: "",
      body: "",
    };
    const a = p?.blocks?.[i];
    const e = locale === "ar" ? cmsEn?.enterprisePractice?.blocks?.[i] : undefined;
    blocks.push({
      title: firstNonEmpty(a?.title, e?.title, def.title),
      body: firstNonEmpty(a?.body, e?.body, def.body),
      imageUrl: firstNonEmpty(a?.imageUrl, e?.imageUrl),
      imageAlt: firstNonEmpty(a?.imageAlt, e?.imageAlt),
      imageMediaAssetId: firstNonEmpty(
        a?.imageMediaAssetId,
        e?.imageMediaAssetId,
      ),
      assetRole: a?.assetRole ?? e?.assetRole,
      assetPurpose: a?.assetPurpose ?? e?.assetPurpose,
      assetPriority: a?.assetPriority ?? e?.assetPriority,
    });
  }

  const proofTitle = firstNonEmpty(
    pr?.title,
    prEn?.title,
    defaults.proof.title,
  );

  const proofItems: { title: string; body: string }[] = [];
  for (let i = 0; i < 4; i++) {
    const def = defaults.proof.items[i] ?? { title: "", body: "" };
    const a = pr?.items?.[i];
    const e = locale === "ar" ? prEn?.items?.[i] : undefined;
    proofItems.push({
      title: firstNonEmpty(a?.title, e?.title, def.title),
      body: firstNonEmpty(a?.body, e?.body, def.body),
    });
  }

  const proofEngineTitle = firstNonEmpty(
    pe?.title,
    peEn?.title,
    defaults.proofEngine.title,
    proofTitle,
  );

  const cmsEngineItems: EnterpriseProofEngineItemMerged[] = [];
  const peLen = Math.max(pe?.items?.length ?? 0, peEn?.items?.length ?? 0);
  for (let i = 0; i < peLen; i++) {
    const a = pe?.items?.[i];
    const e = locale === "ar" ? peEn?.items?.[i] : undefined;
    const claim = firstNonEmpty(a?.claim, e?.claim);
    const metric = firstNonEmpty(a?.metric, e?.metric);
    const evidenceType = normalizeEvidence(
      firstNonEmpty(a?.evidenceType, e?.evidenceType),
    );
    const visual = mergeVisualPartial(a?.visual, e?.visual, locale);
    const verA = a?.verification;
    const verE = e?.verification;
    const vLevel = normalizeVerificationLevel(
      firstNonEmpty(verA?.level, verE?.level),
    );
    const vNote = firstNonEmpty(verA?.note, verE?.note);
    if (claim.trim() && metric.trim()) {
      cmsEngineItems.push({
        claim,
        metric,
        evidenceType,
        visual,
        verification: { level: vLevel, note: vNote },
      });
    }
  }

  const proofEngineItems: EnterpriseProofEngineItemMerged[] =
    cmsEngineItems.length > 0
      ? cmsEngineItems
      : proofItems.map((row) => ({
          claim: row.title,
          metric: row.body,
          evidenceType: "reference_architecture" as EnterpriseEvidenceType,
          visual: {},
          verification: { level: "internal" as EnterpriseVerificationLevel, note: "" },
        }));

  const caseStudiesTitle = firstNonEmpty(cs?.title, csEn?.title, defaults.caseStudies.title);
  const caseStudiesLead = firstNonEmpty(cs?.lead, csEn?.lead, defaults.caseStudies.lead);
  const caseStudiesLabels = {
    situation: firstNonEmpty(
      cs?.labels?.situation,
      csEn?.labels?.situation,
      defaults.caseStudies.labels.situation,
    ),
    systems: firstNonEmpty(
      cs?.labels?.systems,
      csEn?.labels?.systems,
      defaults.caseStudies.labels.systems,
    ),
    proof: firstNonEmpty(
      cs?.labels?.proof,
      csEn?.labels?.proof,
      defaults.caseStudies.labels.proof,
    ),
    commercial: firstNonEmpty(
      cs?.labels?.commercial,
      csEn?.labels?.commercial,
      defaults.caseStudies.labels.commercial,
    ),
    problem: firstNonEmpty(
      cs?.labels?.problem,
      csEn?.labels?.problem,
      defaults.caseStudies.labels.problem,
    ),
    systemBuilt: firstNonEmpty(
      cs?.labels?.systemBuilt,
      csEn?.labels?.systemBuilt,
      defaults.caseStudies.labels.systemBuilt,
    ),
    outcome: firstNonEmpty(
      cs?.labels?.outcome,
      csEn?.labels?.outcome,
      defaults.caseStudies.labels.outcome,
    ),
    metrics: firstNonEmpty(
      cs?.labels?.metrics,
      csEn?.labels?.metrics,
      defaults.caseStudies.labels.metrics,
    ),
    decisionImpact: firstNonEmpty(
      cs?.labels?.decisionImpact,
      csEn?.labels?.decisionImpact,
      defaults.caseStudies.labels.decisionImpact,
    ),
  };
  const caseStudies: EnterpriseCaseStudyMerged[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      defaults.caseStudies.items.length,
      cs?.items ?? [],
      csEn?.items ?? [],
    );
    i++
  ) {
    const def = defaults.caseStudies.items[i] ?? {
      kicker: "",
      title: "",
      body: "",
      problem: "",
      systemBuilt: "",
      outcome: "",
      metrics: [],
      decisionImpact: "",
      visual: {},
    };
    const a = cs?.items?.[i];
    const e = csEn?.items?.[i];
    const body = firstNonEmpty(a?.body, e?.body, def.body);
    const preferSimpleBody = Boolean(body);
    const problem = firstNonEmpty(
      a?.problem,
      e?.problem,
      a?.situation,
      e?.situation,
      preferSimpleBody ? "" : def.problem,
    );
    const systemBuilt = firstNonEmpty(
      a?.systemBuilt,
      e?.systemBuilt,
      a?.systems,
      e?.systems,
      preferSimpleBody ? "" : def.systemBuilt,
    );
    const outcome = firstNonEmpty(
      a?.outcome,
      e?.outcome,
      a?.proof,
      e?.proof,
      preferSimpleBody ? "" : def.outcome,
    );
    const metricsRaw = a?.metrics ?? e?.metrics ?? (preferSimpleBody ? [] : def.metrics ?? []);
    const metrics: string[] = [];
    for (const m of metricsRaw) {
      const line = metricLineFromEntry(m);
      if (line) metrics.push(line);
    }
    if (metrics.length === 0) {
      const fallback = firstNonEmpty(a?.commercial, e?.commercial, "");
      if (fallback.trim()) metrics.push(fallback.trim());
    }
    const visual = mergeVisualPartial(a?.visual, e?.visual, locale);
    const decisionImpact = firstNonEmpty(
      a?.decisionImpact,
      e?.decisionImpact,
      def.decisionImpact,
    );
    const item = {
      kicker: firstNonEmpty(a?.kicker, e?.kicker, def.kicker),
      title: firstNonEmpty(a?.title, e?.title, def.title),
      body,
      problem,
      systemBuilt,
      outcome,
      metrics,
      decisionImpact,
      visual,
    };
    if (
      item.kicker ||
      item.title ||
      item.body ||
      item.problem ||
      item.systemBuilt ||
      item.outcome ||
      item.metrics.length > 0 ||
      item.decisionImpact ||
      visual.imageUrl ||
      visual.imageMediaAssetId
    ) {
      caseStudies.push(item);
    }
  }

  const diagramsTitle = firstNonEmpty(dg?.title, dgEn?.title, defaults.diagrams.title);
  const diagramsLead = firstNonEmpty(dg?.lead, dgEn?.lead, defaults.diagrams.lead);
  const diagrams: EnterpriseDiagramMerged[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      defaults.diagrams.items.length,
      dg?.items ?? [],
      dgEn?.items ?? [],
    );
    i++
  ) {
    const def = defaults.diagrams.items[i] ?? {
      title: "",
      body: "",
      explanation: "",
      diagramType: "architecture" as EnterpriseDiagramType,
      columns: [],
      footer: "",
    };
    const a = dg?.items?.[i];
    const e = dgEn?.items?.[i];
    const diagramBody = firstNonEmpty(a?.body, e?.body, def.body);
    const explanation = firstNonEmpty(
      a?.explanation,
      e?.explanation,
      def.explanation,
      diagramBody,
    );
    const diagramType = normalizeDiagramType(
      firstNonEmpty(a?.diagramType, e?.diagramType, def.diagramType),
    );
    const preferSimpleDiagram =
      Boolean(diagramBody) &&
      !(a?.columns?.length || e?.columns?.length || a?.footer || e?.footer);
    const columns: Array<{ label: string; body: string }> = [];
    for (
      let j = 0;
      j <
      resolvedCount(
        preferSimpleDiagram ? 0 : def.columns.length,
        a?.columns ?? [],
        e?.columns ?? [],
      );
      j++
    ) {
      const colDef = def.columns[j] ?? { label: "", body: "" };
      const colA = a?.columns?.[j];
      const colE = e?.columns?.[j];
      const column = {
        label: firstNonEmpty(colA?.label, colE?.label, colDef.label),
        body: firstNonEmpty(colA?.body, colE?.body, colDef.body),
      };
      if (column.label || column.body) columns.push(column);
    }
    const item = {
      title: firstNonEmpty(a?.title, e?.title, def.title),
      body: diagramBody,
      explanation,
      diagramType,
      footer: firstNonEmpty(a?.footer, e?.footer, preferSimpleDiagram ? "" : def.footer),
      columns,
    };
    if (item.title || item.body || item.explanation || item.footer || item.columns.length > 0) {
      diagrams.push(item);
    }
  }

  const roiTitle = firstNonEmpty(roi?.title, roiEn?.title, defaults.roi.title);
  const roiLead = firstNonEmpty(roi?.lead, roiEn?.lead, defaults.roi.lead);
  const hasCmsRoiItems = (roi?.items?.length ?? 0) > 0 || (roiEn?.items?.length ?? 0) > 0;
  const roiFormulaLabel = firstNonEmpty(
    roi?.formulaLabel,
    roiEn?.formulaLabel,
    hasCmsRoiItems ? "" : defaults.roi.formulaLabel,
  );
  const roiFormula = firstNonEmpty(
    roi?.formula,
    roiEn?.formula,
    hasCmsRoiItems ? "" : defaults.roi.formula,
  );
  const roiInputsTitle = firstNonEmpty(
    roi?.inputsTitle,
    roiEn?.inputsTitle,
    hasCmsRoiItems ? "" : defaults.roi.inputsTitle,
  );
  const roiInputs: string[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      hasCmsRoiItems ? 0 : defaults.roi.inputs.length,
      roi?.inputs ?? [],
      roiEn?.inputs ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(roi?.inputs?.[i]),
      textValue(roiEn?.inputs?.[i]),
      defaults.roi.inputs[i] ?? "",
    );
    if (value) roiInputs.push(value);
  }
  const roiMetrics: EnterpriseRoiMetricMerged[] = [];
  for (
    let i = 0;
    i < resolvedCount(0, roi?.items ?? [], roiEn?.items ?? []);
    i++
  ) {
    const a = roi?.items?.[i];
    const e = roiEn?.items?.[i];
    const item = {
      metric: firstNonEmpty(a?.metric, e?.metric, a?.title, e?.title),
      value: firstNonEmpty(a?.value, e?.value),
      body: firstNonEmpty(a?.body, e?.body),
    };
    if (item.metric || item.value || item.body) roiMetrics.push(item);
  }
  const roiCards: EnterpriseTextCardMerged[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      hasCmsRoiItems ? 0 : defaults.roi.cards.length,
      roi?.cards ?? [],
      roiEn?.cards ?? [],
    );
    i++
  ) {
    const def = defaults.roi.cards[i] ?? { title: "", body: "" };
    const a = roi?.cards?.[i];
    const e = roiEn?.cards?.[i];
    const item = {
      title: firstNonEmpty(a?.title, e?.title, def.title),
      body: firstNonEmpty(a?.body, e?.body, def.body),
    };
    if (item.title || item.body) roiCards.push(item);
  }

  const roiReducedTitle = firstNonEmpty(
    roi?.reducedTitle,
    roiEn?.reducedTitle,
    hasCmsRoiItems ? "" : defaults.roi.reducedTitle,
  );
  const roiAutomatedTitle = firstNonEmpty(
    roi?.automatedTitle,
    roiEn?.automatedTitle,
    hasCmsRoiItems ? "" : defaults.roi.automatedTitle,
  );
  const roiGainedTitle = firstNonEmpty(
    roi?.gainedTitle,
    roiEn?.gainedTitle,
    hasCmsRoiItems ? "" : defaults.roi.gainedTitle,
  );
  const roiReduced: string[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      hasCmsRoiItems ? 0 : defaults.roi.reduced.length,
      roi?.reduced ?? [],
      roiEn?.reduced ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(roi?.reduced?.[i]),
      textValue(roiEn?.reduced?.[i]),
      defaults.roi.reduced[i] ?? "",
    );
    if (value) roiReduced.push(value);
  }
  const roiAutomated: string[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      hasCmsRoiItems ? 0 : defaults.roi.automated.length,
      roi?.automated ?? [],
      roiEn?.automated ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(roi?.automated?.[i]),
      textValue(roiEn?.automated?.[i]),
      defaults.roi.automated[i] ?? "",
    );
    if (value) roiAutomated.push(value);
  }
  const roiGained: string[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      hasCmsRoiItems ? 0 : defaults.roi.gained.length,
      roi?.gained ?? [],
      roiEn?.gained ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(roi?.gained?.[i]),
      textValue(roiEn?.gained?.[i]),
      defaults.roi.gained[i] ?? "",
    );
    if (value) roiGained.push(value);
  }

  const investmentScope = firstNonEmpty(
    roi?.investmentProfile?.scope,
    roiEn?.investmentProfile?.scope,
    defaults.roi.investmentProfile.scope,
  );
  const investmentVariables: string[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      defaults.roi.investmentProfile.variables.length,
      roi?.investmentProfile?.variables ?? [],
      roiEn?.investmentProfile?.variables ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(roi?.investmentProfile?.variables?.[i]),
      textValue(roiEn?.investmentProfile?.variables?.[i]),
      defaults.roi.investmentProfile.variables[i] ?? "",
    );
    if (value) investmentVariables.push(value);
  }

  const dealEntryTitle = firstNonEmpty(de?.title, deEn?.title, defaults.dealEntry.title);
  const hasSimpleDealEntry =
    !((de?.items?.length ?? 0) > 0 || (deEn?.items?.length ?? 0) > 0) &&
    Boolean(
      de?.body ||
        deEn?.body ||
        de?.primaryCta?.label ||
        deEn?.primaryCta?.label ||
        de?.primaryCta?.href ||
        deEn?.primaryCta?.href ||
        de?.secondaryCta?.label ||
        deEn?.secondaryCta?.label ||
        de?.secondaryCta?.href ||
        deEn?.secondaryCta?.href,
    );
  const dealEntryBody = firstNonEmpty(
    de?.body,
    deEn?.body,
    defaults.dealEntry.body ?? "",
  );
  const dealEntryLead = firstNonEmpty(de?.lead, deEn?.lead, defaults.dealEntry.lead);
  const dealEntryChecklistLabel = firstNonEmpty(
    de?.checklistLabel,
    deEn?.checklistLabel,
    defaults.dealEntry.checklistLabel,
  );
  const primaryCtaLabel = firstNonEmpty(
    de?.primaryCta?.label,
    deEn?.primaryCta?.label,
    defaults.dealEntry.primaryCta?.label,
  );
  const primaryCtaHref = firstNonEmpty(
    de?.primaryCta?.href,
    deEn?.primaryCta?.href,
    defaults.dealEntry.primaryCta?.href,
  );
  const secondaryCtaLabel = firstNonEmpty(
    de?.secondaryCta?.label,
    deEn?.secondaryCta?.label,
    defaults.dealEntry.secondaryCta?.label,
  );
  const secondaryCtaHref = firstNonEmpty(
    de?.secondaryCta?.href,
    deEn?.secondaryCta?.href,
    defaults.dealEntry.secondaryCta?.href,
  );
  const dealEntryItems: EnterpriseDealEntryMerged[] = [];
  for (
    let i = 0;
    i <
    resolvedCount(
      hasSimpleDealEntry ? 0 : defaults.dealEntry.items.length,
      de?.items ?? [],
      deEn?.items ?? [],
    );
    i++
  ) {
    const def = defaults.dealEntry.items[i] ?? {
      title: "",
      body: "",
      checklist: [],
      ctaLabel: "",
      messageTemplate: "",
      intent: "ENTERPRISE_AI",
      qualification: { required: [] as string[], optional: [] as string[] },
    };
    const a = de?.items?.[i];
    const e = deEn?.items?.[i];
    const checklist: string[] = [];
    for (
      let j = 0;
      j <
      resolvedCount(
        def.checklist.length,
        a?.checklist ?? [],
        e?.checklist ?? [],
      );
      j++
    ) {
      const value = firstNonEmpty(
        textValue(a?.checklist?.[j]),
        textValue(e?.checklist?.[j]),
        def.checklist[j] ?? "",
      );
      if (value) checklist.push(value);
    }
    const defQual = def.qualification ?? { required: [], optional: [] };
    const qualRequired: string[] = [];
    for (
      let j = 0;
      j <
      resolvedCount(
        defQual.required.length,
        a?.qualification?.required ?? [],
        e?.qualification?.required ?? [],
      );
      j++
    ) {
      const value = firstNonEmpty(
        textValue(a?.qualification?.required?.[j]),
        textValue(e?.qualification?.required?.[j]),
        defQual.required[j] ?? "",
      );
      if (value) qualRequired.push(value);
    }
    const qualOptional: string[] = [];
    for (
      let j = 0;
      j <
      resolvedCount(
        defQual.optional.length,
        a?.qualification?.optional ?? [],
        e?.qualification?.optional ?? [],
      );
      j++
    ) {
      const value = firstNonEmpty(
        textValue(a?.qualification?.optional?.[j]),
        textValue(e?.qualification?.optional?.[j]),
        defQual.optional[j] ?? "",
      );
      if (value) qualOptional.push(value);
    }
    const item = {
      title: firstNonEmpty(a?.title, e?.title, def.title),
      body: firstNonEmpty(a?.body, e?.body, def.body),
      checklist,
      ctaLabel: firstNonEmpty(a?.ctaLabel, e?.ctaLabel, def.ctaLabel),
      messageTemplate: firstNonEmpty(
        a?.messageTemplate,
        e?.messageTemplate,
        def.messageTemplate,
      ),
      intent: firstNonEmpty(a?.intent, e?.intent, def.intent),
      qualification: {
        required: qualRequired,
        optional: qualOptional,
      },
    };
    if (
      item.title ||
      item.body ||
      item.checklist.length > 0 ||
      item.ctaLabel ||
      item.messageTemplate ||
      item.qualification.required.length > 0 ||
      item.qualification.optional.length > 0
    ) {
      dealEntryItems.push(item);
    }
  }

  const fitMerged: EnterpriseFitMerged = {
    title: firstNonEmpty(fit?.title, fitEn?.title, defaults.fit.title),
    lead: firstNonEmpty(fit?.lead, fitEn?.lead, defaults.fit.lead),
    fitTitle: firstNonEmpty(
      fit?.fitTitle,
      fitEn?.fitTitle,
      defaults.fit.fitTitle,
    ),
    nonFitTitle: firstNonEmpty(
      fit?.nonFitTitle,
      fitEn?.nonFitTitle,
      defaults.fit.nonFitTitle,
    ),
    fit: [],
    nonFit: [],
  };
  for (
    let i = 0;
    i <
    resolvedCount(
      defaults.fit.fit.length,
      fit?.fit ?? [],
      fitEn?.fit ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(fit?.fit?.[i]),
      textValue(fitEn?.fit?.[i]),
      defaults.fit.fit[i] ?? "",
    );
    if (value) fitMerged.fit.push(value);
  }
  for (
    let i = 0;
    i <
    resolvedCount(
      defaults.fit.nonFit.length,
      fit?.nonFit ?? [],
      fitEn?.nonFit ?? [],
    );
    i++
  ) {
    const value = firstNonEmpty(
      textValue(fit?.nonFit?.[i]),
      textValue(fitEn?.nonFit?.[i]),
      defaults.fit.nonFit[i] ?? "",
    );
    if (value) fitMerged.nonFit.push(value);
  }

  return {
    audienceLine,
    decisionSummary,
    proofEngine: {
      title: proofEngineTitle,
      items: proofEngineItems,
    },
    practice: {
      title: practiceTitle,
      lead: practiceLead,
      blocks,
    },
    proof: {
      title: proofTitle,
      items: proofItems,
    },
    caseStudies: {
      title: caseStudiesTitle,
      lead: caseStudiesLead,
      labels: caseStudiesLabels,
      items: caseStudies,
    },
    diagrams: {
      title: diagramsTitle,
      lead: diagramsLead,
      items: diagrams,
    },
    roi: {
      title: roiTitle,
      lead: roiLead,
      formulaLabel: roiFormulaLabel,
      formula: roiFormula,
      inputsTitle: roiInputsTitle,
      inputs: roiInputs,
      metrics: roiMetrics,
      cards: roiCards,
      reducedTitle: roiReducedTitle,
      automatedTitle: roiAutomatedTitle,
      gainedTitle: roiGainedTitle,
      reduced: roiReduced,
      automated: roiAutomated,
      gained: roiGained,
      investmentProfile: {
        scope: investmentScope,
        variables: investmentVariables,
      },
    },
    dealEntry: {
      title: dealEntryTitle,
      body: dealEntryBody,
      lead: dealEntryLead,
      checklistLabel: dealEntryChecklistLabel,
      primaryCta:
        primaryCtaLabel || primaryCtaHref
          ? { label: primaryCtaLabel, href: primaryCtaHref }
          : null,
      secondaryCta:
        secondaryCtaLabel || secondaryCtaHref
          ? { label: secondaryCtaLabel, href: secondaryCtaHref }
          : null,
      items: dealEntryItems,
    },
    fit: fitMerged,
  };
}
