-- Rollback: remove timezone column from users
ALTER TABLE "users" DROP COLUMN IF EXISTS "timezone";
