# FlowBoard — Business Requirements (Demo Mode)

**Meeting:** 2026-03-26 Demo Mode Meeting
**Priority:** Portfolio Deployment

---

## BR-1: Demo Mode Toggle (CRITICAL)

**Requirement:** A single env variable enables frontend-only mode with no backend dependency.

**Acceptance Criteria:**
- [ ] `NEXT_PUBLIC_DEMO_MODE=true` in `.env` activates demo mode
- [ ] When ON: no API calls, no backend required, no auth cookies
- [ ] When OFF: everything works as before (real API)
- [ ] Build-time constant — zero runtime cost, demo code tree-shaken from production
- [ ] `.env.demo` file with demo mode pre-configured for easy deployment

**Three Seams:**
1. AuthProvider → DemoAuthProvider (auto-logged-in)
2. Middleware → bypass cookie check
3. Hooks → conditional re-export to demo hooks

---

## BR-2: Demo Data (CRITICAL)

**Requirement:** Realistic dummy data that tells a coherent team story.

**Acceptance Criteria:**
- [ ] 5 user profiles with DiceBear avatars (avataaars style)
- [ ] 1 workspace: "Meridian Labs"
- [ ] 2 projects: "Meridian Core" (active sprint), "Customer Portal Redesign" (planning)
- [ ] 32+ tasks with realistic software titles across all 5 status columns
- [ ] 3 sprints: 1 ACTIVE (62% complete), 2 CLOSED (with velocity data)
- [ ] 5 labels: Bug, Feature, Enhancement, Documentation, Urgent
- [ ] Analytics data: burndown (slightly behind), velocity (6 sprints), workload (uneven)
- [ ] Comments on 3-5 key tasks
- [ ] Activity feed entries
- [ ] 5-6 notifications (2 unread)
- [ ] All data typed using existing TypeScript interfaces (type-safe)
- [ ] Data stored in `src/demo/data/` directory

**User Profiles:**
```
Alex Rivera — Engineering Lead (logged-in user) — seed: alex-rivera
Samantha Cho — Senior Frontend Dev — seed: sam-cho
Marcus Webb — Backend Engineer — seed: marcus-webb
Priya Nair — Product Designer — seed: priya-nair
Jordan Lee — QA Engineer — seed: jordan-lee
```

---

## BR-3: Demo Auth Provider (HIGH)

**Requirement:** Login is bypassed in demo mode.

**Acceptance Criteria:**
- [ ] DemoAuthProvider resolves immediately with Alex Rivera as current user
- [ ] `isAuthenticated` is always true
- [ ] `login()` / `register()` are no-ops that redirect to /workspaces
- [ ] `logout()` shows toast "Demo mode — you cannot log out"
- [ ] Login/register pages redirect to /workspaces immediately
- [ ] Middleware bypasses fb_logged_in cookie check

---

## BR-4: Demo Hooks (HIGH)

**Requirement:** All data hooks return demo data in demo mode.

**Acceptance Criteria:**
- [ ] Demo hooks mirror real hook exports exactly (same function names, same return types)
- [ ] 8 demo hook files: tasks, workspaces, projects, sprints, analytics, comments, activity, notifications
- [ ] Mutations (create, update, delete, move) work in-memory via TanStack Query cache
- [ ] Each mutation shows toast: "Demo mode — changes are not saved"
- [ ] `staleTime: Infinity` prevents refetch attempts
- [ ] Conditional re-export shim at top of each real hook file
- [ ] Demo hooks never call `api.get()` or `api.post()`

---

## BR-5: Demo Banner (MEDIUM)

**Requirement:** Persistent indicator that the user is viewing demo data.

**Acceptance Criteria:**
- [ ] Thin amber strip at top of dashboard (36px height)
- [ ] Text: "You are viewing a live demo. All data is simulated and resets on refresh."
- [ ] Right side: "View Source on GitHub →" link
- [ ] Non-dismissible (no X button)
- [ ] Fixed position, above sidebar and top bar
- [ ] z-index above everything
- [ ] Only renders when `isDemoMode === true`

---

## BR-6: Demo Interactions (MEDIUM)

**Requirement:** All UI interactions work in demo mode with no dead ends.

**Acceptance Criteria:**
- [ ] Drag-and-drop: works (board store is local state)
- [ ] Create task: opens modal, submits to local cache, task appears on board
- [ ] Edit task: all fields editable, saves to local cache
- [ ] Delete task: removes from local cache
- [ ] Create project: works in-memory
- [ ] Create sprint / start / complete: works in-memory
- [ ] Search: filters pre-loaded data client-side
- [ ] Theme toggle: works (no backend needed)
- [ ] Command palette: navigation works, AI parsing shows toast "Disabled in demo"
- [ ] Invite member: toast "Team invites are disabled in demo mode"
- [ ] WebSocket: not connected, Live badge shows "Demo" instead

---

## Implementation Priority

| Phase | BRs | Duration |
|-------|-----|----------|
| 1 — Data + Auth | BR-1, BR-2, BR-3, BR-5 | 1-2 days |
| 2 — Demo Hooks | BR-4, BR-6 | 1-2 days |

**Total: 2-4 days**

---

## Screen Designs

### Demo Banner
```
┌──────────────────────────────────────────────────────────────────┐
│ 🔸 You are viewing a live demo. All data is simulated.   [GitHub →] │
└──────────────────────────────────────────────────────────────────┘
```

### Demo Board (what recruiters see at t=0)
```
┌──────────────────────────────────────────────────────────┐
│ 🔸 Demo Mode — data resets on refresh    [View on GitHub]│
├──────────────────────────────────────────────────────────┤
│ Sprint: Sprint 14 ▼  │ + Create Task │ Search │ Compact │
├──────────────────────────────────────────────────────────┤
│ BACKLOG(5)  TO DO(5)  IN PROGRESS(7)  REVIEW(5)  DONE(7)│
│ ┌────────┐ ┌────────┐ ┌──────────────┐ ┌──────┐ ┌─────┐│
│ │Investi.│ │Add role│ │Refactor Redis│ │Rate  │ │Sentry│
│ │  Bug   │ │Enhance.│ │  HIGH Marcus │ │limit │ │ ✓   ││
│ └────────┘ └────────┘ │  3 subtasks  │ │Alex  │ └─────┘│
│                       └──────────────┘ └──────┘        │
└──────────────────────────────────────────────────────────┘
```
