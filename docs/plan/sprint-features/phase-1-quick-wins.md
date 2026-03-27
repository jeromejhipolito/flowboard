# Phase 1 — Quick Wins: List View + Card Expand/Collapse (BR-2, BR-3)

**Duration:** 1 week | **Backend work:** None — pure frontend
**Prerequisite:** None (independent of sprint work)

---

## Step 1.1: List View — Table Component (3-4 hrs)

**NEW:** `apps/web/src/components/list/task-list.tsx`
- [ ] HTML `<table>` with `<thead>`, `<tbody>` (accessible, not CSS grid)
- [ ] Columns: Checkbox, Title, Status, Priority, Assignee, Due Date, Story Points
- [ ] Column headers as `<button>` inside `<th>` for sort
- [ ] `aria-sort` attribute on active sort column
- [ ] Props: `tasks`, `sortBy`, `sortDir`, `onSort`, `onTaskClick`, `selectedIds`, `onSelect`
- [ ] Status badge (colored), priority badge, assignee avatar, date formatting

**NEW:** `apps/web/src/components/list/task-list-row.tsx`
- [ ] Single row: checkbox + task data cells
- [ ] Overdue dates in red
- [ ] Row hover: bg-accent
- [ ] Row click (not checkbox): calls onTaskClick → opens TaskDetailPanel

## Step 1.2: List View — Page Implementation (2-3 hrs)

**REWRITE:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/list/page.tsx`
- [ ] Uses `useTasks(projectId)` — same hook as board
- [ ] URL state: `?status=`, `?priority=`, `?assignee=`, `?sort=`, `?dir=`, `?task=`
- [ ] Client-side sort: sort tasks array by selected column + direction
- [ ] Group tasks by status with collapsible section headers
- [ ] DONE group collapsed by default
- [ ] Filter bar: same status/priority/assignee selects as board
- [ ] Render `<TaskDetailPanel>` with `taskId={selectedTaskId}` — same as board
- [ ] Empty state: "No tasks match your filters"

## Step 1.3: List View — Bulk Actions (2 hrs)

**NEW:** `apps/web/src/components/list/bulk-action-bar.tsx`
- [ ] Fixed bar at bottom when `selectedIds.size > 0`
- [ ] Shows "{N} tasks selected"
- [ ] Actions: Change Status (popover), Assign To (popover), Clear Selection
- [ ] Each action calls `useUpdateTask` for each selected ID
- [ ] Warning if >20 tasks selected
- [ ] Clear selection on success
- [ ] `selectedIds` in local useState (not URL — ephemeral)

## Step 1.4: Card Expand/Collapse — Board Store (1 hr)

**EDIT:** `apps/web/src/stores/board-store.ts`
- [ ] Add to state:
  ```ts
  cardDensity: 'compact' | 'expanded'
  collapsedColumns: string[] // TaskStatus values, stored as array for JSON serialization
  setCardDensity: (density: 'compact' | 'expanded') => void
  toggleColumnCollapse: (status: string) => void
  ```
- [ ] Add `persist` middleware from zustand:
  ```ts
  import { persist, createJSONStorage } from 'zustand/middleware'
  ```
- [ ] Persist only `cardDensity` and `collapsedColumns` to localStorage
- [ ] Key: `flowboard-board-ui`

## Step 1.5: Card Compact Mode (2 hrs)

**EDIT:** `apps/web/src/components/board/task-card.tsx`
- [ ] Add prop: `density?: 'compact' | 'expanded'`
- [ ] Compact render: left priority bar + title (single line) + priority badge only
- [ ] Target height: ~40px
- [ ] No assignee avatar, no due date, no labels, no comment count in compact
- [ ] DnD still works (entire card is drag handle)
- [ ] Click still opens task detail

**EDIT:** `apps/web/src/components/board/kanban-column.tsx`
- [ ] Accept `density` prop, pass to each `TaskCard`
- [ ] Accept `isCollapsed` + `onToggleCollapse` props
- [ ] When collapsed: render only header strip (status label + count) at ~48px width
- [ ] Chevron icon in header rotates on collapse
- [ ] Collapsed column still accepts DnD drops (auto-expand on drag-over)

**EDIT:** `apps/web/src/components/board/kanban-board.tsx`
- [ ] Read `cardDensity` and `collapsedColumns` from board store
- [ ] Pass `density` to each KanbanColumn
- [ ] Pass `isCollapsed` + `onToggleCollapse` to each column

## Step 1.6: Density Toggle in Toolbar (30 min)

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/board/page.tsx`
- [ ] Add toggle button in toolbar: Maximize2/Minimize2 icons
- [ ] Reads/writes `cardDensity` from board store
- [ ] Label: "Compact" / "Expanded"

## Step 1.7: Verify

- [ ] List view: table renders, sort works, row click opens panel, filters work
- [ ] Board compact: toggle switches all cards to compact mode
- [ ] Board expanded: shows full card details (default)
- [ ] Column collapse: click header collapses, click again expands
- [ ] State persists on page refresh (localStorage)
- [ ] `npx tsc --noEmit` — zero errors
