# Phase 2 — Demo Hooks + Interactions (BR-4, BR-6)

**Duration:** 1-2 days | **Prerequisite:** Phase 1 (demo data must exist)

---

## Step 2.1: Hook Re-Export Pattern (30 min)

For each of the 8 hook files, add a conditional re-export shim. The pattern:

Each real hook file gets renamed: `use-tasks.ts` → content stays, but we add a wrapper.

**SIMPLER approach** (avoids renaming files): Create a single `src/demo/hooks/index.ts` that maps hook names, then in each real hook, add an early return pattern:

Actually, the cleanest approach for this codebase: **create demo hooks that match the real interface, and add a conditional check inside each real hook function.**

For each hook function (e.g., `useTasks`):
```ts
import { isDemoMode } from '@/demo';
import { useDemoTasks } from '@/demo/hooks/use-demo-tasks';

export function useTasks(projectId: string, filters?: { sprintId?: string }) {
  if (isDemoMode) return useDemoTasks(projectId, filters); // ← one line added
  // ... rest of real implementation unchanged
}
```

This is 1 line per function. Not per file — per exported function. Clean, greppable, type-safe.

- [ ] Add `isDemoMode` check to each exported function in all 8 hook files:
  - `src/hooks/use-workspaces.ts` (6 functions)
  - `src/hooks/use-projects.ts` (3 functions)
  - `src/hooks/use-tasks.ts` (6 functions)
  - `src/hooks/use-sprints.ts` (9 functions)
  - `src/hooks/use-analytics.ts` (7 functions)
  - `src/hooks/use-comments.ts` (4 functions)
  - `src/hooks/use-activity.ts` (2 functions)
  - `src/hooks/use-notifications.ts` (4 functions)

## Step 2.2: Demo Workspaces + Projects Hooks (1 hr)

**NEW:** `apps/web/src/demo/hooks/use-demo-workspaces.ts`
- [ ] `useDemoWorkspaces()` — returns DEMO_WORKSPACES array
- [ ] `useDemoWorkspace(slug)` — returns workspace matching slug
- [ ] `useDemoCreateWorkspace()` — mutation that adds to cache + toast
- [ ] `useDemoWorkspaceMembers(id)` — returns DEMO_USERS as members
- [ ] `useDemoInviteMember()` — toast "disabled in demo"
- [ ] `useDemoUpdateMemberRole()` — updates local cache + toast
- [ ] `useDemoRemoveMember()` — toast "disabled in demo"

**NEW:** `apps/web/src/demo/hooks/use-demo-projects.ts`
- [ ] `useDemoProjects(workspaceId)` — returns DEMO_PROJECTS
- [ ] `useDemoProject(projectId)` — returns matching project
- [ ] `useDemoCreateProject()` — mutation adds to cache + toast

## Step 2.3: Demo Tasks Hook (2 hrs — most complex)

**NEW:** `apps/web/src/demo/hooks/use-demo-tasks.ts`
- [ ] `useDemoTasks(projectId, filters?)` — returns tasks filtered by projectId + sprint
- [ ] `useDemoTask(taskId)` — returns single task with details
- [ ] `useDemoCreateTask()` — generates ID `demo-task-${Date.now()}`, adds to cache
- [ ] `useDemoUpdateTask()` — updates task in cache
- [ ] `useDemoMoveTask()` — updates status + position in cache
- [ ] `useDemoDeleteTask()` — removes from cache
- [ ] All mutations: `toast.info('Demo mode — changes are not saved')`
- [ ] `staleTime: Infinity` on all queries
- [ ] Sprint filtering: if sprintId provided, filter tasks; if 'backlog', filter sprintId=null

## Step 2.4: Demo Sprints Hook (1 hr)

**NEW:** `apps/web/src/demo/hooks/use-demo-sprints.ts`
- [ ] `useDemoSprints(projectId)` — returns DEMO_SPRINTS for project
- [ ] `useDemoActiveSprint(projectId)` — returns ACTIVE sprint or null
- [ ] `useDemoSprint(sprintId)` — returns sprint detail
- [ ] `useDemoCreateSprint()` — adds to cache + toast
- [ ] `useDemoStartSprint()` — updates status in cache + toast
- [ ] `useDemoCompleteSprint()` — updates status, moves tasks in cache + toast
- [ ] `useDemoSprintTasks(projectId, sprintId)` — returns filtered tasks

