/*
  Warnings:

  - Added the required column `size` to the `AdPurchase` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `AdPurchase` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Donation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AdPurchase" ADD COLUMN     "note" TEXT,
ADD COLUMN     "size" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "name" SET NOT NULL;
