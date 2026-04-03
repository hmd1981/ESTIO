-- AI Studio sales layer: lead enrichment, sales settings JSON maps, AI_STUDIO source.

DO $$ BEGIN
  ALTER TYPE "CrmLeadSource" ADD VALUE 'AI_STUDIO';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Lead"
  ADD COLUMN "studioIntent" VARCHAR(32),
  ADD COLUMN "offerType" VARCHAR(256),
  ADD COLUMN "estimatedValue" DECIMAL(14,2),
  ADD COLUMN "crmMetadata" JSONB;

ALTER TABLE "SalesSettings"
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "intentMapping" JSONB,
  ADD COLUMN "priorityMapping" JSONB,
  ADD COLUMN "routingMapping" JSONB,
  ADD COLUMN "pricingHints" JSONB,
  ADD COLUMN "defaultStage" VARCHAR(64) NOT NULL DEFAULT 'NEW';

UPDATE "SalesSettings"
SET
  "intentMapping" = COALESCE(
    "intentMapping",
    '{"images":"AI Image Production","video":"Short-form AI Video","brand":"Brand AI Pack"}'::jsonb
  ),
  "priorityMapping" = COALESCE(
    "priorityMapping",
    '{"video":"high","brand":"high","images":"medium"}'::jsonb
  ),
  "routingMapping" = COALESCE(
    "routingMapping",
    '{"images":"sales","video":"sales","brand":"owner"}'::jsonb
  ),
  "pricingHints" = COALESCE(
    "pricingHints",
    '{"images":"Starting from $150","video":"Starting from $300","brand":"Custom pricing"}'::jsonb
  )
WHERE "id" = 'default';
