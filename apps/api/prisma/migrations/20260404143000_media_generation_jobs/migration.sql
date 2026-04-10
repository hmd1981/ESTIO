-- CreateEnum
CREATE TYPE "MediaGenerationJobStatus" AS ENUM ('queued', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "media_generation_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'generate_image',
    "status" "MediaGenerationJobStatus" NOT NULL DEFAULT 'queued',
    "workerTargetHost" TEXT,
    "inputPayload" JSONB NOT NULL,
    "inputMeta" JSONB NOT NULL,
    "resultPayload" JSONB,
    "errorPayload" JSONB,
    "errorMessage" TEXT,
    "upstreamHttpStatus" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "media_generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_generation_jobs_status_createdAt_idx" ON "media_generation_jobs"("status", "createdAt");
