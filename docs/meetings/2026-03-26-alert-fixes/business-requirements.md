# FlowBoard — Business Requirements (Alert Fix Sprint)

**Meeting:** 2026-03-26 Alert Level Meeting
**Priority:** CRITICAL — Demo-blocking issues

---

## BR-1: Create Project Flow (CRITICAL)

**Requirement:** Users with ADMIN+ role must be able to create projects within a workspace.

**Acceptance Criteria:**
- [ ] "Create Project" button on workspace detail page (Projects tab) opens a modal
- [ ] Modal has: name (required, 2-100 chars), description (optional)
- [ ] On submit: calls `POST /workspaces/:id/projects` via `useCreateProject` hook
- [ ] On success: shows toast, closes modal, project appears in list
- [ ] On error: shows error message in modal
- [ ] Button only visible to ADMIN and OWNER roles
- [ ] Project list renders real data from API (not hardcoded empty state)
- [ ] Clicking a project navigates to `/workspaces/[slug]/projects/[id]/board`

**Files Changed:**
- NEW: `src/components/workspace/create-project-modal.tsx`
- EDIT: `src/app/(dashboard)/workspaces/[slug]/page.tsx`

---

## BR-2: Command Palette Integration (CRITICAL)

**Requirement:** All quick actions in the command palette must trigger their corresponding features.

**Acceptance Criteria:**
- [ ] "Create Task" → navigates to board page, opens CreateTaskModal
- [ ] "Create Project" → navigates to workspace page (Projects tab), opens CreateProjectModal
- [ ] "Create Workspace" → navigates to workspaces list, opens CreateWorkspaceModal
- [ ] Navigation items (Go to Workspaces, Go to Settings) work correctly
- [ ] AI parse results pre-populate the task creation form
- [ ] Search input in top bar opens command palette on click (not readOnly)

**Architecture:** URL-based (`?action=create-task`) instead of custom events.

**Files Changed:**
- EDIT: `src/components/command-palette/command-palette.tsx`
- EDIT: `src/app/(dashboard)/workspaces/page.tsx`
- EDIT: `src/app/(dashboard)/workspaces/[slug]/page.tsx`
- EDIT: `src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/board/page.tsx`

---

## BR-3: Theme System (HIGH)

**Requirement:** Users must be able to switch between light and dark themes.

**Acceptance Criteria:**
- [ ] Theme toggle visible in top bar (not buried in sidebar bottom)
- [ ] Three modes: Light, Dark, System
- [ ] Default: system preference
- [ ] Persists across page refreshes (localStorage key: `flowboard-theme`)
- [ ] Both themes have proper contrast ratios (WCAG AA)

**Files Changed:**
- EDIT: `src/components/layout/top-bar.tsx` (add ThemeToggle)
- EDIT: `src/components/layout/sidebar.tsx` (move ThemeToggle to top-bar)
- EDIT: `src/providers/theme-provider.tsx` (explicit defaults)

---

## BR-4: Visual Design Overhaul (HIGH)

**Requirement:** UI must look like a premium product, not a tutorial project.

