/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AdSize" AS ENUM ('CENTER_FOLDOUT', 'OUTSIDE_BACK_COVER', 'INSIDE_BACK_COVER', 'INSIDE_FRONT_COVER', 'TWO_PAGES', 'FULL_PAGE', 'HALF_PAGE', 'QUARTER_PAGE', 'BUSINESS_CARD');

-- CreateEnum
CREATE TYPE "TshirtSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "Tshirt" (
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceId" TEXT NOT NULL,
    "quantityAvailable" INTEGER,
    "size" "TshirtSize",

    CONSTRAINT "Tshirt_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "Ad" (
    "productId" TEXT NOT NULL,
    "size" "AdSize" NOT NULL,
    "price" INTEGER NOT NULL,
    "priceId" TEXT NOT NULL,
    "sizeInches" TEXT NOT NULL,
    "quantityAvailable" INTEGER,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("productId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tshirt_priceId_key" ON "Tshirt"("priceId");

-- CreateIndex
CREATE UNIQUE INDEX "Ad_priceId_key" ON "Ad"("priceId");
