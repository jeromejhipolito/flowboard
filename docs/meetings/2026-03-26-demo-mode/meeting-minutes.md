# FlowBoard — Demo Mode Meeting Minutes

**Date:** 2026-03-26
**Type:** New Feature Evaluation
**Attendees:** CTO, Product Manager
**Status:** APPROVED

---

## Problem Statement

Hosting the backend (NestJS + PostgreSQL + Redis) costs money. The developer wants to deploy FlowBoard on their portfolio with a frontend-only mode that shows realistic dummy data so recruiters can experience the full UI without a running backend.

---

## Key Decisions

### Decision 1: Mock Provider Pattern (Not Hook Branching)
**Adopted:** Swap data sources at the provider level. Demo hooks are separate files mirroring real hook exports. Components never know the difference.
**Rejected:** Hook-level `if (isDemoMode)` branching — touches 11 files, creates two code paths per hook.
**Rejected:** API interceptor — still needs auth, still instantiates axios, brittle URL matching.

### Decision 2: Three Seams Only
1. **AuthProvider** — `DemoAuthProvider` resolves immediately with demo user
2. **Middleware** — bypasses cookie check when `NEXT_PUBLIC_DEMO_MODE=true`
3. **Data hooks** — conditional re-export: real hooks vs demo hooks

### Decision 3: DiceBear Avatars (Not Downloaded Images)
**Adopted:** `https://api.dicebear.com/9.x/avataaars/svg?seed=<name>` — deterministic, free, no backend, cacheable.
**Rejected:** Downloaded photos (copyright issues, repo bloat).
**Rejected:** ui-avatars.com (letter-only, looks obviously fake).

### Decision 4: Persistent Demo Banner
Non-dismissible amber strip at top: "You are viewing a live demo. All data is simulated."
Includes "View source on GitHub" link.

### Decision 5: All Interactions Work In-Memory
Create/edit/delete/drag all work via local TanStack Query cache mutations. Toast: "Demo mode — changes are not saved." No dead ends.

---

## Dummy Data Spec (Product Manager)

### Fictional Team: Meridian Labs
Building an analytics platform. 5-person engineering team, mid-sprint.

### 5 Users
| Name | Role | Avatar Seed |
|------|------|-------------|
| Alex Rivera | Engineering Lead (demo user) | alex-rivera |
| Samantha Cho | Senior Frontend Dev | sam-cho |
| Marcus Webb | Backend Engineer | marcus-webb |
| Priya Nair | Product Designer | priya-nair |
| Jordan Lee | QA Engineer | jordan-lee |

### 2 Projects
1. **Meridian Core** — Active dev, Sprint 14 active
2. **Customer Portal Redesign** — Planning phase, Sprint 2

### 32 Tasks (across both projects)
Meridian Core (24 tasks): 5 Backlog, 7 In Progress, 5 In Review, 7 Done
Customer Portal (8 tasks): mostly Backlog/In Progress

Task titles are realistic software work: "Refactor Redis cache layer to cluster mode", "Dashboard filter: date range picker", "Fix flaky AuthController integration test", etc.

### Sprint Data
- Sprint 14 (ACTIVE): Mar 17-28, 47 story points, ~62% complete
- Sprint 13 (CLOSED): 41 points completed
- Sprint 12 (CLOSED): 44 points completed

### Analytics
- Burndown: slight behind-then-catchup pattern (realistic, not perfect)
- Velocity: 6 sprints, 35-44 range with one dip
- Workload: Marcus slightly overloaded (7 tasks, 14 points)

---

## Architecture (CTO)

### File Structure
```
apps/web/src/demo/
  index.ts                     ← isDemoMode constant
  data/
    users.ts                   ← 5 team members + current user
    workspaces.ts              ← 1 workspace
    projects.ts                ← 2 projects
    sprints.ts                 ← 3 sprints (1 active, 2 closed)
    tasks.ts                   ← 32 tasks with relationships
    analytics.ts               ← pre-computed chart data
    comments.ts                ← comments on key tasks
    activity.ts                ← activity entries
    notifications.ts           ← 5-6 notifications
  hooks/
    use-demo-tasks.ts
    use-demo-workspaces.ts
    use-demo-projects.ts
    use-demo-sprints.ts
    use-demo-analytics.ts
    use-demo-comments.ts
    use-demo-activity.ts
    use-demo-notifications.ts
  providers/
    demo-auth-provider.tsx
  components/
    demo-banner.tsx
```

### Interaction Behavior in Demo Mode
| Action | Behavior |
|--------|----------|
| View board/list/analytics | Full data from demo/ |
| Drag-and-drop | Works (board store is local) |
| Create/edit/delete task | Updates TanStack cache + toast |
| Create sprint | Updates local cache + toast |
| Login/register | Bypassed — auto-logged in |
| Invite member | Toast: "Disabled in demo mode" |
| Notifications | 2 unread pre-seeded, mark-read works |

### Zero Production Impact
- `NEXT_PUBLIC_DEMO_MODE` is build-time constant
- Demo code tree-shaken from production bundle
- Dependency graph: `demo/ → hooks/`, never reverse
