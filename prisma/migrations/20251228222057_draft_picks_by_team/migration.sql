-- AlterEnum
ALTER TYPE "PickStatus" ADD VALUE 'PICK_IS_IN';

-- AlterTable
ALTER TABLE "Draft" ADD COLUMN     "picksByTeam" TEXT[];
