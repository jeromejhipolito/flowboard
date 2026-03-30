-- Performance indexes based on slow query analysis
-- These cover the most frequently hit query patterns that were missing indexes

-- Tasks: velocity query uses date_trunc on completedAt
CREATE INDEX "tasks_completedAt_idx" ON "tasks"("completedAt");

-- Tasks: sort by createdAt for list view default ordering
CREATE INDEX "tasks_createdAt_idx" ON "tasks"("createdAt");

-- Notifications: paginated list orders by createdAt DESC with read filter
CREATE INDEX "notifications_recipientId_read_createdAt_idx" ON "notifications"("recipientId", "read", "createdAt" DESC);

-- Workspace memberships: findAllForUser queries by userId
CREATE INDEX "workspace_memberships_userId_idx" ON "workspace_memberships"("userId");

-- Tasks: overdue query filters by dueDate + status
CREATE INDEX "tasks_dueDate_status_idx" ON "tasks"("dueDate", "status") WHERE "dueDate" IS NOT NULL AND "deletedAt" IS NULL;

-- Sprints: find active sprint for a project (fast lookup)
CREATE INDEX "sprints_projectId_active_idx" ON "sprints"("projectId") WHERE "status" = 'ACTIVE';
