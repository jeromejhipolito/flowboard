# FlowBoard — Alert Level Meeting Minutes

**Date:** 2026-03-26
**Type:** Emergency Bug Fix & UX Redesign
**Attendees:** CTO, Frontend Engineer, Backend Engineer, QA Engineer, UX Designer, Product Manager
**Status:** ALERT LEVEL

---

## Agenda

User tested FlowBoard at localhost:3004 and reported:
1. Creating projects doesn't work
2. Stuck in dark mode — theme toggle not visible
3. UI is not interactive — buttons not responding
4. Search feature not working
5. Many features broken/non-functional
6. UI/UX is not appealing — needs design overhaul

---

## Root Cause Analysis (CTO)

**Pattern Inconsistency Failure** — not a QA failure. Three parallel integration patterns exist:
- `CreateWorkspaceModal` uses direct `useState` + `onClick` — **works**
- Command palette uses `window.dispatchEvent` custom events — **zero listeners exist**
- Create Project buttons were scaffolded with no handlers — **dead UI**

The event bus pattern (`flowboard:create-*` events) was introduced without completing the listener side. Zero `addEventListener` calls exist in the entire codebase.

---

## Confirmed Broken Features

| # | Feature | Root Cause | Severity |
|---|---------|-----------|----------|
| 1 | Create Project buttons | No `onClick` handlers (2 instances) | CRITICAL |
| 2 | Create Project modal | Component doesn't exist | CRITICAL |
| 3 | Command palette "Create Task" | Dispatches event, no listener | CRITICAL |
| 4 | Command palette "Create Project" | Dispatches event, no listener | CRITICAL |
| 5 | Command palette "Create Workspace" | Dispatches event, no listener | HIGH |
| 6 | Projects tab | Hardcoded empty state, doesn't fetch real data | HIGH |
| 7 | Theme toggle | Works but buried at sidebar bottom | MEDIUM |
| 8 | Search input | `readOnly`, does nothing on click | MEDIUM |
| 9 | Project routes missing RBAC | No workspace guard on `/projects/:id` | SECURITY |

## Confirmed Working Features

- Auth flow (login, register, refresh, logout) with HttpOnly cookies
- Workspace CRUD (create, list, detail, members, invite)
- Task CRUD + Kanban board + drag-and-drop
- WebSocket real-time sync
- Notifications system
- Analytics dashboard (5 charts)
- AI task parsing endpoint
- Health check endpoint
- All 40+ API endpoints (verified by Backend Engineer)

---

## Decisions Made

### Decision 1: Replace Event Bus with URL-Based Navigation
**Rejected:** `window.dispatchEvent` custom events
**Adopted:** Command palette navigates via `router.push` with `?action=create-task` URL params. Pages listen via `useQueryState('action')`.
**Reason:** Event bus has no type safety, no testability, invisible coupling. URL params are debuggable, bookmarkable, and work with React's render cycle.

### Decision 2: Theme Default
**Adopted:** Keep `defaultTheme="system"` with `enableSystem` but make toggle more prominent (move to top bar).
**Reason:** System preference respects user choice. Toggle visibility is the real fix.

### Decision 3: UI Redesign Scope
**Adopted:** Full color palette swap (indigo-violet primary), dark mode 3-level elevation, card hover lift, kanban column accent bars, sidebar active state redesign, landing page gradient hero.
**Estimated effort:** 90 minutes of CSS/component changes.

### Decision 4: Testing Strategy
**Adopted:** 10 priority tests covering the confirmed broken features. Component tests first, E2E later.

---

## Role Summaries

### CTO — Priority: Fix in 2 hours
- Step 1 (5 min): Theme default
- Step 2 (45 min): CreateProjectModal + wire buttons
- Step 3 (30 min): Wire useProjects into Projects tab
- Step 4 (30 min): Replace event bus with URL navigation
- Step 5 (15 min): Wire board page action listener

### Frontend Engineer — Already implemented fixes
- Created `CreateProjectModal` component
- Wired both Create Project buttons
- Replaced all 3 event dispatches with router navigation + URL params
- Added `useQueryState('action')` listeners to workspace, workspace detail, and board pages
- Fixed ThemeProvider with explicit defaults

### Backend Engineer — API Verified
- All 40+ endpoints verified WORKING
- Slug-based workspace lookup confirmed working
- Security gaps noted (project routes missing RBAC) — non-blocking for demo
- Route ordering safe (notifications)

### QA Engineer — 10 Priority Tests
- Test 1: Create Project button has onClick
- Test 2: Command palette dispatches events
- Test 3: Board page listens for create-task
- Test 4: Auth duplicate email rejection
- Test 5: moveTask position calculation
- Test 6: ThemeProvider renders correctly
- Test 7: CreateTaskModal validates title
- Test 8: WorkspaceMemberGuard blocks non-members
- Test 9: parseTtl handles all formats
- Test 10: KanbanBoard renders 5 columns

### UX Designer — Full Visual Redesign Spec
- New indigo-violet palette (#5b4ff5 primary)
- 3-level dark mode elevation (#0c0c14 / #14141f / #1c1c2e)
- Card hover lift (-translate-y-0.5 + primary shadow bleed)
- Kanban column top accent bars (3px colored stripe)
- Task card left priority border (3px)
- Sidebar gradient logo + left accent active state
- Landing page gradient hero with status chip
- 5 micro-interactions (button press, card lift, sidebar transition, gradient text, page entrance)

### Product Manager — Demo Critical Path
- RICE #1 (score 2880): Theme toggle prominence
- RICE #2 (score 2000): Create Project modal
- RICE #3 (score 1620): Project list rendering
- RICE #4 (score 1008): Command palette event wiring
- Recommended demo script provided (5-minute walkthrough)
