# Sprint 2 — Frontend Architecture (2-3 Days)

**Goal:** Fix rendering strategy, error handling, performance, and accessibility.
**Flagged by:** Frontend (P0,P1), UX (critical accessibility), Performance

---

## Step 2.1: Move Auth Guard to Middleware, Make Dashboard RSC (3 hrs)

**Files:** New `apps/web/middleware.ts`, modify `apps/web/src/app/(dashboard)/layout.tsx`
**Issue:** Dashboard layout is `'use client'` — forces ALL pages to be client components.
**Flagged by:** Frontend (P0), Performance

- [ ] Create `apps/web/middleware.ts`:
  - Check for access token cookie (after Sprint 1 cookie migration)
  - Redirect unauthenticated users to `/login`
  - Matcher: `['/(dashboard)/:path*', '/workspaces/:path*']`
- [ ] Remove `'use client'` from `apps/web/src/app/(dashboard)/layout.tsx`
- [ ] Extract auth-dependent UI (user avatar, sidebar workspace list) into small client islands
- [ ] Keep `<Sidebar>`, `<TopBar>`, `<CommandPalette>` as client components
- [ ] Make the layout itself a Server Component that renders client islands
- [ ] Verify: workspace list page can now fetch data server-side

## Step 2.2: Add React Error Boundaries (2 hrs)

**Files:** New `apps/web/src/components/error-boundary.tsx`, modify multiple layouts
**Issue:** No error boundaries — any render error crashes the entire dashboard.
**Flagged by:** Frontend (P0), QA

- [ ] Create `ErrorBoundary` component with:
  - Fallback UI: "Something went wrong" + "Try again" button
  - Error logging (console in dev, Sentry-ready hook for prod)
- [ ] Add error boundary in `(dashboard)/layout.tsx` wrapping `<main>` content
- [ ] Add error boundary in board page wrapping `<KanbanBoard>`
- [ ] Add error boundary in analytics page wrapping each chart widget
- [ ] Add error boundary in task detail panel
- [ ] Create `apps/web/src/app/(dashboard)/error.tsx` — Next.js route-level error UI

## Step 2.3: Fix WebSocket Singleton Pattern (2 hrs)

**File:** `apps/web/src/hooks/use-socket.ts`
**Issue:** Each `useSocket()` call creates a new `io()` connection — multiple sockets per page.
**Flagged by:** Frontend (P0), Performance

- [ ] Create module-level socket instance (singleton outside React):
  ```ts
  let socketInstance: Socket | null = null;
  function getSocket(token: string): Socket { ... }
  ```
- [ ] `useSocket()` hook returns the singleton, increments a ref counter
- [ ] Disconnect only when ref counter reaches 0 (last consumer unmounts)
- [ ] Ensure reconnection logic uses the same instance

## Step 2.4: Add Focus Trapping on Slide-Over Panels (2 hrs)

**Files:** `task-detail-panel.tsx`, `notification-panel.tsx`
**Issue:** No focus trap — keyboard Tab goes behind panels. WCAG 2.4.3 violation.
**Flagged by:** UX (critical), Frontend (P2)

- [ ] Install `focus-trap-react`: `pnpm add focus-trap-react --filter @flowboard/web`
- [ ] Wrap `TaskDetailPanel` content in `<FocusTrap>`:
  - On open: focus moves to panel header
  - On close: focus returns to the triggering card
  - Escape key closes panel
- [ ] Wrap `NotificationPanel` content in `<FocusTrap>`
- [ ] Add `aria-expanded` to the mobile sidebar toggle button

## Step 2.5: Move State to URL Params (3 hrs)

**Files:** Board page, workspace page
**Issue:** Filters and activeTaskId in `useState` — lost on refresh, not shareable.
**Flagged by:** Frontend (P1)

- [ ] Install `nuqs`: `pnpm add nuqs --filter @flowboard/web`
- [ ] Board page: move `filterStatus`, `filterPriority`, `filterAssignee` to URL params
- [ ] Board page: read `activeTaskId` from `?task=` param directly (remove Zustand bridge)
- [ ] Workspace page: move `activeTab` to `?tab=` URL param
- [ ] Remove redundant `useEffect` bridges that sync between useState and URL

## Step 2.6: Lazy-Load Heavy Dependencies (1 hr)

**Files:** Analytics page, dashboard layout
**Issue:** Recharts (113kB) and cmdk loaded eagerly for all dashboard pages.
**Flagged by:** Frontend (P1), Performance, SEO

- [ ] Wrap each analytics chart with `next/dynamic({ ssr: false })`:
  ```ts
  const VelocityChart = dynamic(() => import('./velocity-chart'), {
    loading: () => <ChartSkeleton />, ssr: false
  });
  ```
- [ ] Wrap `CommandPalette` with `next/dynamic` — load only when Ctrl+K pressed
- [ ] Wrap TipTap editor in task detail with `next/dynamic`
- [ ] Verify: `next build` shows analytics page < 60kB (down from 113kB)

## Step 2.7: Fix DnD Rollback Index (30 min)

**File:** `apps/web/src/components/board/kanban-board.tsx`
**Issue:** `originalIndex` hardcoded to 0 — rollback always snaps card to top of column.
**Flagged by:** Frontend, QA (BUG-4)

- [ ] Capture `originalIndex` BEFORE the optimistic move:
  ```ts
  const originalColumn = findColumn(activeId);
  const originalIndex = columns[originalColumn].findIndex(t => t.id === activeId);
  ```
- [ ] Pass correct `originalIndex` to `rollbackMove()`
- [ ] Add screen reader drag instructions via `aria-describedby`

## Completion Criteria
- Dashboard layout is a Server Component (verify with React DevTools)
- Error boundaries catch and display errors gracefully
- Single WebSocket connection per browser tab
- Focus trapped in slide-over panels (verify with Tab key)
- Board filters persist in URL on refresh
- Analytics page < 60kB first load JS
- Drag rollback returns card to correct position
