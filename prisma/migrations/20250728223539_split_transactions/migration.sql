/*
  Warnings:

  - You are about to drop the `ExternalTransaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `email` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalTransaction" DROP CONSTRAINT "ExternalTransaction_teamId_fkey";

-- DropForeignKey
ALTER TABLE "ExternalTransaction" DROP CONSTRAINT "ExternalTransaction_userId_fkey";

-- AlterTable
ALTER TABLE "Donation" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "note" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "ExternalTransaction";

-- DropEnum
DROP TYPE "TransactionType";

-- CreateTable
CREATE TABLE "AdPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "stripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TshirtPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TshirtPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdPurchase_stripeId_key" ON "AdPurchase"("stripeId");

-- CreateIndex
CREATE UNIQUE INDEX "TshirtPurchase_stripeId_key" ON "TshirtPurchase"("stripeId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdPurchase" ADD CONSTRAINT "AdPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdPurchase" ADD CONSTRAINT "AdPurchase_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TshirtPurchase" ADD CONSTRAINT "TshirtPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TshirtPurchase" ADD CONSTRAINT "TshirtPurchase_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
