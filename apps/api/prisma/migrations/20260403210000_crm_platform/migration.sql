-- CRM platform: expanded Lead, related tables, enums. Migrates existing Lead rows.

CREATE TYPE "CrmServiceType" AS ENUM ('WEB', 'CONTENT', 'CAMPAIGNS', 'AI_CREATIVE', 'ENTERPRISE_AI', 'AUTOMATION', 'GENERAL');
CREATE TYPE "CrmLeadSource" AS ENUM ('HOMEPAGE', 'CONTACT', 'SERVICE_PAGE', 'INTAKE', 'REFERRAL', 'PARTNER', 'OTHER');
CREATE TYPE "CrmPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'STRATEGIC');
CREATE TYPE "CrmLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'NURTURE', 'WON', 'LOST', 'ON_HOLD');
CREATE TYPE "CrmPipelineStage" AS ENUM ('INBOX', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');
CREATE TYPE "CrmBudgetRange" AS ENUM ('UNSPECIFIED', 'UNDER_5K', 'RANGE_5K_25K', 'RANGE_25K_75K', 'RANGE_75K_200K', 'OVER_200K');
CREATE TYPE "CrmTimeline" AS ENUM ('UNSPECIFIED', 'IMMEDIATE', 'WEEKS_1_4', 'MONTHS_1_3', 'MONTHS_3_6', 'MONTHS_6_PLUS');
CREATE TYPE "CrmBusinessType" AS ENUM ('UNSPECIFIED', 'STARTUP', 'SMB', 'MID_MARKET', 'ENTERPRISE', 'NONPROFIT', 'AGENCY', 'OTHER');
CREATE TYPE "CrmTeamSize" AS ENUM ('UNSPECIFIED', 'SOLO', 'SIZE_2_10', 'SIZE_11_50', 'SIZE_51_PLUS');
CREATE TYPE "CrmLostReason" AS ENUM ('UNSPECIFIED', 'TIMING', 'BUDGET', 'COMPETITOR', 'NO_FIT', 'GHOSTED', 'OTHER');
CREATE TYPE "LeadActivityType" AS ENUM ('CREATED', 'FIELD_UPDATED', 'NOTE_ADDED', 'TASK_CREATED', 'TASK_COMPLETED', 'STAGE_CHANGED', 'STATUS_CHANGED', 'INTAKE_COMPLETED', 'AUTOMATION', 'EMAIL', 'CALL', 'MEETING', 'PROPOSAL');
CREATE TYPE "LeadTaskStatus" AS ENUM ('OPEN', 'DONE', 'CANCELLED');
CREATE TYPE "AutomationRunType" AS ENUM ('NEW_LEAD_ACK', 'ASSIGNMENT', 'FOLLOWUP_DUE', 'STALE_LEAD', 'PROPOSAL_FOLLOWUP', 'LOST_REASON_ENFORCE');
CREATE TYPE "AutomationRunStatus" AS ENUM ('SUCCESS', 'FAILED', 'SKIPPED');
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'LINKEDIN', 'OTHER');

-- Indexes on Lead.status/source may reference columns we replace; recreate later.
DROP INDEX IF EXISTS "Lead_status_createdAt_idx";
DROP INDEX IF EXISTS "Lead_source_createdAt_idx";

-- Map legacy Lead.status (LeadStatus) -> CrmLeadStatus
ALTER TABLE "Lead" ADD COLUMN "status_new" "CrmLeadStatus";
UPDATE "Lead" SET "status_new" = CASE "status"::text
  WHEN 'NEW' THEN 'NEW'::"CrmLeadStatus"
  WHEN 'CONTACTED' THEN 'CONTACTED'::"CrmLeadStatus"
  WHEN 'QUALIFIED' THEN 'QUALIFIED'::"CrmLeadStatus"
  WHEN 'CLOSED' THEN 'LOST'::"CrmLeadStatus"
  ELSE 'NEW'::"CrmLeadStatus"
END;
ALTER TABLE "Lead" DROP COLUMN "status";
ALTER TABLE "Lead" RENAME COLUMN "status_new" TO "status";
ALTER TABLE "Lead" ALTER COLUMN "status" SET NOT NULL;
DROP TYPE "LeadStatus";

