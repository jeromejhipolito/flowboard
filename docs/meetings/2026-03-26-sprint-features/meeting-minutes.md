# FlowBoard — Sprint Features Meeting Minutes

**Date:** 2026-03-26
**Type:** New Feature Evaluation
**Attendees:** CTO, Product Manager, Frontend Engineer, Data Analyst
**Status:** APPROVED — Ready for planning

---

## Problem Statement

Tasks marked DONE stay on the Kanban board forever, cluttering the view. At ~80+ tasks per project, the board becomes unusable. The developer needs sprint functionality to time-box work, archive completed tasks, and keep the board focused on active work.

---

## Features Evaluated

| # | Feature | Priority | Effort | Decision |
|---|---------|----------|--------|----------|
| 1 | **Sprint functionality** | P0 (core) | 3-4 weeks | BUILD — main goal |
| 2 | **List view** | P1 | 2 weeks | BUILD — stub exists, high value |
| 3 | **Card expand/collapse** | P2 | 0.5 weeks | BUILD — pure frontend, quick win |
| 4 | **Search** | P3 | 1.5 weeks | BUILD — backend already supports it |
| 5 | **Past sprint viewer** | P1.5 | 1-1.5 weeks | BUILD — nearly free after sprints |

---

## Key Architecture Decisions

### Decision 1: Sprint as Filter Lens (Not Archive)
**Adopted:** Sprint is a grouping tag on tasks, not a data container. Tasks stay in the Task table. Completing a sprint marks it CLOSED; the board excludes DONE tasks from closed sprints.
**Rejected:** Hard archive (copying tasks to separate table) — destroys audit trail, breaks FK relationships.
**Rejected:** Soft-move with `archivedAt` — adds unnecessary filter complexity.

### Decision 2: Sprint Completion is Atomic
The completion flow runs in a `$transaction`:
1. Set sprint.status = CLOSED, sprint.completedAt = now()
2. DONE tasks keep their sprintId (for past sprint viewer)
3. Incomplete tasks: move to next sprint or set sprintId = null (backlog)

### Decision 3: Active Sprint Per Project
Add `activeSprintId` to Project model for O(1) lookup. Enforce one ACTIVE sprint per project at the DB level via `@unique`.

### Decision 4: Board Query Changes
Board loads tasks WHERE `sprintId = activeSprintId OR sprintId IS NULL`. The "All Tasks" option removes the sprint filter entirely.

### Decision 5: Search is Client-Side for v1
Backend `search` param already exists in `TaskQueryDto`. With ≤100 tasks loaded, client-side filtering is instant. No new API endpoint needed for within-project search.

### Decision 6: Card Density in Zustand with localStorage
Compact/expanded toggle persisted via `zustand/middleware persist`. Per-column collapse stored as `Set<TaskStatus>` in the same store.

---

## Data Model (CTO + Data Analyst Consensus)

### New: Sprint Model
```prisma
enum SprintStatus {
  PLANNING
  ACTIVE
  CLOSED
}

model Sprint {
  id           String       @id @default(cuid())
  projectId    String
  name         String
  goal         String?
  status       SprintStatus @default(PLANNING)
  startDate    DateTime?
  endDate      DateTime?
  completedAt  DateTime?
  scopeAtStart Int?         // task count when sprint went ACTIVE (for scope change metric)
  carriedOver  Int?         // count of tasks moved out on completion
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks   Task[]

  @@index([projectId, status])
  @@map("sprints")
}
```

### Task Model Addition
```prisma
sprintId String?
sprint   Sprint? @relation(fields: [sprintId], references: [id], onDelete: SetNull)
@@index([projectId, sprintId, status])
```

### Project Model Addition
```prisma
activeSprintId String? @unique
```

---

## API Design (CTO)

### Sprint Endpoints (new SprintsModule)
```
POST   /projects/:projectId/sprints          — Create sprint
GET    /projects/:projectId/sprints           — List sprints (?status=ACTIVE|CLOSED)
GET    /projects/:projectId/sprints/active    — Get active sprint (fast)
GET    /sprints/:sprintId                     — Sprint detail + task summary
PATCH  /sprints/:sprintId                     — Update name/goal/dates
POST   /sprints/:sprintId/start              — Start sprint (set ACTIVE)
POST   /sprints/:sprintId/complete           — Complete sprint (atomic transaction)
DELETE /sprints/:sprintId                     — Delete (PLANNING only, no tasks)
```

### Existing Endpoint Changes
- `GET /projects/:projectId/tasks` — add optional `sprintId` query param
- `PATCH /tasks/:id` — add optional `sprintId` to UpdateTaskDto
- Search: extend `search` param to also match `description` (OR query)

---

## Screen Designs (Product Manager)

