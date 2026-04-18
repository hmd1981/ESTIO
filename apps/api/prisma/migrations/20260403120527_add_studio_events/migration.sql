/*
  Warnings:

  - You are about to drop the column `name` on the `Lead` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- Lead.updatedAt must exist before ALTER COLUMN below (runs before crm_platform adds it).
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "name",
ADD COLUMN     "fullName" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'NEW',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- RenameIndex
ALTER INDEX "MediaPlacement_mediaAssetId_pageSlug_locale_sectionKey_fieldKey" RENAME TO "MediaPlacement_mediaAssetId_pageSlug_locale_sectionKey_fiel_key";

-- CreateTable
CREATE TABLE "StudioEvent" (
    "id" TEXT NOT NULL,
    "sessionId" VARCHAR(64) NOT NULL,
    "eventType" VARCHAR(40) NOT NULL,
    "intent" VARCHAR(16),
    "source" VARCHAR(16),
    "quality" DOUBLE PRECISION,
    "ctaPosition" VARCHAR(16),
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "hoverDuration" INTEGER,
    "exitGoal" TEXT,
    "region" VARCHAR(10),
    "device" VARCHAR(16),
    "locale" VARCHAR(4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudioEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudioEvent_sessionId_idx" ON "StudioEvent"("sessionId");

-- CreateIndex
CREATE INDEX "StudioEvent_eventType_createdAt_idx" ON "StudioEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "StudioEvent_intent_eventType_createdAt_idx" ON "StudioEvent"("intent", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "StudioEvent_intent_clicked_idx" ON "StudioEvent"("intent", "clicked");

-- CreateIndex
CREATE INDEX "StudioEvent_device_region_intent_idx" ON "StudioEvent"("device", "region", "intent");
