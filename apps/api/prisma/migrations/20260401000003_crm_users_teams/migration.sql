-- CreateTable
CREATE TABLE IF NOT EXISTS "CrmUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CrmUser_email_key" ON "CrmUser"("email");
CREATE INDEX IF NOT EXISTS "CrmUser_isActive_idx" ON "CrmUser"("isActive");

-- CreateTable
CREATE TABLE IF NOT EXISTS "CrmTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CrmTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmTeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CrmTeamMember_teamId_userId_key" ON "CrmTeamMember"("teamId", "userId");
CREATE INDEX IF NOT EXISTS "CrmTeamMember_userId_idx" ON "CrmTeamMember"("userId");

-- AddForeignKey
DO $$ BEGIN
 ALTER TABLE "CrmTeamMember" ADD CONSTRAINT "CrmTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "CrmTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "CrmTeamMember" ADD CONSTRAINT "CrmTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CrmUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

