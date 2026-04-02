-- CreateEnum
CREATE TYPE "SiteLocale" AS ENUM ('en', 'ar');

-- AlterTable Page
ALTER TABLE "Page" ADD COLUMN "locale" "SiteLocale" NOT NULL DEFAULT 'en';
DROP INDEX IF EXISTS "Page_slug_key";
CREATE UNIQUE INDEX "Page_slug_locale_key" ON "Page"("slug", "locale");
CREATE INDEX "Page_status_locale_idx" ON "Page"("status", "locale");
DROP INDEX IF EXISTS "Page_status_idx";

-- AlterTable Service
ALTER TABLE "Service" ADD COLUMN "locale" "SiteLocale" NOT NULL DEFAULT 'en';
DROP INDEX IF EXISTS "Service_slug_key";
CREATE UNIQUE INDEX "Service_slug_locale_key" ON "Service"("slug", "locale");

-- AlterTable Settings
ALTER TABLE "Settings" ADD COLUMN "businessNameAr" TEXT;
ALTER TABLE "Settings" ADD COLUMN "brandNameAr" TEXT;
ALTER TABLE "Settings" ADD COLUMN "footerTextAr" TEXT;

-- AlterTable NavigationItem
ALTER TABLE "NavigationItem" ADD COLUMN "locale" "SiteLocale" NOT NULL DEFAULT 'en';
DROP INDEX IF EXISTS "NavigationItem_location_orderIndex_idx";
CREATE INDEX "NavigationItem_location_locale_orderIndex_idx" ON "NavigationItem"("location", "locale", "orderIndex");

-- AlterTable SeoMetadata
ALTER TABLE "SeoMetadata" ADD COLUMN "locale" "SiteLocale" NOT NULL DEFAULT 'en';
DROP INDEX IF EXISTS "SeoMetadata_route_key";
CREATE UNIQUE INDEX "SeoMetadata_route_locale_key" ON "SeoMetadata"("route", "locale");

-- AlterTable MediaAsset
ALTER TABLE "MediaAsset" ADD COLUMN "publicUrl" TEXT;
