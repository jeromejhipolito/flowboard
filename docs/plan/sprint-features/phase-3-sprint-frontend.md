# Phase 3 — Sprint Frontend: Selector + Assign + Complete (BR-1 frontend)

**Duration:** 1.5 weeks | **Prerequisite:** Phase 2 (backend API must exist)

---

## Step 3.1: Sprint Hooks (1 hr)

**NEW:** `apps/web/src/hooks/use-sprints.ts`
- [ ] `useSprints(projectId)` — GET /projects/:id/sprints
- [ ] `useActiveSprint(projectId)` — GET /projects/:id/sprints/active
- [ ] `useSprint(sprintId)` — GET /sprints/:id (detail with stats)
- [ ] `useCreateSprint()` — POST mutation
- [ ] `useStartSprint()` — POST /sprints/:id/start mutation
- [ ] `useCompleteSprint()` — POST /sprints/:id/complete mutation
- [ ] `useUpdateSprint()` — PATCH mutation
- [ ] `useDeleteSprint()` — DELETE mutation
- [ ] `useSprintTasks(sprintId)` — GET /sprints/:id (tasks for viewer)
- [ ] Add `Sprint` interface: id, projectId, name, goal, status, startDate, endDate, completedAt, scopeAtStart, carriedOver

**EDIT:** `apps/web/src/hooks/use-tasks.ts`
- [ ] Add `sprintId?: string | null` to Task interface
- [ ] Add `sprintId` param to `useTasks(projectId, { sprintId? })`

## Step 3.2: Sprint Selector Component (3 hrs)

**NEW:** `apps/web/src/components/sprint/sprint-selector.tsx`
- [ ] Dropdown button showing active sprint name + date range
- [ ] Popover menu items:
  - Active sprint (checkmark)
  - Completed sprints (grayed, navigates to viewer)
  - Divider
  - "All Tasks" option
  - "Backlog (unassigned)" option
  - Divider
  - "+ Create new sprint" (opens create modal)
  - "Complete Sprint..." (red text, at bottom — only when active sprint selected)
- [ ] Props: `projectId`, `value: string | null`, `onChange: (sprintId) => void`

**NEW:** `apps/web/src/components/sprint/create-sprint-modal.tsx`
- [ ] Form: name (required), goal (optional), startDate, endDate
- [ ] Zod validation: endDate must be after startDate
- [ ] Calls `useCreateSprint()` mutation
- [ ] On success: toast, close, invalidate sprints query

## Step 3.3: Board Sprint Integration (2 hrs)

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/board/page.tsx`
- [ ] Add sprint URL param: `const [sprintFilter, setSprintFilter] = useQueryParam('sprint')`
- [ ] Pass `sprintId` to `useTasks`: filter tasks by sprint on fetch
- [ ] Add `<SprintSelector>` to toolbar left section (before Create Task)
- [ ] When sprint filter = 'backlog': only show tasks with sprintId = null
- [ ] Add backlog banner when viewing unassigned tasks
- [ ] Listen for WebSocket `sprint:completed` → invalidate tasks + sprints queries

**EDIT:** `apps/web/src/hooks/use-socket.ts`
- [ ] Add listener for `sprint:completed` event
- [ ] On event: invalidate `['tasks', ...]` and `['sprints', ...]` queries

## Step 3.4: Task Sprint Assignment (1 hr)

**EDIT:** `apps/web/src/components/board/task-detail-panel.tsx`
- [ ] Add "Sprint" field in metadata section (same pattern as Assignee)
- [ ] Sprint dropdown: shows ACTIVE + PLANNING sprints + "None (backlog)"
- [ ] On change: call `useUpdateTask` with `{ sprintId }`
- [ ] Sprint badge visible on the field

## Step 3.5: Complete Sprint Dialog (3 hrs)

**NEW:** `apps/web/src/components/sprint/complete-sprint-dialog.tsx`
- [ ] Props: `sprint`, `projectId`, `open`, `onOpenChange`
- [ ] Derive task summary from board store (already in memory):
  - DONE count, incomplete count, progress bar
- [ ] List incomplete tasks with status badges
- [ ] Radio: "Move to backlog" (default) / "Move to [next sprint]" (disabled if none)
- [ ] Warning text: "This cannot be undone."
- [ ] Confirm button calls `useCompleteSprint({ nextSprintId? })`
- [ ] No optimistic update (destructive action) — show loading state
- [ ] On success: toast, close dialog, board refreshes via query invalidation

## Step 3.6: Sprint in List View (1 hr)

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/list/page.tsx`
- [ ] Add Sprint column to table
- [ ] Add sprint filter (same SprintSelector or simple select)
- [ ] Sprint name displayed in each row (from task.sprint relation or sprintId lookup)

## Step 3.7: Verify Sprint Flow

- [ ] Create sprint → appears in selector
- [ ] Start sprint → board filters to sprint tasks
- [ ] Assign task to sprint → task appears/disappears based on filter
- [ ] Complete sprint → dialog shows summary → tasks archived/moved
- [ ] Board resets to next sprint or empty state
- [ ] Real-time: other connected clients see board refresh on sprint complete
- [ ] `npx tsc --noEmit` + `npx nest build` — zero errors
