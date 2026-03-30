-- Rollback: remove sprint reference from tasks, drop sprints table
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_sprintId_fkey";
ALTER TABLE "tasks" DROP COLUMN IF EXISTS "sprintId";
DROP INDEX IF EXISTS "tasks_projectId_sprintId_status_idx";
DROP TABLE IF EXISTS "sprints" CASCADE;
DROP TYPE IF EXISTS "SprintStatus";
