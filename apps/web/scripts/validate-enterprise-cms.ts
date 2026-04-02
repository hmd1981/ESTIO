/**
 * Regression guard: enterprise CMS merge + visuals (no network, no DB).
 * Run: npx tsx scripts/validate-enterprise-cms.ts
 */
import { buildEnterpriseLandingMergeDefaults } from "../lib/cms/enterprise-merge-defaults";
import { enterpriseCmsGoldenFixture } from "../lib/cms/fixtures/enterprise-cms-golden";
import {
  mergeEnterpriseLandingSections,
  mergeEnterpriseVisuals,
} from "../lib/cms/merge-marketing-page";
import type { MarketingPageSectionsCMS } from "../lib/cms/types";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`validate-enterprise-cms: ${msg}`);
}

const defaultsEn = buildEnterpriseLandingMergeDefaults("en");
const defaultsAr = buildEnterpriseLandingMergeDefaults("ar");

function run() {
  let landing = mergeEnterpriseLandingSections(
    undefined,
    undefined,
    "en",
    defaultsEn,
  );
  assert(
    Array.isArray(landing.proofEngine.items) &&
      landing.proofEngine.items.length > 0,
    "empty CMS should fall back to default proof engine items",
  );
  assert(
    typeof landing.decisionSummary.forTeams === "string",
    "decision summary strings",
  );

  landing = mergeEnterpriseLandingSections(
    enterpriseCmsGoldenFixture,
    undefined,
    "en",
    defaultsEn,
  );
  assert(landing.proofEngine.items.length >= 2, "golden: proof engine rows");
  assert(landing.caseStudies.items.length >= 1, "golden: case studies");
  assert(landing.dealEntry.items.length >= 1, "golden: deal entry");
  assert(landing.diagrams.items.length >= 1, "golden: diagrams");
  assert(
    landing.roi.investmentProfile.scope.length > 0,
    "golden: investment profile",
  );

  const arPartial = {
    enterpriseAudience: "جمهور عربي للاختبار",
  } satisfies MarketingPageSectionsCMS;

  landing = mergeEnterpriseLandingSections(
    arPartial,
    enterpriseCmsGoldenFixture,
    "ar",
    defaultsAr,
  );
  assert(
    landing.audienceLine.includes("جمهور"),
    "AR locale should prefer local enterpriseAudience",
  );
  assert(
    landing.proofEngine.items.length >= 2,
    "AR with EN fallback should keep golden proof rows",
  );

  const ev = mergeEnterpriseVisuals(
    enterpriseCmsGoldenFixture,
    undefined,
    "en",
  );
  assert(
    Boolean(ev.systemDiagram.imageUrl?.trim()),
    "golden: system diagram visual merges",
  );

  const noisy = {
    enterpriseCaseStudies: {
      items: [
        {
          title: "Noise",
          metrics: [null, 42, { foo: "bar" }, "ok line"] as unknown[],
        },
      ],
    },
  } as unknown as MarketingPageSectionsCMS;

  landing = mergeEnterpriseLandingSections(noisy, undefined, "en", defaultsEn);
  const noiseCase = landing.caseStudies.items.find((it) => it.title === "Noise");
  assert(noiseCase, "noisy CMS should still emit case row");
  assert(
    noiseCase.metrics.every((m) => typeof m === "string"),
    "garbage metric entries should coerce or drop without crash",
  );

  console.log("validate-enterprise-cms: OK");
}

run();
