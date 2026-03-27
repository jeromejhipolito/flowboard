# Phase 1 — Infrastructure + Demo Data (BR-1, BR-2, BR-3, BR-5)

**Duration:** 1-2 days | **Backend work:** None — pure frontend

---

## Step 1.1: Demo Mode Toggle + Config (30 min)

**NEW:** `apps/web/src/demo/index.ts`
```ts
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export const GITHUB_REPO_URL = 'https://github.com/yourusername/flowboard';
```

**NEW:** `apps/web/.env.demo`
```
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_URL=https://flowboard.yourdomain.com
```

- [ ] Create the demo index file
- [ ] Create `.env.demo` for demo deployments
- [ ] Verify: `isDemoMode` resolves correctly at build time

## Step 1.2: Demo Data — Users + Workspace (1 hr)

**NEW:** `apps/web/src/demo/data/users.ts`
- [ ] 5 users: Alex Rivera, Samantha Cho, Marcus Webb, Priya Nair, Jordan Lee
- [ ] DiceBear avatar URLs: `https://api.dicebear.com/9.x/avataaars/svg?seed=<name>`
- [ ] `DEMO_CURRENT_USER = DEMO_USERS[0]` (Alex Rivera)
- [ ] All typed using existing `User` interface patterns

**NEW:** `apps/web/src/demo/data/workspaces.ts`
- [ ] 1 workspace: "Meridian Labs", slug: "meridian-labs"
- [ ] Member count: 5, current user role: OWNER

## Step 1.3: Demo Data — Projects + Sprints (1 hr)

**NEW:** `apps/web/src/demo/data/projects.ts`
- [ ] Project 1: "Meridian Core" — ACTIVE, ID: demo-project-1
- [ ] Project 2: "Customer Portal Redesign" — ACTIVE, ID: demo-project-2

**NEW:** `apps/web/src/demo/data/sprints.ts`
- [ ] Sprint 14 (ACTIVE): Mar 17-28, goal: "Reliability & Scale", 47 story points
- [ ] Sprint 13 (CLOSED): 41 points completed, completedAt set
- [ ] Sprint 12 (CLOSED): 44 points completed
- [ ] Sprint 2 for Portal project (ACTIVE): Mar 24-Apr 4

## Step 1.4: Demo Data — Tasks (2 hrs)

**NEW:** `apps/web/src/demo/data/tasks.ts`
- [ ] 24 tasks for Meridian Core:
  - BACKLOG (5): "Investigate Datadog alert", "Add pagination to events endpoint", "Write migration guide", "Accessibility audit", "Set up staging Terraform"
  - IN_PROGRESS (7): "Refactor Redis cache layer", "Dashboard date range picker", "Multi-select dropdown", "Fix flaky AuthController test", "Update OpenAPI spec", "Standardize loading skeletons", "Request deduplication middleware"
  - IN_REVIEW (5): "Add rate limiting to public API", "Migrate Chart.js to Recharts", "E2E tests for filter persistence", "Update env documentation", "Compress static assets via CDN"
  - DONE (7): "Set up Sentry", "JWT refresh token rotation", "Empty state illustrations", "Tooltip overflow fix", "N+1 workspace members", "Cypress smoke tests", "Q2 OKR session notes"
- [ ] 8 tasks for Customer Portal Redesign (mostly BACKLOG/TODO)
- [ ] Each task: realistic title, description, priority, assignee, dueDate, labels, storyPoints, position
- [ ] Tasks reference valid user IDs, project IDs, sprint IDs, label IDs
- [ ] completedAt set on DONE tasks

**NEW:** `apps/web/src/demo/data/labels.ts`
- [ ] 5 labels: Bug (#ef4444), Feature (#3b82f6), Enhancement (#8b5cf6), Documentation (#06b6d4), Urgent (#f97316)

## Step 1.5: Demo Data — Analytics + Comments + Notifications (1 hr)

**NEW:** `apps/web/src/demo/data/analytics.ts`
- [ ] Task distribution: { BACKLOG: 5, TODO: 5, IN_PROGRESS: 7, IN_REVIEW: 5, DONE: 7 }
- [ ] Priority breakdown: { LOW: 4, MEDIUM: 12, HIGH: 8, URGENT: 0 }
- [ ] Member workload: Alex(5/11pts), Samantha(5/13pts), Marcus(7/14pts), Priya(4/8pts), Jordan(3/7pts)
- [ ] Velocity: 6 sprints [38, 42, 35, 44, 41, 29]
- [ ] Burndown: 8 days of data showing slightly-behind-then-catching-up pattern
- [ ] Overdue: 2 tasks overdue

**NEW:** `apps/web/src/demo/data/comments.ts`
- [ ] 3-5 comments on key tasks (Redis refactor, rate limiting)
- [ ] Comments from different team members

**NEW:** `apps/web/src/demo/data/notifications.ts`
- [ ] 6 notifications, 2 unread
- [ ] Types: TASK_ASSIGNED, COMMENT_ADDED, MENTION, TASK_STATUS_CHANGED

## Step 1.6: Demo Auth Provider (1 hr)

**NEW:** `apps/web/src/demo/providers/demo-auth-provider.tsx`
- [ ] "use client" component
- [ ] Sets state immediately: `{ user: DEMO_CURRENT_USER, accessToken: 'demo-token', isLoading: false, isAuthenticated: true }`
- [ ] `login()` → `toast.info('Demo mode')` + `router.push('/workspaces')`
- [ ] `register()` → same as login
- [ ] `logout()` → `toast.info('Demo mode — you cannot log out')`
- [ ] `refreshToken()` → no-op

**EDIT:** `apps/web/src/providers/auth-provider.tsx`
- [ ] Import `isDemoMode` from `@/demo`
- [ ] If isDemoMode: render `<DemoAuthProvider>` instead of real `<AuthProvider>`

**EDIT:** `apps/web/middleware.ts`
- [ ] Add at top: `if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return NextResponse.next();`

## Step 1.7: Demo Banner (30 min)

**NEW:** `apps/web/src/components/demo/demo-banner.tsx`
- [ ] "use client" component
- [ ] Thin amber/indigo strip: h-9, bg-primary/10, text-sm
- [ ] Left: "You are viewing a live demo. All data is simulated."
- [ ] Right: "View Source on GitHub →" link
- [ ] Non-dismissible, z-50, fixed top, full width

**EDIT:** `apps/web/src/app/(dashboard)/layout.tsx`
- [ ] Import `isDemoMode` and `DemoBanner`
- [ ] Render `{isDemoMode && <DemoBanner />}` above everything else

## Step 1.8: Auth Page Redirects (15 min)

**EDIT:** `apps/web/src/app/(auth)/login/page.tsx`
- [ ] Add at top of component: if isDemoMode, redirect to /workspaces immediately

**EDIT:** `apps/web/src/app/(auth)/register/page.tsx`
- [ ] Same redirect

## Completion Criteria
- `NEXT_PUBLIC_DEMO_MODE=true` → app loads without backend
- Auto-logged in as Alex Rivera
- Demo banner visible at top
- Login/register pages redirect to /workspaces
- All demo data files type-check against existing interfaces