-- Pipeline stage
ALTER TABLE "Lead" ADD COLUMN "stage" "CrmPipelineStage" NOT NULL DEFAULT 'INBOX';

-- serviceInterest -> serviceType
ALTER TABLE "Lead" ADD COLUMN "serviceType" "CrmServiceType" NOT NULL DEFAULT 'GENERAL';
UPDATE "Lead" SET "serviceType" = CASE "serviceInterest"::text
  WHEN 'WEB_DESIGN_DEVELOPMENT' THEN 'WEB'::"CrmServiceType"
  WHEN 'CONTENT_CAMPAIGNS' THEN 'CONTENT'::"CrmServiceType"
  WHEN 'AI_CREATIVE' THEN 'AI_CREATIVE'::"CrmServiceType"
  WHEN 'ENTERPRISE_AI' THEN 'ENTERPRISE_AI'::"CrmServiceType"
  WHEN 'UNSURE' THEN 'GENERAL'::"CrmServiceType"
  ELSE 'GENERAL'::"CrmServiceType"
END;
ALTER TABLE "Lead" DROP COLUMN "serviceInterest";
DROP TYPE "LeadServiceInterest";

-- LeadSource -> CrmLeadSource
ALTER TABLE "Lead" ADD COLUMN "source_new" "CrmLeadSource";
UPDATE "Lead" SET "source_new" = CASE "source"::text
  WHEN 'HOMEPAGE' THEN 'HOMEPAGE'::"CrmLeadSource"
  WHEN 'CONTACT' THEN 'CONTACT'::"CrmLeadSource"
  WHEN 'SERVICE_PAGE' THEN 'SERVICE_PAGE'::"CrmLeadSource"
  ELSE 'OTHER'::"CrmLeadSource"
END;
ALTER TABLE "Lead" DROP COLUMN "source";
ALTER TABLE "Lead" RENAME COLUMN "source_new" TO "source";
ALTER TABLE "Lead" ALTER COLUMN "source" SET NOT NULL;
DROP TYPE "LeadSource";

-- LeadPriority -> CrmPriority
ALTER TABLE "Lead" ADD COLUMN "priority_new" "CrmPriority";
UPDATE "Lead" SET "priority_new" = CASE "priority"::text
  WHEN 'LOW' THEN 'LOW'::"CrmPriority"
  WHEN 'MEDIUM' THEN 'MEDIUM'::"CrmPriority"
  WHEN 'HIGH' THEN 'HIGH'::"CrmPriority"
  ELSE 'MEDIUM'::"CrmPriority"
END;
ALTER TABLE "Lead" DROP COLUMN "priority";
ALTER TABLE "Lead" RENAME COLUMN "priority_new" TO "priority";
ALTER TABLE "Lead" ALTER COLUMN "priority" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM'::"CrmPriority";
DROP TYPE "LeadPriority";

-- Additional Lead fields
ALTER TABLE "Lead" ADD COLUMN "whatsapp" TEXT;
ALTER TABLE "Lead" ADD COLUMN "jobTitle" TEXT;
ALTER TABLE "Lead" ADD COLUMN "country" TEXT;
ALTER TABLE "Lead" ADD COLUMN "city" TEXT;
ALTER TABLE "Lead" ADD COLUMN "subServiceType" VARCHAR(128);
ALTER TABLE "Lead" ADD COLUMN "businessType" "CrmBusinessType" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "Lead" ADD COLUMN "teamSize" "CrmTeamSize" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "Lead" ADD COLUMN "budgetRange" "CrmBudgetRange" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "Lead" ADD COLUMN "timeline" "CrmTimeline" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "Lead" ADD COLUMN "projectScope" TEXT;
ALTER TABLE "Lead" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Lead" ADD COLUMN "scoreBreakdown" JSONB;
ALTER TABLE "Lead" ADD COLUMN "ownerUserId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "lastContactedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "lostReason" "CrmLostReason" NOT NULL DEFAULT 'UNSPECIFIED';
ALTER TABLE "Lead" ADD COLUMN "wonValue" DECIMAL(14,2);
ALTER TABLE "Lead" ADD COLUMN "locale" "SiteLocale";
ALTER TABLE "Lead" ADD COLUMN "referrer" TEXT;
ALTER TABLE "Lead" ADD COLUMN "landingPage" TEXT;
ALTER TABLE "Lead" ADD COLUMN "campaignSource" VARCHAR(128);
ALTER TABLE "Lead" ADD COLUMN "campaignMedium" VARCHAR(128);
ALTER TABLE "Lead" ADD COLUMN "campaignName" VARCHAR(256);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
CREATE INDEX "Lead_stage_createdAt_idx" ON "Lead"("stage", "createdAt");
CREATE INDEX "Lead_source_createdAt_idx" ON "Lead"("source", "createdAt");
CREATE INDEX "Lead_ownerUserId_idx" ON "Lead"("ownerUserId");
CREATE INDEX "Lead_nextFollowUpAt_idx" ON "Lead"("nextFollowUpAt");
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- Child tables
CREATE TABLE "LeadAnswer" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "questionKey" VARCHAR(160) NOT NULL,
    "valueJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadAnswer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadAnswer_leadId_idx" ON "LeadAnswer"("leadId");
