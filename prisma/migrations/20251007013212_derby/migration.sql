/*
  Warnings:

  - You are about to drop the `Stats` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DerbyStatus" AS ENUM ('CREATED', 'POST_DRAFT', 'COMPLETE');

-- DropTable
DROP TABLE "Stats";

-- CreateTable
CREATE TABLE "DerbyStats" (
    "id" TEXT NOT NULL,
    "status" "DerbyStatus" NOT NULL DEFAULT 'CREATED',
    "totalRaised" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalStandings" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DerbyStats_pkey" PRIMARY KEY ("id")
);
