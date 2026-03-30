-- Rollback: drop audit logs and notifications
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TYPE IF EXISTS "NotificationType";
DROP TYPE IF EXISTS "AuditAction";
