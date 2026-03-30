# FlowBoard — Testing Strategy Meeting Minutes

**Date:** 2026-03-29
**Type:** Comprehensive Test Plan
**Attendees:** QA Engineer, Backend Engineer, Frontend Engineer
**Status:** APPROVED — 406 test cases identified

---

## Test Inventory Summary

| Layer | Category | Tests | Priority |
|-------|----------|-------|----------|
| **Backend** | Controllers (12) | 120 | P0 |
| **Backend** | Services (key 4) | 96 | P0 |
| **Backend** | Guards (4) + DTOs | 40 | P1 |
| **Frontend** | Forms (8 components) | 69 | P0 |
| **Frontend** | Interactive (5 components) | 44 | P1 |
| **Frontend** | Hooks (5) | 37 | P2 |
| **Frontend** | Additional (from FE audit) | **+30** extra on top | P1 |
| **Grand Total** | | **406+** | |

**Current state:** 7 tests exist (auth.service: 3, workspace-member.guard: 4)
**Target:** 406 tests across 50+ test files

---

## Backend Test Plan (256 tests)

### Controllers — 120 tests across 12 files

| Controller | Endpoints | Tests |
|-----------|-----------|-------|
| Auth | 5 | 18 |
| Users | 2 | 7 |
| Workspaces | 9 | 39 |
| Projects | 5 | 18 |
| Tasks | 8 | 41 |
| Labels | 4 | 17 |
| Comments | 4 | 18 |
| Notifications | 4 | 15 |
| Analytics | 7 | 21 |
| Sprints | 8 | 35 |
| Health | 1 | 4 |
| AI | 1 | 7 |

### Services — 96 tests across 4 key files

| Service | Tests | Why Priority |
|---------|-------|-------------|
| auth.service | 18 | Token rotation, password hashing |
| tasks.service | 28 | Fractional indexing, completedAt, rebalance |
| workspaces.service | 22 | RBAC escalation, slug generation |
| sprints.service | 28 | Atomic completion, carry-over, state machine |

### Guards + DTOs — 40 tests

| Guard/DTO | Tests |
|-----------|-------|
| workspace-member.guard | 10 (expand from 4) |
| project-member.guard | 12 |
| roles.guard | 8 |
| DTO validation | 10 |

---

## Frontend Test Plan (150+ tests)

### Forms — 69 tests across 8 components

| Component | Test File | Tests |
|-----------|----------|-------|
| LoginPage | auth/login.test.tsx | 12 |
| RegisterPage | auth/register.test.tsx | 10 |
| CreateWorkspaceModal | workspace/create-workspace-modal.test.tsx | 10 |
| CreateProjectModal | workspace/create-project-modal.test.tsx | 5 |
| InviteMemberModal | workspace/invite-member-modal.test.tsx | 7 |
| CreateTaskModal | board/create-task-modal.test.tsx | 9 |
| CreateSprintModal | sprint/create-sprint-modal.test.tsx | 6 |
| CompleteSprintDialog | sprint/complete-sprint-dialog.test.tsx | 13 |

### Interactive Components — 44 tests

| Component | Tests |
|-----------|-------|
| TaskCard | 14 |
| KanbanColumn | 10 |
| KanbanBoard | 6 |
| BoardSearch | 6 |
| SprintSelector | 13 |
| ThemeToggle | 9 |
| NotificationBell | 10 |
| Sidebar | 16 |
| DueDateTimezoneBreakdown | 7 |
| ConfirmDialog | 7 |
| SettingsPage | 10 |

### Hooks — 37 tests

| Hook | Tests |
|------|-------|
| use-auth | 10 |
| use-tasks | 8 |
| use-sprints | 8 |
| use-notifications | 6 |
| use-workspaces | 5 |

---

## Security Bugs Found During Audit

| # | Issue | Risk |
|---|-------|------|
| 1 | `GET/PATCH/DELETE /projects/:id` — no membership guard | Any auth'd user can access any project |
| 2 | `PATCH/DELETE /labels/:id` — no workspace guard | Any auth'd user can edit any label |
| 3 | Analytics controller — no membership guard | Any auth'd user can view any project's analytics |
| 4 | OWNER can self-demote | Sole owner demotion leaves workspace without owner |

---

## Implementation Priority

### Phase 1 — Highest Risk (write first)
1. `sprints.service.spec.ts` (28 tests) — atomic completion transaction
2. `tasks.service.spec.ts` (28 tests) — moveTask rebalance
3. `workspaces.service.spec.ts` (22 tests) — RBAC escalation
4. `auth.service.spec.ts` (expand to 18 tests)

### Phase 2 — Controllers
5. All 12 controller spec files (120 tests)

### Phase 3 — Frontend Forms
6. All 8 form component tests (69 tests)

### Phase 4 — Frontend Interactive + Hooks
7. Interactive components (44 tests)
8. Hook tests (37 tests)

### Phase 5 — Guards + DTOs
9. Guard specs (30 tests)
10. DTO validation (10 tests)

**Estimated effort:** 3-4 days for a solo developer writing all 406 tests
