-- Rollback: drop labels, task_labels, and comments
DROP TABLE IF EXISTS "task_labels" CASCADE;
DROP TABLE IF EXISTS "comments" CASCADE;
DROP TABLE IF EXISTS "labels" CASCADE;
