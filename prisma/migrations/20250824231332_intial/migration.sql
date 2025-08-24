/*
  Warnings:

  - You are about to drop the column `pickNumber` on the `DraftPick` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[draftId,userId]` on the table `DraftPick` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[draftId,overallPickNo]` on the table `DraftPick` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[draftId,round,pickInRound]` on the table `DraftPick` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `draftId` to the `DraftPick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallPickNo` to the `DraftPick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickInRound` to the `DraftPick` table without a default value. This is not possible if the table is not empty.
  - Added the required column `round` to the `DraftPick` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('NOT_STARTED', 'ONGOING', 'PAUSED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "PickStatus" AS ENUM ('ANNOUNCED', 'VOIDED');

-- AlterTable
ALTER TABLE "DraftPick" DROP COLUMN "pickNumber",
ADD COLUMN     "announcedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "draftId" TEXT NOT NULL,
ADD COLUMN     "overallPickNo" INTEGER NOT NULL,
ADD COLUMN     "pickInRound" INTEGER NOT NULL,
ADD COLUMN     "round" INTEGER NOT NULL,
ADD COLUMN     "status" "PickStatus" NOT NULL DEFAULT 'ANNOUNCED';

-- CreateTable
CREATE TABLE "Draft" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DraftStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "roundCount" INTEGER NOT NULL,
    "currentPickNo" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamOrder" TEXT[],

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DraftPick_draftId_teamId_idx" ON "DraftPick"("draftId", "teamId");

-- CreateIndex
CREATE INDEX "DraftPick_draftId_round_idx" ON "DraftPick"("draftId", "round");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_draftId_userId_key" ON "DraftPick"("draftId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_draftId_overallPickNo_key" ON "DraftPick"("draftId", "overallPickNo");

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_draftId_round_pickInRound_key" ON "DraftPick"("draftId", "round", "pickInRound");

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