CREATE INDEX "LeadAnswer_questionKey_idx" ON "LeadAnswer"("questionKey");
ALTER TABLE "LeadAnswer" ADD CONSTRAINT "LeadAnswer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorLabel" VARCHAR(120),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LeadTask" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" "LeadTaskStatus" NOT NULL DEFAULT 'OPEN',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeadTask_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadTask_leadId_status_idx" ON "LeadTask"("leadId", "status");
CREATE INDEX "LeadTask_dueAt_idx" ON "LeadTask"("dueAt");
ALTER TABLE "LeadTask" ADD CONSTRAINT "LeadTask_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "LeadAssignment" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assigneeUserId" TEXT,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    CONSTRAINT "LeadAssignment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeadAssignment_leadId_idx" ON "LeadAssignment"("leadId");
CREATE INDEX "LeadAssignment_assigneeUserId_idx" ON "LeadAssignment"("assigneeUserId");
ALTER TABLE "LeadAssignment" ADD CONSTRAINT "LeadAssignment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "taskId" TEXT,
    "type" "AutomationRunType" NOT NULL,
    "status" "AutomationRunStatus" NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AutomationRun_leadId_createdAt_idx" ON "AutomationRun"("leadId", "createdAt");
CREATE INDEX "AutomationRun_type_createdAt_idx" ON "AutomationRun"("type", "createdAt");
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "LeadTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ProposalRecord" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "reference" VARCHAR(160) NOT NULL,
    "valueAmount" DECIMAL(14,2),
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "status" VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProposalRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ProposalRecord_leadId_idx" ON "ProposalRecord"("leadId");
ALTER TABLE "ProposalRecord" ADD CONSTRAINT "ProposalRecord_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "SalesSettings" (
    "id" TEXT NOT NULL,
    "scoringRules" JSONB,
    "automationRules" JSONB,
    "defaultOwnerUserId" TEXT,
    "staleLeadDays" INTEGER NOT NULL DEFAULT 14,
    "followUpReminderHours" INTEGER NOT NULL DEFAULT 48,
    "proposalFollowUpDays" INTEGER NOT NULL DEFAULT 7,
    "lostReasonWhenLostRequired" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SalesSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntakeSession" (
    "id" TEXT NOT NULL,
    "branch" "CrmServiceType" NOT NULL DEFAULT 'GENERAL',
    "stepKey" VARCHAR(120) NOT NULL DEFAULT 'start',
    "answersJson" JSONB NOT NULL DEFAULT '{}',
    "leadId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "IntakeSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "IntakeSession_leadId_key" ON "IntakeSession"("leadId");
ALTER TABLE "IntakeSession" ADD CONSTRAINT "IntakeSession_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "subject" VARCHAR(500),
    "body" TEXT NOT NULL,
    "locale" "SiteLocale",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SalesSettings" ("id", "staleLeadDays", "followUpReminderHours", "proposalFollowUpDays", "lostReasonWhenLostRequired", "updatedAt")
VALUES ('default', 14, 48, 7, true, CURRENT_TIMESTAMP);

ALTER TABLE "SalesSettings" ALTER COLUMN "id" SET DEFAULT 'default';
