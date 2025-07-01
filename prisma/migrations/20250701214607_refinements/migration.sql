/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DraftPick` table. All the data in the column will be lost.
  - You are about to drop the column `round` on the `DraftPick` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `DraftPick` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[headCoachId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[derbyDarlingId]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `DraftPick` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "GlobalRole" ADD VALUE 'HEAD_COACH';

-- DropForeignKey
ALTER TABLE "DraftPick" DROP CONSTRAINT "DraftPick_userId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- AlterTable
ALTER TABLE "DraftPick" DROP COLUMN "createdAt",
DROP COLUMN "round",
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "derbyDarlingId" TEXT,
ADD COLUMN     "headCoachId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "teamId" TEXT;

-- DropTable
DROP TABLE "Image";

-- DropTable
DROP TABLE "TeamMember";

-- DropEnum
DROP TYPE "TeamRole";

-- CreateIndex
CREATE UNIQUE INDEX "DraftPick_userId_key" ON "DraftPick"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_headCoachId_key" ON "Team"("headCoachId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_derbyDarlingId_key" ON "Team"("derbyDarlingId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_headCoachId_fkey" FOREIGN KEY ("headCoachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_derbyDarlingId_fkey" FOREIGN KEY ("derbyDarlingId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftPick" ADD CONSTRAINT "DraftPick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
