# FlowBoard — Business Requirements (Sprint Features)

**Meeting:** 2026-03-26 Sprint Features Meeting
**Priority:** Feature Development

---

## BR-1: Sprint Management (P0 — Core Feature)

**Requirement:** Projects support time-boxed sprints that group tasks and clean up the DONE column.

**Acceptance Criteria:**
- [ ] Create sprint: name (required), start date, end date, goal (optional)
- [ ] Only one ACTIVE sprint per project (enforced at DB level)
- [ ] Sprint statuses: PLANNING → ACTIVE → CLOSED
- [ ] Start sprint: sets status=ACTIVE, sets project.activeSprintId
- [ ] Assign task to sprint from task detail panel (dropdown field)
- [ ] Board sprint selector: filter by active sprint, all tasks, or backlog
- [ ] Sprint filter persists in URL: `?sprint=<id>`
- [ ] Complete sprint dialog: shows DONE count, incomplete count, progress bar
- [ ] Completion choices: move incomplete to backlog OR to next sprint
- [ ] Completion is atomic ($transaction): DONE tasks keep sprintId, incomplete tasks reassigned
- [ ] WebSocket event `sprint:completed` triggers board refresh for all connected clients
- [ ] Unassigned tasks (sprintId=null) visible as "Backlog" option

**Data Model:**
- NEW: Sprint model (id, projectId, name, goal, status, startDate, endDate, completedAt, scopeAtStart, carriedOver)
- EDIT: Task + sprintId (nullable FK, onDelete: SetNull)
- EDIT: Project + activeSprintId (unique)

**API Endpoints:**
- POST /projects/:projectId/sprints
- GET /projects/:projectId/sprints(?status=)
- GET /projects/:projectId/sprints/active
- GET /sprints/:sprintId
- PATCH /sprints/:sprintId
- POST /sprints/:sprintId/start
- POST /sprints/:sprintId/complete
- DELETE /sprints/:sprintId

---

## BR-2: List View (P1)

**Requirement:** Table-based alternative to the Kanban board for scanning all tasks.

**Acceptance Criteria:**
- [ ] Replace placeholder at /projects/[id]/list with working table
- [ ] Columns: Title, Status, Priority, Assignee, Due Date, Sprint, Story Points
- [ ] Click column header to sort (asc → desc → clear)
- [ ] Same filters as board (status, priority, assignee) + sprint filter
- [ ] Row click opens TaskDetailPanel (same component as board)
- [ ] Rows grouped by status with collapsible groups
- [ ] DONE group collapsed by default
- [ ] Bulk select: checkbox per row, bulk action bar (change status, assign, move to sprint)
- [ ] Search input filters visible rows in real-time
- [ ] Reuses `useTasks` hook — no new API endpoints

---

## BR-3: Card Expand/Collapse (P2)

**Requirement:** Toggle card density on the board and collapse individual columns.

**Acceptance Criteria:**
- [ ] Board toolbar toggle: "Compact" vs "Expanded" (icons: Minimize2/Maximize2)
- [ ] Compact mode: title + priority badge only (~40px card height)
- [ ] Expanded mode: title, description excerpt, labels, priority, assignee, due date, subtask progress, story points (current default)
- [ ] Per-column collapse: click column header → collapses to narrow strip with status + count
- [ ] Click collapsed column to expand it back
- [ ] Both states persisted to localStorage via Zustand persist middleware
- [ ] DnD still works with compact cards (drag handle = entire card)
- [ ] Collapsed columns still accept drops (expand on drag-over)

**State:** `cardDensity: 'compact' | 'expanded'` + `collapsedColumns: Set<TaskStatus>` in board-store.ts

---

## BR-4: Search (P3)

**Requirement:** Find tasks by text within a project.

**Acceptance Criteria:**
- [ ] Search input in board/list toolbar
- [ ] Searches: title, description, assignee name
- [ ] Client-side filtering (tasks already in memory, ≤100)
- [ ] Results filter board/list in real-time (no debounce needed)
- [ ] Matching text highlighted with `<mark>` tag in card titles
- [ ] Search query persisted in URL: `?q=<query>`
- [ ] Clear button (X) resets search
- [ ] Empty results state: "No tasks match your search"
- [ ] Backend: extend existing `search` param to also match `description` (OR query)
- [ ] Workspace-wide search: GET /workspaces/:id/search?q=X (stretch goal)

---

## BR-5: Past Sprint Viewer (P1.5)

**Requirement:** Browse completed sprints and see what was accomplished.

**Acceptance Criteria:**
- [ ] New "Sprints" tab in project layout navigation
- [ ] Route: /projects/[id]/sprints
- [ ] Accordion list of all sprints (active at top, completed below)
- [ ] Each sprint card shows: name, dates, status badge, completion %, task count
- [ ] Click to expand: goal text, progress bar, DONE tasks list, CARRIED OVER tasks list
- [ ] Two-column layout: completed tasks on left, carried-over on right
- [ ] Clicking a task opens TaskDetailPanel (read-only context)
- [ ] Sprint Health Score displayed: composite metric (completion * 0.5 + carry-over * 0.3 + scope * 0.2)
- [ ] Empty state: "No sprints yet" with CTA to create first sprint

---

## BR-6: Sprint Analytics (P2.5)

**Requirement:** Sprint-scoped metrics and new sprint-specific charts.

**Acceptance Criteria:**
- [ ] Analytics page scope selector: [All Time] [Sprint: name ▼]
- [ ] All existing charts accept optional sprintId filter
- [ ] NEW: Sprint Burndown chart (line: ideal vs actual remaining tasks per day)
- [ ] NEW: Sprint Velocity bar chart (story points per sprint, indexed by sprint number)
- [ ] NEW: Sprint Completion Rate stat card per sprint
- [ ] NEW: Carry-over Rate across sprints trend
- [ ] Sprint Health Score on sprint cards in viewer
- [ ] Denormalized: scopeAtStart + carriedOver on Sprint model

---

## Implementation Priority

| Phase | BRs | Duration |
|-------|-----|----------|
| 1 — Quick Wins | BR-2 (List), BR-3 (Expand/Collapse) | 1 week |
| 2 — Sprint Backend | BR-1 (data model + API) | 1.5 weeks |
| 3 — Sprint Frontend | BR-1 (selector + assign + complete) | 1.5 weeks |
| 4 — Search + Viewer | BR-4 (Search), BR-5 (Past Sprints) | 1.5 weeks |
| 5 — Sprint Analytics | BR-6 (Burndown, velocity, health score) | 1 week |

**Total: ~6.5 weeks**
