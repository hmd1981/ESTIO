import type { EnterpriseDiagramMerged, EnterpriseProofEngineItemMerged } from "@/lib/cms/merge-marketing-page";
import type { AppLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

/** Single source for `mergeEnterpriseLandingSections` defaults (page + validation script). */
export function buildEnterpriseLandingMergeDefaults(locale: AppLocale) {
  const el = getMessages(locale).enterpriseLanding;
  const proofEngineDefaults: EnterpriseProofEngineItemMerged[] = el.proofItems.map(
    (p) => ({
      claim: p.title,
      metric: p.body,
      evidenceType: (p.evidenceType ?? "reference_architecture") as
        | "case"
        | "internal"
        | "simulation"
        | "reference_architecture",
      visual: {},
      verification: {
        level: (p.verificationLevel ?? "internal") as
          | "internal"
          | "observed"
          | "repeatable"
          | "contractual",
        note: p.verificationNote ?? "",
      },
    }),
  );
  const diagramDefaults: EnterpriseDiagramMerged[] = el.diagrams.map((d) => ({
    title: d.title,
    body: "",
    explanation: d.explanation ?? d.footer ?? "",
    diagramType: d.diagramType ?? "architecture",
    columns: d.columns,
    footer: d.footer,
  }));

  return {
    audienceLine: el.heroAudienceLine,
    decisionSummary: {
      forTeams: el.decisionSummaryForTeams,
      requires: el.decisionSummaryRequires,
      delivers: el.decisionSummaryDelivers,
    },
    proofEngine: {
      title: el.proofSectionTitle,
      items: proofEngineDefaults,
    },
    practice: {
      title: el.practiceSectionTitle,
      lead: el.practiceLead,
      blocks: el.practiceBlocks,
    },
    proof: {
      title: el.proofSectionTitle,
      items: el.proofItems,
    },
    caseStudies: {
      title: el.caseStudiesTitle,
      lead: el.caseStudiesLead,
      labels: el.caseStudyLabels,
      items: el.caseStudies.map((c) => ({
        kicker: c.kicker,
        title: c.title,
        body: "",
        problem: c.situation,
        systemBuilt: c.systems,
        outcome: c.proof,
        metrics: [c.commercial],
        decisionImpact: c.decisionImpact ?? "",
        visual: {},
      })),
    },
    diagrams: {
      title: el.diagramSectionTitle,
      lead: el.diagramLead,
      items: diagramDefaults,
    },
    roi: {
      title: el.roiSectionTitle,
      lead: el.roiLead,
      formulaLabel: el.roiFormulaLabel,
      formula: el.roiFormula,
      inputsTitle: el.roiInputsTitle,
      inputs: el.roiInputs,
      cards: el.roiCards,
      reducedTitle: el.roiReducedTitle,
      automatedTitle: el.roiAutomatedTitle,
      gainedTitle: el.roiGainedTitle,
      reduced: el.roiReduced,
      automated: el.roiAutomated,
      gained: el.roiGained,
      investmentProfile: {
        scope: el.roiInvestmentScope,
        variables: el.roiInvestmentVariables,
      },
    },
    dealEntry: {
      title: el.dealEntryTitle,
      lead: el.dealEntryLead,
      checklistLabel: el.dealEntryChecklistLabel,
      items: el.dealEntryCards.map((c) => ({
        title: c.title,
        body: c.body,
        checklist: c.checklist,
        ctaLabel: c.ctaLabel,
        messageTemplate: c.messageTemplate,
        intent: c.intent,
        qualification: {
          required: c.qualificationRequired,
          optional: c.qualificationOptional,
        },
      })),
    },
    fit: {
      title: el.fitSectionTitle,
      lead: el.fitSectionLead,
      fitTitle: el.fitColumnTitle,
      nonFitTitle: el.nonFitColumnTitle,
      fit: el.fitBullets,
      nonFit: el.nonFitBullets,
    },
  };
}
