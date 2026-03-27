# Phase 2 — Sprint Backend: Schema + API (BR-1 backend)

**Duration:** 1.5 weeks | **Frontend work:** None — pure backend
**Prerequisite:** None (can run parallel to Phase 1)

---

## Step 2.1: Prisma Schema Migration (2 hrs)

**EDIT:** `apps/api/prisma/schema.prisma`
- [ ] Add SprintStatus enum: `PLANNING | ACTIVE | CLOSED`
- [ ] Add Sprint model:
  ```prisma
  model Sprint {
    id           String       @id @default(cuid())
    projectId    String
    name         String
    goal         String?
    status       SprintStatus @default(PLANNING)
    startDate    DateTime?
    endDate      DateTime?
    completedAt  DateTime?
    scopeAtStart Int?
    carriedOver  Int?
    createdAt    DateTime     @default(now())
    updatedAt    DateTime     @updatedAt
    project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
    tasks        Task[]
    @@index([projectId, status])
    @@map("sprints")
  }
  ```
- [ ] Add to Task: `sprintId String?`, `sprint Sprint? @relation(...)`, `onDelete: SetNull`
- [ ] Add index: `@@index([projectId, sprintId, status])` on Task
- [ ] Add to Project: `activeSprintId String? @unique`
- [ ] Run `npx prisma generate`
- [ ] Update seed script: create 2 sprints, assign tasks to Sprint 1 (CLOSED) and Sprint 2 (ACTIVE)

## Step 2.2: Sprints Module — Service (4 hrs)

**NEW:** `apps/api/src/sprints/sprints.module.ts`
**NEW:** `apps/api/src/sprints/sprints.service.ts`

Service methods:
- [ ] `create(projectId, dto)` — create sprint in PLANNING status
- [ ] `findAllByProject(projectId, query?)` — list sprints, filter by status
- [ ] `findActive(projectId)` — return active sprint via project.activeSprintId
- [ ] `findById(sprintId)` — sprint detail with task summary stats (done/total/points)
- [ ] `update(sprintId, dto)` — update name/goal/dates (PLANNING or ACTIVE only)
- [ ] `start(sprintId)` — validate no other ACTIVE sprint, set ACTIVE, set project.activeSprintId, set scopeAtStart = task count
- [ ] `complete(sprintId, dto: { nextSprintId? })` — atomic $transaction:
  1. Set sprint.status = CLOSED, completedAt = now()
  2. Count tasks WHERE sprintId AND status != DONE → set sprint.carriedOver
  3. Incomplete tasks: set sprintId = nextSprintId or null
  4. If nextSprintId: set project.activeSprintId = nextSprintId, else set null
  5. Emit `sprint.completed` event via EventEmitter2
- [ ] `delete(sprintId)` — only PLANNING status with no assigned tasks

## Step 2.3: Sprints Module — Controller + DTOs (3 hrs)

**NEW:** `apps/api/src/sprints/sprints.controller.ts`
Routes (all under ProjectMemberGuard):
- [ ] `POST /projects/:projectId/sprints` — MEMBER+ role
- [ ] `GET /projects/:projectId/sprints` — query: ?status, ?limit, ?cursor
- [ ] `GET /projects/:projectId/sprints/active` — fast active sprint lookup
- [ ] `GET /sprints/:sprintId` — sprint detail
- [ ] `PATCH /sprints/:sprintId` — update (ADMIN+ for dates, MEMBER+ for goal)
- [ ] `POST /sprints/:sprintId/start` — start sprint (ADMIN+)
- [ ] `POST /sprints/:sprintId/complete` — complete sprint (ADMIN+)
- [ ] `DELETE /sprints/:sprintId` — delete planning sprint (ADMIN+)

**NEW DTOs:**
- [ ] `create-sprint.dto.ts` — name (required), goal?, startDate?, endDate?
- [ ] `update-sprint.dto.ts` — PartialType of create
- [ ] `complete-sprint.dto.ts` — nextSprintId? (optional)
- [ ] `sprint-query.dto.ts` — status?, limit?, cursor?

## Step 2.4: Task Query Sprint Filter (1 hr)

**EDIT:** `apps/api/src/tasks/dto/task-query.dto.ts`
- [ ] Add `sprintId?: string` (optional filter)

**EDIT:** `apps/api/src/tasks/tasks.service.ts` — `findAllByProject`
- [ ] Add sprint filter: `...(sprintId && { sprintId })` in where clause
- [ ] Special value `sprintId === 'backlog'` → `{ sprintId: null }`

**EDIT:** `apps/api/src/tasks/dto/update-task.dto.ts`
- [ ] Add `sprintId?: string | null` to allow sprint assignment via PATCH

## Step 2.5: WebSocket Sprint Events (1 hr)

**EDIT:** `apps/api/src/gateway/events.gateway.ts`
- [ ] Add `@OnEvent('sprint.completed')` listener
- [ ] Emit `sprint:completed` to `board:{projectId}` room
- [ ] Payload: `{ projectId, sprintId, nextSprintId }`

**EDIT:** `apps/api/src/gateway/types.ts`
- [ ] Add `SprintEvent` interface

## Step 2.6: Search Enhancement (30 min)

**EDIT:** `apps/api/src/tasks/tasks.service.ts` — `findAllByProject`
- [ ] Extend search to also match description:
  ```ts
  ...(search && {
    OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ],
  }),
  ```

## Step 2.7: Register Module + Verify (1 hr)

**EDIT:** `apps/api/src/app.module.ts` — import SprintsModule
- [ ] Run `npx prisma generate` + `npx nest build` — zero errors
- [ ] Test endpoints via curl
