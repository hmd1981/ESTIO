-- CreateTable
CREATE TABLE "StudioAnalyticsRollupDay" (
    "id" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "locale" VARCHAR(4) NOT NULL DEFAULT '',
    "device" VARCHAR(16) NOT NULL DEFAULT '',
    "eventType" VARCHAR(40) NOT NULL,
    "intent" VARCHAR(16) NOT NULL DEFAULT '',
    "source" VARCHAR(16) NOT NULL DEFAULT '',
    "eventCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudioAnalyticsRollupDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioAnalyticsRollupDay_day_locale_device_eventType_intent_source_key" ON "StudioAnalyticsRollupDay"("day", "locale", "device", "eventType", "intent", "source");

-- CreateIndex
CREATE INDEX "StudioAnalyticsRollupDay_day_idx" ON "StudioAnalyticsRollupDay"("day");
