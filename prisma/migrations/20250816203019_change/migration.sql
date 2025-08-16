/*
  Warnings:

  - The values [DERBY_DARLING] on the enum `GlobalRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `derbyDarlingId` on the `Team` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GlobalRole_new" AS ENUM ('ADMIN', 'JUDGE', 'BROTHER', 'HEAD_COACH');
ALTER TABLE "User" ALTER COLUMN "globalRole" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "globalRole" TYPE "GlobalRole_new" USING ("globalRole"::text::"GlobalRole_new");
ALTER TYPE "GlobalRole" RENAME TO "GlobalRole_old";
ALTER TYPE "GlobalRole_new" RENAME TO "GlobalRole";
DROP TYPE "GlobalRole_old";
ALTER TABLE "User" ALTER COLUMN "globalRole" SET DEFAULT 'BROTHER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_derbyDarlingId_fkey";

-- DropIndex
DROP INDEX "Team_derbyDarlingId_key";

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "derbyDarlingId",
ADD COLUMN     "derbyDarlingImageUrl" TEXT,
ADD COLUMN     "derbyDarlingName" TEXT,
ADD COLUMN     "derbyDarlingPublicId" TEXT;
