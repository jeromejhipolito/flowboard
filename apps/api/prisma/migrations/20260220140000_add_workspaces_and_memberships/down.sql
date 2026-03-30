-- Rollback: drop workspaces and memberships
DROP TABLE IF EXISTS "workspace_memberships" CASCADE;
DROP TABLE IF EXISTS "workspaces" CASCADE;
DROP TYPE IF EXISTS "WorkspaceRole";
