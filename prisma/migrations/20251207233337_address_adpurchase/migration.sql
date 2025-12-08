/*
  Warnings:

  - Changed the type of `size` on the `AdPurchase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "AdPurchase" ADD COLUMN     "address" TEXT,
DROP COLUMN "size",
ADD COLUMN     "size" "AdSize" NOT NULL;
