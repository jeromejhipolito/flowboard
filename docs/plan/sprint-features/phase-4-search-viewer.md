# Phase 4 — Search + Past Sprint Viewer (BR-4, BR-5)

**Duration:** 1.5 weeks | **Prerequisite:** Phase 2-3 (sprints must exist for viewer)

---

## Step 4.1: Search Component (2 hrs)

**NEW:** `apps/web/src/components/board/board-search.tsx`
- [ ] Input with Search icon (left) and X clear button (right, visible when non-empty)
- [ ] `aria-label="Search tasks"`, `role="searchbox"`
- [ ] Props: `value: string`, `onChange: (value: string) => void`
- [ ] No debounce needed (client-side filter is instant)
- [ ] Mobile: collapse to icon, expand on click

## Step 4.2: Search Integration — Board (1 hr)

**EDIT:** Board page (`board/page.tsx`)
- [ ] Add URL param: `const [searchQuery, setSearchQuery] = useQueryParam('q')`
- [ ] Add `<BoardSearch>` to toolbar
- [ ] Filter tasks in the seeding useEffect:
  ```ts
  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.description?.toLowerCase().includes(lower) ||
      (t.assignee && `${t.assignee.firstName} ${t.assignee.lastName}`.toLowerCase().includes(lower))
    );
  }
  ```
- [ ] Empty board state when search has no results: "No tasks match your search"

## Step 4.3: Search Integration — List (30 min)

**EDIT:** List page (`list/page.tsx`)
- [ ] Same `useQueryParam('q')` and `<BoardSearch>` in toolbar
- [ ] Same filter logic on the flat task array
- [ ] Empty table state when no results

## Step 4.4: Text Highlight Utility (1 hr)

**NEW:** Add to `apps/web/src/lib/utils.ts`
- [ ] `highlightMatch(text: string, query: string): React.ReactNode`
- [ ] Splits text on matching substring, wraps match in `<mark className="bg-primary/20 rounded">`
- [ ] Case-insensitive matching
- [ ] Returns original text if no match or empty query

**EDIT:** `apps/web/src/components/board/task-card.tsx`
- [ ] Accept optional `searchQuery` prop
- [ ] Wrap title with `highlightMatch(task.title, searchQuery)`

**EDIT:** `apps/web/src/components/list/task-list-row.tsx`
- [ ] Same highlight on title cell

## Step 4.5: Sprints Page — Layout Integration (30 min)

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/layout.tsx`
- [ ] Add to navItems: `{ label: 'Sprints', value: 'sprints', icon: Layers }`
- [ ] Import `Layers` from lucide-react

## Step 4.6: Sprints Page — Sprint List (3 hrs)

**NEW:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/sprints/page.tsx`
- [ ] Fetch sprints: `useSprints(projectId)`
- [ ] Active sprint at top (not expandable — CTA to go to board)
- [ ] Completed sprints below as accordion items (collapsed by default)

**NEW:** `apps/web/src/components/sprint/sprint-list-item.tsx`
- [ ] Collapsed: sprint name, dates, status badge, completion % bar, task count
- [ ] Expanded (on click):
  - Goal text
  - Full progress bar
  - Two columns: DONE tasks (left), CARRIED OVER tasks (right)
  - Each task: title, status badge, priority badge, assignee
  - Click task → opens TaskDetailPanel (read-only)
- [ ] Sprint Health Score badge (if data available)

## Step 4.7: Sprint Tasks Fetch (1 hr)

**EDIT:** `apps/web/src/hooks/use-sprints.ts`
- [ ] Add `useSprintTasks(sprintId)` hook
- [ ] GET /projects/:projectId/tasks?sprintId=<id> (reuses existing endpoint)
- [ ] Returns full task list for that sprint
- [ ] Separate query key from board tasks: `['sprint-tasks', sprintId]`

## Step 4.8: Sprint Health Score (1 hr)

- [ ] Compute in sprint list item:
  ```ts
  const completionRate = doneTasks / totalTasks;
  const carryoverRate = sprint.carriedOver ? sprint.carriedOver / totalTasks : 0;
  const scopeChangeRate = sprint.scopeAtStart
    ? Math.abs(totalTasks - sprint.scopeAtStart) / sprint.scopeAtStart : 0;
  const healthScore = Math.round(
    (completionRate * 0.5 + (1 - carryoverRate) * 0.3 + (1 - scopeChangeRate) * 0.2) * 100
  );
  ```
- [ ] Display as colored badge: green (≥70), yellow (40-69), red (<40)

## Step 4.9: Verify

- [ ] Search on board: type → cards filter in real-time, matching text highlighted
- [ ] Search on list: same behavior on table rows
- [ ] Clear search: all tasks visible again
- [ ] Search persists in URL (?q=)
- [ ] Sprints tab: shows sprint history
- [ ] Click completed sprint: expands to show done + carried-over tasks
- [ ] Click task in viewer: opens detail panel
- [ ] Health score visible on each completed sprint
