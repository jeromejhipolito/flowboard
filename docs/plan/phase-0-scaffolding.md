# Phase 0 — Project Scaffolding & Infrastructure

**Duration:** 2-3 days
**Goal:** Monorepo skeleton, database schema, Docker dev environment, CI pipeline

---

## Step 0.1: Monorepo Setup

- [ ] Initialize pnpm workspace at `flowboard/`
- [ ] Create `apps/api/` — scaffold NestJS app (`@nestjs/cli`)
  - Install: `@nestjs/config`, `@nestjs/swagger`, `class-validator`, `class-transformer`
  - Configure `ConfigModule` with Joi env validation
  - Setup Swagger at `/api/docs`
- [ ] Create `apps/web/` — scaffold NextJS 15 app (App Router, TypeScript, Tailwind)
  - Install: `shadcn/ui` (init with New York style), `tailwind-merge`, `clsx`
  - Configure Tailwind with custom design tokens (spacing, colors, radius, shadows)
- [ ] Create `packages/shared/` — shared Zod schemas, types, constants
  - Export role enums: `OWNER | ADMIN | MEMBER | VIEWER`
  - Export priority enums: `LOW | MEDIUM | HIGH | URGENT`
  - Export status enums: `BACKLOG | TODO | IN_PROGRESS | IN_REVIEW | DONE`
- [ ] Configure TypeScript path aliases across all packages
- [ ] Add `.env.example` with all required variables documented

## Step 0.2: Database & Prisma Setup

- [ ] Install Prisma in `apps/api/`
- [ ] Create initial `schema.prisma` with ALL entities:

```prisma
// Key entities (full schema in prisma/schema.prisma)
model User {
  id, email, password, firstName, lastName, avatarUrl,
  memberships, assignedTasks, reportedTasks, comments, notifications
}

model Workspace {
  id, name, slug (unique), description,
  memberships, projects, labels
}

model WorkspaceMembership {
  id, userId, workspaceId, role (enum), invitedBy,
  invitedAt, joinedAt
  @@unique([userId, workspaceId])
}

model Project {
  id, workspaceId, name, description, status (enum),
  tasks, createdAt, updatedAt
}

model Task {
  id, projectId, parentTaskId (nullable self-ref),
  title, description, status (enum), priority (enum),
  assigneeId, reporterId, position (Float for fractional indexing),
  dueDate, storyPoints,
  childTasks, labels (M2M), comments, auditLogs,
  createdAt, updatedAt
}

model Label {
  id, workspaceId, name, color,
  tasks (M2M via TaskLabel)
}

model Comment {
  id, taskId, authorId, parentCommentId (nullable self-ref),
  body, editedAt, createdAt
}

model AuditLog {
  id, actorId, resourceType, resourceId,
  action (enum), before (Json), after (Json),
  occurredAt
}

model Notification {
  id, recipientId, actorId,
  type (enum), resourceType, resourceId,
  read, readAt, createdAt
}
```

- [ ] Run `prisma migrate dev` — verify schema creates cleanly
- [ ] Create seed script (`prisma/seed.ts`) with realistic demo data
  - 2 workspaces, 5 users, 3 projects, 20+ tasks across columns

## Step 0.3: Docker Compose

- [ ] Create `docker-compose.yml`:
  - `postgres:16` — port 5432, named volume
  - `redis:7` — port 6379
  - `api` — NestJS dev server (hot reload), port 3001
  - `web` — NextJS dev server, port 3000
- [ ] Add health checks for postgres and redis
- [ ] Test: `docker compose up` boots all services cleanly

## Step 0.4: CI & Quality Gates

- [ ] Add ESLint + Prettier configs (shared across workspace)
- [ ] Add `lint-staged` + `husky` pre-commit hook
- [ ] Create GitHub Actions workflow: lint → type-check → build
- [ ] Add `.gitignore` (node_modules, .env, .next, dist, postgres data)

## Completion Criteria
- `docker compose up` starts all services
- `prisma studio` shows all tables with correct relations
- `localhost:3001/api/docs` shows Swagger UI
- `localhost:3000` shows NextJS landing page
- Seed data populates realistic demo content
