# FlowBoard — Product Quality Meeting Minutes

**Date:** 2026-03-27
**Type:** Product Quality, Design & UX Evaluation
**Attendees:** UX Designer, Product Manager, QA Engineer
**Status:** APPROVED

---

## Overall Verdict

**The app WORKS.** All 15 pages/components are functional. The gap is not functionality — it's POLISH. The project is in the top 5-10% of portfolio projects for this stack. The distance between "good" and "impressive" is specific, fixable items.

---

## Top Issues by Impact (All Roles Agree)

### CRITICAL — Breaks Portfolio Impression

| # | Issue | Source | Effort |
|---|-------|--------|--------|
| 1 | `window.confirm()` for delete (task + workspace) — OS native dialog breaks entire design | QA + UX | 1 hr |
| 2 | Landing page has NO product screenshot — recruiter sees hero text + 2 buttons, nothing else | UX + PM | 30 min |
| 3 | Profile/Settings buttons in user menu are dead (close menu, go nowhere) | QA + PM | 3 hrs |
| 4 | No "Try Demo" button on landing page — demo mode exists but isn't accessible without env flag | PM | 30 min |

### HIGH — Design Inconsistencies

| # | Issue | Source | Effort |
|---|-------|--------|--------|
| 5 | 3 different active state patterns (sidebar left-bar, project tabs filled bg, workspace tabs shadow) | UX | 1 hr |
| 6 | Task detail panel has 2 close buttons (redundant) | QA | 15 min |
| 7 | Sprint complete dialog counts ALL board tasks, not just sprint tasks | QA | 30 min |
| 8 | DnD rollback captures post-optimistic state (wrong rollback position) | QA | 1 hr |
| 9 | Kanban columns invisible against background in light mode (`bg-muted/40` too subtle) | UX | 15 min |
| 10 | `CardTitle` defaults to `text-2xl` — competes with page `h1` headings | UX | 15 min |

### MEDIUM — Polish Gaps

| # | Issue | Source | Effort |
|---|-------|--------|--------|
| 11 | Empty table (0 tasks in list view) shows header row with empty body, no message | QA | 15 min |
| 12 | Mobile search icon has no onClick handler — completely inert | QA + UX | 15 min |
| 13 | Login error missing `role="alert"` — screen readers don't announce failures | QA | 5 min |
| 14 | Notification "Mark all as read" enabled when empty — fires unnecessary API call | QA | 5 min |
| 15 | Labels truncated at 3 with no "+N more" indicator | QA | 15 min |
| 16 | `Skeleton` uses `animate-pulse` — should be shimmer gradient for premium feel | UX | 15 min |
| 17 | Sidebar section labels at 10px + 60% opacity — near contrast threshold | UX | 5 min |
| 18 | Compact card mode shows no overdue indicator | QA | 15 min |
| 19 | User menu dropdown has no enter transition | UX | 15 min |
| 20 | README has broken screenshot references + placeholder GitHub/LinkedIn links | PM | 15 min |

---

## Role Summaries

### UX Designer — Visual Quality: 7.5/10
"The foundation is genuinely strong. The indigo-violet palette, hover lift with primary shadow bleed, and `prefers-reduced-motion` support show real craft."

**Top 5 visual changes for biggest impact:**
1. Landing page product screenshot (zero code, just an image)
2. Replace `window.confirm()` with styled `ConfirmDialog`
3. Unify active tab pattern in project nav (bottom border indicator)
4. Fix Kanban column light mode visibility (`bg-accent/60`)
5. Shimmer skeleton + sidebar label contrast fix

### Product Manager — Feature Completeness: 8/10
"The gap between where it is and 'genuinely impressive' is: one settings page, one demo button, and four screenshot files."

**Top 5 improvements for interview impact:**
1. User Profile/Settings page (API already built, just needs frontend)
2. "Try Demo" button on landing page
3. README screenshots (referenced but files don't exist)
4. Fill in placeholder GitHub/LinkedIn links in README
5. Workspace home dashboard (recent activity, my tasks)

### QA Engineer — Edge Case Coverage: 7/10
**19 specific issues found with line numbers:**
- 5 High: duplicate close button, wrong sprint task count, DnD rollback state, missing null guards
- 7 Medium: dead navigation, mobile search, missing aria roles, empty states
- 7 Low: contrast, edge cases in empty sprints, misleading error messages

---

## Key Decisions

### Decision 1: Replace window.confirm() With ConfirmDialog
Create a reusable `ConfirmDialog` component. Use it for task deletion and workspace deletion. Match the existing Dialog/DialogContent pattern.

### Decision 2: Add Product Screenshot to Landing Page
Take a screenshot of the board in dark mode with populated data. Place below hero section with rounded corners + shadow.

### Decision 3: Create Minimal Settings Page
Route: `/settings`. Display: first name, last name, email (read-only), timezone picker. API: `GET /users/me` + `PATCH /users/me`. Wire the dead Profile/Settings buttons to navigate to this page.

### Decision 4: Fix Sprint Complete Task Count
The dialog reads ALL board tasks instead of filtering by sprint. Must filter `Object.values(columns).flat()` to only count tasks where `task.sprintId === sprint.id`.