## Step 2.5: Demo Analytics Hook (1 hr)

**NEW:** `apps/web/src/demo/hooks/use-demo-analytics.ts`
- [ ] `useDemoTaskDistribution(projectId, sprintId?)` — returns pre-computed data
- [ ] `useDemoPriorityBreakdown(projectId, sprintId?)` — returns data
- [ ] `useDemoMemberWorkload(projectId, sprintId?)` — returns data
- [ ] `useDemoVelocity(projectId, sprintId?)` — returns data
- [ ] `useDemoOverdueTasks(projectId, sprintId?)` — returns data
- [ ] `useDemoSprintBurndown(projectId, sprintId)` — returns burndown data
- [ ] `useDemoSprintVelocity(projectId)` — returns sprint velocity data
- [ ] All return pre-computed values from `demo/data/analytics.ts`

## Step 2.6: Demo Comments + Activity + Notifications (1 hr)

**NEW:** `apps/web/src/demo/hooks/use-demo-comments.ts`
- [ ] `useDemoComments(taskId)` — returns pre-seeded comments
- [ ] `useDemoCreateComment()` — adds to cache + toast
- [ ] `useDemoUpdateComment()` — updates cache + toast
- [ ] `useDemoDeleteComment()` — removes from cache + toast

**NEW:** `apps/web/src/demo/hooks/use-demo-activity.ts`
- [ ] `useDemoTaskActivity(taskId)` — returns infinite query format with demo entries
- [ ] `useDemoProjectActivity(projectId)` — returns demo entries

**NEW:** `apps/web/src/demo/hooks/use-demo-notifications.ts`
- [ ] `useDemoNotifications()` — returns 6 notifications (2 unread)
- [ ] `useDemoUnreadCount()` — returns { count: 2 }
- [ ] `useDemoMarkAsRead()` — updates local cache
- [ ] `useDemoMarkAllAsRead()` — updates local cache

## Step 2.7: Demo Socket + Live Badge (30 min)

**EDIT:** `apps/web/src/hooks/use-socket.ts`
- [ ] If isDemoMode: return immediately with `{ socket: null, isConnected: false, joinBoard: noop, leaveBoard: noop }`
- [ ] No WebSocket connection attempted

**EDIT:** Board page Live badge
- [ ] If isDemoMode: show "Demo" badge (amber) instead of "Live" (green) or "Offline" (red)

## Step 2.8: Command Palette Demo Mode (15 min)

**EDIT:** `apps/web/src/components/command-palette/command-palette.tsx`
- [ ] If isDemoMode and AI parse is triggered: `toast.info('AI parsing disabled in demo mode')`
- [ ] Navigation and create actions still work (they hit demo hooks)

## Step 2.9: Verify Full Demo Flow

- [ ] Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
- [ ] Start Next.js dev server (no backend running)
- [ ] Verify: auto-logged in, demo banner visible
- [ ] Navigate: workspaces → workspace detail → projects → board
- [ ] Board: 5 columns with tasks, sprint selector works
- [ ] Drag task between columns → works, toast shown
- [ ] Create task → modal works, task appears, toast shown
- [ ] Open task detail → edit fields, comments visible
- [ ] List view → table with sort/filter works
- [ ] Analytics → charts render with demo data
- [ ] Sprints page → accordion with sprint history
- [ ] Theme toggle → works
- [ ] Search → filters demo data
- [ ] Command palette → navigation works, AI disabled
- [ ] `npx tsc --noEmit` — zero errors

## Completion Criteria
- App runs with `NEXT_PUBLIC_DEMO_MODE=true` and NO backend
- All pages render with realistic data
- All interactions work in-memory
- Toast messages on mutations
- Demo banner visible with GitHub link
- Zero dead ends (every click produces a result)
- Production build with DEMO_MODE=false has zero demo code in bundle
