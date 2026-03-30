-- Rollback: remove completedAt column from tasks
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "completedAt";