**Acceptance Criteria:**
- [ ] Indigo-violet primary color (#5b4ff5) replacing generic blue
- [ ] Dark mode: 3-level surface elevation (page/card/popover distinct)
- [ ] Cards: visible hover lift effect (-translate-y-0.5 + shadow)
- [ ] Kanban columns: 3px colored top accent bar per status
- [ ] Task cards: 3px left priority border (color-coded)
- [ ] Sidebar: gradient logo "FlowBoard", left accent bar on active link
- [ ] Landing page: gradient hero text, status chip, gradient CTA button
- [ ] Auth pages: radial gradient background blob
- [ ] Button press feedback: active:scale-[0.97]
- [ ] Page entrance animations: staggered slide-up on dashboard elements

**Color Palette:**
| Token | Light | Dark |
|-------|-------|------|
| background | #f8f7ff | #0c0c14 |
| card | #ffffff | #14141f |
| popover | #ffffff | #1c1c2e |
| primary | #5b4ff5 | #7c6ff7 |
| border | #e5e3fb | #2a2840 |
| muted-fg | #6b7280 | #8b8aa0 |

**Files Changed:**
- REWRITE: `src/app/globals.css`
- EDIT: `src/app/page.tsx` (landing hero)
- EDIT: `src/app/(auth)/layout.tsx` (gradient background)
- EDIT: `src/components/layout/sidebar.tsx` (logo, active state)
- EDIT: `src/components/ui/card.tsx` (shadow system)
- EDIT: `src/components/ui/button.tsx` (press feedback)
- EDIT: `src/components/board/kanban-column.tsx` (top accent bar)
- EDIT: `src/components/board/task-card.tsx` (left priority bar)

---

## BR-5: Testing Foundation (HIGH)

**Requirement:** Core features must have automated tests preventing regressions.

**Acceptance Criteria:**
- [ ] Jest + Testing Library configured for frontend
- [ ] Jest configured for backend
- [ ] 10 priority tests written and passing:
  1. Create Project button opens modal
  2. Command palette dispatches correctly
  3. Board page responds to create-task action
  4. Auth service blocks duplicate emails
  5. moveTask position calculation correct
  6. ThemeProvider renders with correct attributes
  7. CreateTaskModal validates required fields
  8. WorkspaceMemberGuard blocks non-members
  9. parseTtl handles all formats
  10. KanbanBoard renders 5 columns
- [ ] CI pipeline runs tests on every push

**Files Changed:**
- NEW: `apps/web/jest.config.ts`
- NEW: `apps/web/jest.setup.ts`
- NEW: 6 frontend test files
- NEW: 3 backend test files
- EDIT: `apps/web/package.json` (test deps + scripts)
- EDIT: `apps/api/package.json` (test scripts)

---

## BR-6: Search Enhancement (MEDIUM)

**Requirement:** The search input in the top bar must be functional.

**Acceptance Criteria:**
- [ ] Clicking the search input opens the command palette
- [ ] Remove `readOnly` attribute
- [ ] Keyboard shortcut hint (Ctrl+K) remains visible

**Files Changed:**
- EDIT: `src/components/layout/top-bar.tsx`

---

## Implementation Priority Order

| Phase | BRs | Duration |
|-------|-----|----------|
| 1 — Fix Broken | BR-1, BR-2, BR-3, BR-6 | 2 hours |
| 2 — Visual Redesign | BR-4 | 90 minutes |
| 3 — Testing | BR-5 | 3-4 hours |

**Total estimated: 1 day of focused work**

---

## Screen Designs

### Workspace Detail — Projects Tab (BR-1)
```
+--------------------------------------------------+
| FlowBoard Team                    [Create Project]|
+--------------------------------------------------+
| [Projects] [Members] [Settings]                   |
+--------------------------------------------------+
| +------------------+ +------------------+          |
| | Website Redesign | | Bug Fixes        |          |
| | 15 tasks         | | 8 tasks          |          |
| | ACTIVE           | | ACTIVE           |          |
| +------------------+ +------------------+          |
+--------------------------------------------------+
```

### Create Project Modal (BR-1)
```
+-----------------------------+
| Create New Project      [X] |
|-----------------------------|
| Name *                      |
| [________________________]  |
|                             |
| Description                 |
| [________________________]  |
| [________________________]  |
|                             |
| [Cancel]    [Create Project]|
+-----------------------------+
```

### Kanban Column Redesign (BR-4)
```
+---------------------------+
|====== (3px accent bar) ===|
| IN PROGRESS            4  |
|---------------------------|
| +-----------------------+ |
| |=| Fix auth bug        | |  <- 3px left priority border
| |=| HIGH  @Sarah  Mar28 | |
| +-----------------------+ |
| +-----------------------+ |
| |=| Design dashboard    | |
| |=| MED   @Mike   Apr2  | |
| +-----------------------+ |
+---------------------------+
```

### Landing Page Hero (BR-4)
```
+--------------------------------------------------+
|                                                    |
|        (radial gradient glow from top)             |
|                                                    |
|    [*] Real-time collaboration — built for teams   |  <- status chip
|                                                    |
|              Flow Board                            |  <- gradient text
|                                                    |
|    A Kanban workspace where your team moves        |
|    in sync. Tasks update live. No refresh needed.  |
|                                                    |
|      [Get Started Free]  [Sign In]                 |  <- gradient + outline
|                                                    |
+--------------------------------------------------+
```

### Sidebar Redesign (BR-4)
```
+----------------------------+
| [*] FlowBoard              |  <- gradient text logo
|----------------------------|
| NAVIGATION                  |  <- section label
| |= Workspaces              |  <- left accent bar = active
|    Projects                 |
|    Analytics                |
|----------------------------|
| WORKSPACE                   |
| v FlowBoard Team           |
|    > Projects               |
|    > Members                |
|    > Settings               |
|----------------------------|
|         [Sun/Moon toggle]   |
+----------------------------+
```
