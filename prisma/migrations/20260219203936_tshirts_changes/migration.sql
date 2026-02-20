/*
  Warnings:

  - You are about to drop the column `size` on the `Tshirt` table. All the data in the column will be lost.
  - The `sizeQty` column on the `TshirtPurchase` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tshirt" DROP COLUMN "size",
ADD COLUMN     "imagePublicIds" TEXT[];

-- AlterTable
ALTER TABLE "TshirtPurchase" DROP COLUMN "sizeQty",
ADD COLUMN     "sizeQty" JSONB[];
