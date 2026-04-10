-- CreateTable
CREATE TABLE "AiStudioAskEvent" (
    "id" TEXT NOT NULL,
    "sessionId" VARCHAR(80) NOT NULL,
    "page" VARCHAR(64) NOT NULL,
    "locale" VARCHAR(4) NOT NULL,
    "userMessage" TEXT NOT NULL,
    "normalizedIntent" VARCHAR(16) NOT NULL,
    "recommendedOffer" VARCHAR(256),
    "recommendedCtaLabel" VARCHAR(256),
    "secondaryCtaLabel" VARCHAR(256),
    "responseText" TEXT NOT NULL,
    "source" VARCHAR(64),
    "url" TEXT,
    "ipHash" VARCHAR(64),
    "tokensUsed" INTEGER,
    "outOfScope" BOOLEAN NOT NULL DEFAULT false,
    "rateLimited" BOOLEAN NOT NULL DEFAULT false,
    "disabledFallback" BOOLEAN NOT NULL DEFAULT false,
    "shouldEscalate" BOOLEAN NOT NULL DEFAULT false,
    "primaryCtaClicked" BOOLEAN NOT NULL DEFAULT false,
    "secondaryCtaClicked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiStudioAskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiStudioAskEvent_sessionId_createdAt_idx" ON "AiStudioAskEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "AiStudioAskEvent_createdAt_idx" ON "AiStudioAskEvent"("createdAt");

-- CreateIndex
CREATE INDEX "AiStudioAskEvent_normalizedIntent_createdAt_idx" ON "AiStudioAskEvent"("normalizedIntent", "createdAt");