### Sprint Selector on Board
```
┌────────────────────────────────────────────────────┐
│ Sprint: Sprint 2 — Mar 24–Apr 7  ▼ │ + Create Task│
├────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐               │
│  │ Sprint 2 (active)    ✓  Mar 24 │               │
│  │ Sprint 1 (completed)    Mar 10 │               │
│  │ ─────────────────────────────  │               │
│  │ All Tasks                      │               │
│  │ Backlog (unassigned)           │               │
│  │ ─────────────────────────────  │               │
│  │ + Create new sprint            │               │
│  │ Complete Sprint 2...           │ ← red text    │
│  └─────────────────────────────────┘               │
└────────────────────────────────────────────────────┘
```

### Sprint Completion Dialog
```
┌─────────────────────────────────────────┐
│ Complete Sprint 2                   [X] │
│─────────────────────────────────────────│
│ Mar 24–Apr 7 • Goal: Ship v2 auth      │
│                                         │
│  ✓ 8 tasks completed                   │
│  ○ 3 tasks incomplete                  │
│  ████████████████░░░░░ 72%             │
│                                         │
│ Move incomplete tasks to:               │
│ (●) Backlog                            │
│ ( ) Sprint 3 (Mar 24–Apr 21)          │
│                                         │
│ ⚠ This cannot be undone.              │
│                                         │
│ [Cancel]         [Complete Sprint]      │
└─────────────────────────────────────────┘
```

### List View
```
┌─────────────────────────────────────────────────────┐
│ Sprint: Sprint 2 ▼ │ + Create │ Filter │ Search... │
├─────────────────────────────────────────────────────┤
│ Title ↕      Status ↕    Priority ↕  Assignee ↕    │
├─────────────────────────────────────────────────────┤
│ ▼ IN PROGRESS (2)                                   │
│ Fix token bug  IN_PROG   HIGH    Jerome   Apr 3    │
│ Dashboard      IN_PROG   MED     —        Apr 7    │
├─────────────────────────────────────────────────────┤
│ ▼ TO DO (3)                                         │
│ ...                                                  │
└─────────────────────────────────────────────────────┘
```

### Card Compact vs Expanded
```
COMPACT: ▌Fix token bug  HIGH · Apr 3 · 💬3  [JD]
EXPANDED: ▌Fix token bug
          │ The refresh token expires silently...
          │ [Auth] [Bug]  HIGH · 3pts · Apr 3  [JD]
          │ ▶ 2/5 subtasks
```

### Past Sprint Viewer
```
Sprint History
┌─────────────────────────────────────────────┐
│ Sprint 2 • Mar 24–Apr 7 • ACTIVE       [▼] │
├─────────────────────────────────────────────┤
│ Sprint 1 • Mar 10–23 • COMPLETED  72% [▼]  │
│  Goal: Ship v1 auth flow                    │
│  ████████████████░░░░░ 72%                  │
│  DONE (8)              CARRIED OVER (3)     │
│  ✓ Auth login   HIGH   ○ Fix token  IN_PROG│
│  ✓ JWT impl     HIGH   ○ Auth tests TODO   │
│  ...                    ○ API docs  BACKLOG │
└─────────────────────────────────────────────┘
```

---

## Sprint Analytics (Data Analyst)

### New Metrics Enabled
1. **Sprint Burndown** — line chart: ideal remaining vs actual remaining per day
2. **Sprint Velocity** — bar chart: story points completed per sprint (not calendar week)
3. **Completion Rate** — stat card with progress bar per sprint
4. **Carry-over Rate** — % of tasks that didn't finish, tracked per sprint
5. **Sprint Health Score** — composite: `completionRate * 0.5 + (1-carryover) * 0.3 + (1-scopeChange) * 0.2`

### Analytics Page Change
Add a **scope selector**: `[All Time] [Sprint: Sprint 2 ▼]`
- All existing charts accept optional `sprintId` param
- When sprint selected: velocity slot shows burndown instead

### Denormalized Fields on Sprint
- `scopeAtStart: Int?` — set when sprint goes ACTIVE
- `carriedOver: Int?` — set when sprint completes

---

## Build Order (All Roles Agree)

| Week | Feature | Backend | Frontend |
|------|---------|---------|----------|
| 1 | List view | None needed | Replace placeholder, table + sort + filter |
| 1 | Card expand/collapse | None needed | Zustand + TaskCard density prop |
| 2-3 | Sprint backend | Schema + SprintsModule + API | — |
| 3 | Sprint selector + assign | — | SprintSelector + board integration |
| 4 | Sprint completion flow | Complete endpoint + transaction | Dialog + board refresh |
| 4 | Search | Extend search to description | Board toolbar search input |
| 5 | Past sprint viewer | — | Sprints page + accordion list |
| 5 | Sprint analytics | Sprint-scoped endpoints | Burndown chart + scope selector |

**Total: ~5 weeks for a solo developer**

---

## Interview Narrative (PM)

> "I built sprint functionality because the Kanban board was accumulating completed tasks with no way to close them out. The sprint completion flow is an atomic transaction that archives DONE tasks and moves incomplete work to the next sprint. The most interesting part was the data model decision — sprints are a filter lens, not a data container, so tasks keep their full audit trail."
