/*
  Warnings:

  - You are about to drop the column `quantity` on the `TshirtPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `TshirtPurchase` table. All the data in the column will be lost.
  - Added the required column `sizeQty` to the `TshirtPurchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TshirtPurchase" DROP COLUMN "quantity",
DROP COLUMN "size",
ADD COLUMN     "sizeQty" JSONB NOT NULL;
