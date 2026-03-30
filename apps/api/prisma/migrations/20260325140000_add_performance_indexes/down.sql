-- Rollback: remove performance indexes
DROP INDEX IF EXISTS "tasks_completedAt_idx";
DROP INDEX IF EXISTS "tasks_createdAt_idx";
DROP INDEX IF EXISTS "notifications_recipientId_read_createdAt_idx";
DROP INDEX IF EXISTS "workspace_memberships_userId_idx";
DROP INDEX IF EXISTS "tasks_dueDate_status_idx";
DROP INDEX IF EXISTS "sprints_projectId_active_idx";
