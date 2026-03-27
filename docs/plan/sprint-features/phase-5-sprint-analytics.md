# Phase 5 — Sprint Analytics (BR-6)

**Duration:** 1 week | **Prerequisite:** Phase 2-3 (sprint data must exist)

---

## Step 5.1: Sprint-Scoped Analytics API (2 hrs)

**EDIT:** `apps/api/src/analytics/analytics.controller.ts`
- [ ] Add optional `sprintId` query param to all 5 existing endpoints
- [ ] Pass through to service methods

**EDIT:** `apps/api/src/analytics/analytics.service.ts`
- [ ] All groupBy/count queries: add `...(sprintId && { sprintId })` to where clause
- [ ] Velocity query: when sprintId provided, filter by sprint instead of 8-week window
- [ ] Cache key includes sprintId: `analytics:${projectId}:${endpoint}:${sprintId || 'all'}`

**NEW endpoint:** `GET /projects/:projectId/analytics/burndown?sprintId=<id>`
- [ ] Returns `{ day: string, ideal: number, actual: number }[]`
- [ ] For each day from sprint.startDate to today (or endDate if CLOSED):
  - ideal = totalTasks - (totalTasks / durationDays * dayIndex)
  - actual = count tasks WHERE sprintId AND status != 'DONE' on that day
- [ ] For actual count: use completedAt timestamps to reconstruct daily state
- [ ] Cache with short TTL (60s for active sprint, 5min for closed)

**NEW endpoint:** `GET /projects/:projectId/analytics/sprint-velocity`
- [ ] Returns `{ sprintName: string, sprintNumber: number, completedPoints: number, completedTasks: number }[]`
- [ ] Aggregates across all CLOSED sprints for the project
- [ ] Includes rolling 3-sprint average

## Step 5.2: Frontend Analytics Hooks (1 hr)

**EDIT:** `apps/web/src/hooks/use-analytics.ts`
- [ ] Add optional `sprintId` param to all 5 existing hooks
- [ ] Include `sprintId` in query keys for independent caching
- [ ] Add `useSprintBurndown(projectId, sprintId)` — new hook
- [ ] Add `useSprintVelocity(projectId)` — new hook

## Step 5.3: Scope Selector Component (1 hr)

**NEW:** `apps/web/src/components/analytics/scope-selector.tsx`
- [ ] Props: `projectId`, `value: { type: 'all' | 'sprint', sprintId?: string }`, `onChange`
- [ ] Renders: `[All Time]` button + `[Sprint: name ▼]` dropdown
- [ ] Dropdown lists ACTIVE + CLOSED sprints
- [ ] Selected state: highlighted button/option

## Step 5.4: Burndown Chart Component (2 hrs)

**NEW:** `apps/web/src/components/analytics/sprint-burndown-chart.tsx`
- [ ] Recharts `LineChart` with two series:
  - "Ideal" line: dashed, gray
  - "Actual" line: solid, primary color
- [ ] X-axis: days (formatted as "Mar 3", "Mar 4", ...)
- [ ] Y-axis: remaining task count
- [ ] ReferenceLine at today's date (vertical dashed line)
- [ ] Tooltip showing both values
- [ ] Card wrapper: "Sprint Burndown"
- [ ] For CLOSED sprints: show full line to completion
- [ ] For ACTIVE sprints: show line up to today, ideal projected forward

## Step 5.5: Sprint Velocity Chart Component (1 hr)

**NEW:** `apps/web/src/components/analytics/sprint-velocity-chart.tsx`
- [ ] Recharts `BarChart` (not area — discrete sprints)
- [ ] X-axis: sprint names
- [ ] Y-axis: story points completed
- [ ] Bars: primary color
- [ ] Reference line: rolling 3-sprint average (dotted)
- [ ] Tooltip: sprint name, points, task count
- [ ] Card wrapper: "Sprint Velocity"

## Step 5.6: Analytics Page Integration (2 hrs)

**EDIT:** Analytics page
- [ ] Add `<ScopeSelector>` at top of page
- [ ] URL state: `?scope=all|sprint&sprintId=<id>`
- [ ] When scope=all: show existing 5 charts (unchanged)
- [ ] When scope=sprint:
  - Task Distribution: filtered by sprintId
  - Priority Breakdown: filtered by sprintId
  - Member Workload: filtered by sprintId
  - **Replace** Velocity with Sprint Burndown (for active) or completion stats (for closed)
  - Overdue: filtered by sprintId
- [ ] Add Sprint Velocity chart below existing charts (always visible, shows cross-sprint trend)
- [ ] Lazy-load new chart components with `next/dynamic`

## Step 5.7: Sprint Completion Rate Card (1 hr)

**NEW:** `apps/web/src/components/analytics/sprint-completion-card.tsx`
- [ ] Large stat: "72%" completion rate
- [ ] Progress bar
- [ ] Sub-stats: tasks completed, carried over, scope change
- [ ] Sprint Health Score badge
- [ ] Shown when a specific sprint is selected in scope

## Step 5.8: Verify

- [ ] Scope selector: switch between All Time and specific sprint
- [ ] All existing charts update when sprint selected
- [ ] Burndown chart renders for active sprint (with today marker)
- [ ] Burndown chart renders for closed sprint (complete line)
- [ ] Sprint velocity shows bars per completed sprint
- [ ] Completion rate card shows accurate stats
- [ ] New charts lazy-loaded (check bundle size)
- [ ] `npx tsc --noEmit` + `npx nest build` — zero errors
