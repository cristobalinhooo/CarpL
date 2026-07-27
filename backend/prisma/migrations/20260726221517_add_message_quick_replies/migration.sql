-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "quick_replies" TEXT[] DEFAULT ARRAY[]::TEXT[];
