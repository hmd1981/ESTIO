-- Lead enums + priority; Service.detailBlocks; migrate Lead text columns to enums

CREATE TYPE "LeadServiceInterest" AS ENUM ('WEB_DESIGN_DEVELOPMENT', 'CONTENT_CAMPAIGNS', 'AI_CREATIVE', 'ENTERPRISE_AI', 'UNSURE');

CREATE TYPE "LeadSource" AS ENUM ('HOMEPAGE', 'CONTACT', 'SERVICE_PAGE');

CREATE TYPE "LeadPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "Lead" ADD COLUMN "serviceInterest_new" "LeadServiceInterest";
ALTER TABLE "Lead" ADD COLUMN "source_new" "LeadSource";
ALTER TABLE "Lead" ADD COLUMN "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIUM';

UPDATE "Lead" SET "serviceInterest_new" = 'UNSURE'::"LeadServiceInterest";

UPDATE "Lead" SET "source_new" = CASE
  WHEN LOWER(COALESCE("source", '')) LIKE '%home%' THEN 'HOMEPAGE'::"LeadSource"
  WHEN LOWER(COALESCE("source", '')) LIKE '%service%' THEN 'SERVICE_PAGE'::"LeadSource"
  ELSE 'CONTACT'::"LeadSource"
END;

ALTER TABLE "Lead" DROP COLUMN "serviceInterest";
ALTER TABLE "Lead" DROP COLUMN "source";
ALTER TABLE "Lead" RENAME COLUMN "serviceInterest_new" TO "serviceInterest";
ALTER TABLE "Lead" RENAME COLUMN "source_new" TO "source";

ALTER TABLE "Lead" ALTER COLUMN "source" SET NOT NULL;

ALTER TABLE "Service" ADD COLUMN "detailBlocks" JSONB;
