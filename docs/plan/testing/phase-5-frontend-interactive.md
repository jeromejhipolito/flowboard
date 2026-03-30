# Phase 5 — Frontend Interactive Components + Hooks (81 tests)

**Duration:** 1 day | **Priority:** P1

---

## Step 5.1: TaskCard (14 tests)

**NEW:** `apps/web/src/__tests__/board/task-card.test.tsx`
- [ ] Renders title + priority badge
- [ ] Priority accent bar has correct color
- [ ] Overdue date in red, due-today in amber, future in muted
- [ ] No calendar when no dueDate
- [ ] Comment/subtask count badges when > 0
- [ ] Assignee avatar renders
- [ ] Labels max 3 + "+N" badge
- [ ] Calls onClick on click (not during drag)
- [ ] Calls onClick on Enter key
- [ ] Compact mode: only title + priority
- [ ] Has role="button" + aria-label
- [ ] Highlights search term via highlightMatch

## Step 5.2: KanbanColumn (10 tests)

**NEW:** `apps/web/src/__tests__/board/kanban-column.test.tsx`
- [ ] Renders header with status + count
- [ ] Empty state when tasks=[]
- [ ] "Drop here" when dragging over empty column
- [ ] Calls onAddTask on "Add task" click
- [ ] Collapsed strip when isCollapsed
- [ ] Toggle collapse button works

## Step 5.3: KanbanBoard (6 tests)

**NEW:** `apps/web/src/__tests__/board/kanban-board.test.tsx`
- [ ] Renders 5 columns in correct order
- [ ] DnD instructions present for a11y
- [ ] DragOverlay renders when dragging
- [ ] moveTaskMutation called on drag end

## Step 5.4: Other Interactive Components (14 tests)

- [ ] BoardSearch (6): renders searchbox, onChange, clear button
- [ ] SprintSelector (13): dropdown open/close, sprint selection, create/complete actions
- [ ] ThemeToggle (9): icon cycle, setTheme calls
- [ ] NotificationBell (10): unread badge, panel toggle
- [ ] ConfirmDialog (7): title, buttons, onConfirm callback
- [ ] SettingsPage (10): form load, save, timezone picker
- [ ] DueDateTimezoneBreakdown (7): timezone rendering, day boundary warning
- [ ] Sidebar (16): nav links, workspace list, project nav, mobile menu

## Step 5.5: Hook Tests (37 tests)

**NEW:** `apps/web/src/__tests__/hooks/`
- [ ] use-auth.test.ts (10): init state, login, logout, refresh, token storage
- [ ] use-tasks.test.ts (8): query params, cache invalidation, demo mode branch
- [ ] use-sprints.test.ts (8): normalize response, active sprint 404, invalidation
- [ ] use-notifications.test.ts (6): infinite query, refetch interval, mark read
- [ ] use-workspaces.test.ts (5): enabled flag, cache invalidation

## Step 5.6: Run full test suite

- [ ] `cd apps/api && npx jest` — 256 backend tests pass
- [ ] `cd apps/web && npx jest` — 150 frontend tests pass
- [ ] Total: 406 tests, 0 failures
