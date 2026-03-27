# Phase 2 — Kanban Board, Drag-and-Drop & Real-Time Sync

**Duration:** ~2 weeks
**Goal:** Interactive Kanban board with drag-and-drop, real-time WebSocket updates across clients
**This is the "wow moment" phase.**

---

## Step 2.1: Project Module (Backend)

- [ ] Create `ProjectsModule`
- [ ] Endpoints:
  - `POST /workspaces/:wId/projects` — create project (MEMBER+)
  - `GET /workspaces/:wId/projects` — list projects in workspace
  - `GET /projects/:id` — project detail with task counts per status
  - `PATCH /projects/:id` — update name/description/status (MEMBER+)
  - `DELETE /projects/:id` — soft delete (ADMIN+)
- [ ] Project statuses: `ACTIVE | ARCHIVED | COMPLETED`

## Step 2.2: Task Module (Backend)

- [ ] Create `TasksModule`
- [ ] Endpoints:
  - `POST /projects/:pId/tasks` — create task
  - `GET /projects/:pId/tasks` — list tasks with filters + pagination
    - Query params: `status`, `priority`, `assigneeId`, `search`, `sort`, `cursor`
    - Return grouped by status for board view
  - `GET /tasks/:id` — task detail with subtasks, labels, comment count
  - `PATCH /tasks/:id` — update any field (title, description, status, priority, assignee, dueDate)
  - `PATCH /tasks/:id/position` — reorder: accepts `{ status, position }` for column move + reorder
  - `DELETE /tasks/:id` — soft delete (reporter or ADMIN+)
- [ ] Implement fractional indexing for position:
  - New task at bottom: `position = lastTask.position + 1.0`
  - Insert between tasks: `position = (taskAbove.position + taskBelow.position) / 2`
  - Rebalance positions when gap < 0.001 (batch update all positions in column)
- [ ] Subtask support: `parentTaskId` field, validate no circular references
- [ ] Label management:
  - `POST /workspaces/:wId/labels` — create label (name + color hex)
  - `POST /tasks/:id/labels/:labelId` — attach label
  - `DELETE /tasks/:id/labels/:labelId` — detach label

## Step 2.3: WebSocket Gateway (Backend)

- [ ] Create `GatewayModule` with `@WebSocketGateway`
- [ ] Install `@nestjs/websockets`, `socket.io`, `@socket.io/redis-adapter`
- [ ] Implement `WsJwtGuard` — validate JWT on WebSocket handshake
- [ ] Room management:
  - Client joins room `board:{projectId}` when opening a board
  - Client leaves room on navigation away
- [ ] Events emitted from TaskService (not controller):
  - `task:created` — broadcast new task to board room
  - `task:updated` — broadcast field changes
  - `task:moved` — broadcast status + position change
  - `task:deleted` — broadcast removal
- [ ] Use `@nestjs/event-emitter` internally:
  - TaskService emits domain event → GatewayModule listener broadcasts to room
  - Decouples business logic from WebSocket concerns

## Step 2.4: Board View (Frontend)

- [ ] Create route: `app/(dashboard)/workspaces/[slug]/projects/[projectId]/board/page.tsx`
- [ ] Server Component shell: fetch project metadata + initial task data via RSC
- [ ] Client Component board: `<KanbanBoard>` receives initial data as props
- [ ] Column layout:
  - 5 columns: Backlog, Todo, In Progress, In Review, Done
  - Each column shows task count badge
  - Scrollable columns with virtual scroll for 50+ cards
- [ ] Task card design:
  - Title (truncated), priority badge (color-coded), assignee avatar
  - Due date (red if overdue), label chips (max 3 shown)
  - Subtle hover elevation + cursor pointer

## Step 2.5: Drag-and-Drop Implementation (Frontend)

- [ ] Install `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [ ] Implement drag interactions:
  - Lift: card gets drop shadow + slight scale, ghost placeholder in original position
  - Over: target column highlights, drop zone indicator appears between cards
  - Drop: card settles with ease-out animation (200ms)
  - Cancel: card animates back to original position
- [ ] Optimistic update flow:
  1. User drops card → UI updates immediately (Zustand local state)
  2. `PATCH /tasks/:id/position` fires in background
  3. Success: TanStack Query cache invalidated, server state reconciles
  4. Failure: rollback Zustand state, show error toast
- [ ] Keyboard accessibility:
  - `Tab` to focus card, `Space` to pick up
  - `Arrow keys` to move between columns/positions
  - `Space` to drop, `Escape` to cancel

## Step 2.6: Real-Time Client Integration (Frontend)

- [ ] Create `useSocket()` hook:
  - Connect to WebSocket on board mount, disconnect on unmount
  - Auto-reconnect with exponential backoff
  - Pass JWT token on handshake
- [ ] Join `board:{projectId}` room on mount
- [ ] Listen for events:
  - `task:created` → add card to correct column
  - `task:updated` → update card in place
  - `task:moved` → animate card to new column/position
  - `task:deleted` → remove card with fade-out
- [ ] Reconcile: incoming WebSocket events update TanStack Query cache directly
- [ ] Ignore own events (compare `event.userId` with current user) to prevent double-update

## Step 2.7: Task Detail Panel (Frontend)

- [ ] Implement as parallel route: `@taskPanel/task/[taskId]/page.tsx`
- [ ] Slide-over panel from right (keep board visible behind, dimmed)
- [ ] URL-driven: `/board?task=taskId` — bookmarkable, shareable
- [ ] Panel contents:
  - Inline-editable title (click to edit, blur or Enter to save)
  - Rich text description (use `@tiptap/react` for editor)
  - Assignee picker: searchable user dropdown with avatars
  - Status selector, Priority selector, Due date picker
  - Label manager: add/remove labels
  - Subtask list: inline add, checkbox to complete
  - Activity section (placeholder — built in Phase 3)
- [ ] All mutations use Server Actions + `useOptimistic` for instant feedback

## Completion Criteria
- Kanban board renders with 5 columns and real task data
- Cards can be dragged within and across columns (mouse + keyboard)
- Open two browser tabs → drag card in one → card moves in the other (real-time)
- Task detail opens as slide-over panel without losing board state
- URL updates on task selection (shareable)
- Optimistic updates with rollback on server error
