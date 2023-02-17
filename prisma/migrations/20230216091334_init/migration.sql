-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('JUNIOR', 'INTERMEDIATE', 'SENIOR');

-- CreateEnum
CREATE TYPE "BuidlerOnProjectStatus" AS ENUM ('PENDING', 'ACTIVE');

-- CreateEnum
CREATE TYPE "BuidlerStatus" AS ENUM ('PENDING', 'READYTOMINT', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('LAUNCHED', 'WIP');

-- CreateTable
CREATE TABLE "BuidlerOnProject" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "projectId" INTEGER NOT NULL,
    "projectRole" TEXT[],
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "buidlerId" INTEGER,
    "status" "BuidlerOnProjectStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "BuidlerOnProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buidler" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "name" TEXT,
    "description" TEXT,
    "image" TEXT,
    "avatar" TEXT,
    "role" TEXT[],
    "address" TEXT,
    "status" "BuidlerStatus" NOT NULL DEFAULT 'PENDING',
    "skills" JSONB,
    "interests" TEXT[],
    "contacts" JSONB,
    "nonce" TEXT,
    "ipfsURI" TEXT,
    "privateContacts" JSONB,

    CONSTRAINT "Buidler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LXPoint" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "reason" TEXT,
    "value" INTEGER NOT NULL,
    "operator" TEXT NOT NULL DEFAULT '+',
    "buidlerId" INTEGER,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "LXPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "banner" TEXT,
    "logo" TEXT,
    "logoLarge" TEXT,
    "status" "ProjectStatus",
    "tags" TEXT[],
    "launchDate" TIMESTAMP(3),
    "links" JSONB,
    "isAbleToJoin" BOOLEAN,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Buidler" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Buidler_address_key" ON "Buidler"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Project_number_key" ON "Project"("number");

-- CreateIndex
CREATE UNIQUE INDEX "_Buidler_AB_unique" ON "_Buidler"("A", "B");

-- CreateIndex
CREATE INDEX "_Buidler_B_index" ON "_Buidler"("B");

-- AddForeignKey
ALTER TABLE "BuidlerOnProject" ADD CONSTRAINT "BuidlerOnProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuidlerOnProject" ADD CONSTRAINT "BuidlerOnProject_buidlerId_fkey" FOREIGN KEY ("buidlerId") REFERENCES "Buidler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LXPoint" ADD CONSTRAINT "LXPoint_buidlerId_fkey" FOREIGN KEY ("buidlerId") REFERENCES "Buidler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Buidler" ADD CONSTRAINT "_Buidler_A_fkey" FOREIGN KEY ("A") REFERENCES "Buidler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Buidler" ADD CONSTRAINT "_Buidler_B_fkey" FOREIGN KEY ("B") REFERENCES "Buidler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
