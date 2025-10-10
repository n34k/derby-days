-- AlterTable
ALTER TABLE "AdPurchase" ALTER COLUMN "stripeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "stripeId" DROP NOT NULL;
