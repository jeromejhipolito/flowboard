-- AlterTable
-- Adding timezone field for timezone-aware due date display.
-- IANA format e.g. "Asia/Manila", "America/New_York"
ALTER TABLE "users" ADD COLUMN "timezone" TEXT;
