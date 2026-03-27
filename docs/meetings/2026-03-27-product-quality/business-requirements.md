# FlowBoard — Business Requirements (Product Quality)

**Meeting:** 2026-03-27 Product Quality Meeting

---

## BR-1: Replace window.confirm() With ConfirmDialog (CRITICAL)

**Requirement:** All destructive actions use a styled dialog, not browser native.

**Acceptance Criteria:**
- [ ] Create `src/components/ui/confirm-dialog.tsx` — reusable destructive action dialog
- [ ] Props: open, onOpenChange, title, description, confirmLabel, onConfirm, variant (destructive)
- [ ] Replace in `task-detail-panel.tsx` line 169 (task delete)
- [ ] Replace in `workspaces/[slug]/page.tsx` line 133 (workspace delete) and line 171 (member remove)
- [ ] Dialog shows: destructive title, description, Cancel + Confirm buttons
- [ ] Confirm button is `variant="destructive"`
- [ ] No `window.confirm()` calls anywhere in the codebase

---

## BR-2: Landing Page Product Screenshot + "Try Demo" (CRITICAL)

**Requirement:** Landing page shows the product and lets recruiters try instantly.

**Acceptance Criteria:**
- [ ] Screenshot of board in dark mode (populated with tasks) at `public/screenshot-board.png`
- [ ] Image displayed below CTA buttons: `rounded-xl border shadow-2xl overflow-hidden`
- [ ] "Try Demo" button between "Get Started" and "Sign In" — outline style
- [ ] Try Demo navigates to `/workspaces` with demo mode (or link to deployed demo URL)
- [ ] 3 feature chips below subtitle: "Real-Time Sync", "Sprint Planning", "AI Task Parsing"
- [ ] Increase gradient blob opacity from 0.12 to 0.18

---

## BR-3: User Settings Page (HIGH)

**Requirement:** Profile/Settings buttons in user menu navigate to a real page.

**Acceptance Criteria:**
- [ ] New route: `src/app/(dashboard)/settings/page.tsx`
- [ ] Display: first name, last name, email (read-only), avatar URL
- [ ] Timezone picker (searchable select with IANA values) — for future timezone feature
- [ ] Form uses `GET /users/me` to load, `PATCH /users/me` to save
- [ ] Toast on save success
- [ ] Wire user menu Profile button → `/settings`
- [ ] Wire user menu Settings button → `/settings`

---

## BR-4: Fix Duplicate Close Button in Task Detail (HIGH)

**Requirement:** Task detail panel has one close button, not two.

**Acceptance Criteria:**
- [ ] Remove the standalone close button strip at lines 255-260 of `task-detail-panel.tsx`
- [ ] Keep the header close button (line 307-309) which sits next to the title
- [ ] Close button visible during loading state (skeleton)

---

## BR-5: Fix Sprint Complete Task Count (HIGH)

**Requirement:** Sprint completion dialog counts only sprint tasks, not all board tasks.

**Acceptance Criteria:**
- [ ] In `complete-sprint-dialog.tsx`, filter tasks by `task.sprintId === sprint.id`
- [ ] Done count and incomplete count reflect only the selected sprint
- [ ] Progress bar shows sprint-specific completion percentage

---

## BR-6: Visual Polish Bundle (MEDIUM)

**Requirement:** Fix design inconsistencies and polish gaps.

**Acceptance Criteria:**
- [ ] Unify project nav active state: `text-primary border-b-2 border-primary font-semibold`
- [ ] Kanban column light mode: `bg-accent/60` instead of `bg-muted/40`
- [ ] `CardTitle` default: `text-lg` instead of `text-2xl`
- [ ] Empty table state: show "No tasks found" message when list has 0 rows
- [ ] Shimmer skeleton: replace `animate-pulse` with gradient shimmer animation
- [ ] Sidebar labels: `text-muted-foreground/80` instead of `/60`, min `text-[11px]`
- [ ] Login error: add `role="alert"` to error div
- [ ] Notification panel: disable "Mark all as read" when empty
- [ ] Mobile search icon: add onClick handler to open command palette
- [ ] Compact card: add red left-border tint when task is overdue
- [ ] Labels "+N more" badge when task has >3 labels

---

## BR-7: README Fix (MEDIUM)

**Requirement:** README has real screenshots and working links.

**Acceptance Criteria:**
- [ ] Take 4 screenshots: board, analytics, command palette, dark mode
- [ ] Save to `docs/screenshots/` or `public/`
- [ ] Update README image references to real paths
- [ ] Replace placeholder GitHub link with `https://github.com/jeromejhipolito/flowboard`
- [ ] Replace placeholder LinkedIn link with Jerome's real LinkedIn URL

---

## Implementation Priority

| Phase | BRs | Duration |
|-------|-----|----------|
| 1 — Critical fixes | BR-1, BR-4, BR-5 | 2 hours |
| 2 — Landing page + settings | BR-2, BR-3 | 4 hours |
| 3 — Visual polish | BR-6, BR-7 | 3 hours |

**Total: ~1 day of focused work**

---

## Screen Designs

### ConfirmDialog (BR-1)
```
┌─────────────────────────────────┐
│ ⚠ Delete Task               [X]│
│─────────────────────────────────│
│ Are you sure you want to delete │
│ "Fix auth bug"? This action     │
│ cannot be undone.               │
│                                 │
│ [Cancel]        [Delete Task]   │
│                  ← destructive  │
└─────────────────────────────────┘
```

### Landing Page With Screenshot (BR-2)
```
    [*] Real-time collaboration

         FlowBoard

    A Kanban workspace where your team
    moves in sync.

    [Real-Time Sync] [Sprint Planning] [AI Parsing]

    [Get Started] [Try Demo] [Sign In]

    ┌─────────────────────────────────┐
    │  ╔═══════════════════════════╗  │
    │  ║  screenshot-board.png    ║  │
    │  ║  (dark mode, populated)  ║  │
    │  ╚═══════════════════════════╝  │
    └─────────────────────────────────┘
```

### Settings Page (BR-3)
```
┌─────────────────────────────────┐
│ Settings                        │
│─────────────────────────────────│
│ First Name  [Jerome           ] │
│ Last Name   [Jhipolito        ] │
│ Email       jerome@example.com  │
│             (read-only)         │
│ Timezone    [Asia/Manila     ▼] │
│                                 │
│             [Save Changes]      │
└─────────────────────────────────┘
```
