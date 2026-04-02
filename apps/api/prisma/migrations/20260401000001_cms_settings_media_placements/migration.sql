-- AlterTable
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS "whatsapp" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "globalLabels" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MediaPlacement" (
    "id" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "pageSlug" VARCHAR(120) NOT NULL,
    "locale" "SiteLocale" NOT NULL,
    "sectionKey" VARCHAR(160) NOT NULL,
    "fieldKey" VARCHAR(160) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MediaPlacement_mediaAssetId_pageSlug_locale_sectionKey_fieldKey_key" ON "MediaPlacement"("mediaAssetId", "pageSlug", "locale", "sectionKey", "fieldKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MediaPlacement_mediaAssetId_idx" ON "MediaPlacement"("mediaAssetId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MediaPlacement_pageSlug_locale_idx" ON "MediaPlacement"("pageSlug", "locale");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "MediaPlacement" ADD CONSTRAINT "MediaPlacement_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
