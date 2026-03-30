-- AlterTable
-- Adding completedAt for accurate velocity tracking.
-- Previously used updatedAt as proxy which counted title edits as completions.
ALTER TABLE "tasks" ADD COLUMN "completedAt" TIMESTAMP(3);
