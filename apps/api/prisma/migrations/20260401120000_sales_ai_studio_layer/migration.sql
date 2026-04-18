-- AI Studio sales layer: lead enrichment + AI_STUDIO lead source.
-- (SalesSettings JSON maps live in a later migration after SalesSettings exists.)

DO $$ BEGIN
  ALTER TYPE "LeadSource" ADD VALUE 'AI_STUDIO';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Lead"
  ADD COLUMN "studioIntent" VARCHAR(32),
  ADD COLUMN "offerType" VARCHAR(256),
  ADD COLUMN "estimatedValue" DECIMAL(14,2),
  ADD COLUMN "crmMetadata" JSONB;
