# Phase 3 — Visual Polish + Authenticity Touches (3 hours)

**Sources:** Quality BR-6 + Authenticity BR-4

---

## Step 3.1: Unify Active Tab Patterns (30 min)

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/layout.tsx`
- [ ] Replace project nav active state from `bg-secondary text-foreground` to:
  ```
  isActive
    ? 'text-primary border-b-2 border-primary font-semibold'
    : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
  ```
- [ ] Wrap tab container with `border-b border-border` for underline rail

## Step 3.2: Fix Light Mode Column Visibility (15 min)

**EDIT:** `apps/web/src/components/board/kanban-column.tsx`
- [ ] Change `bg-muted/40` to `bg-accent/60` on the column container
- [ ] Update empty column state: dashed border only during drag-over, "No tasks" when static

## Step 3.3: Fix CardTitle Default Size (15 min)

**EDIT:** `apps/web/src/components/ui/card.tsx`
- [ ] Change `CardTitle` from `text-2xl` to `text-lg`

## Step 3.4: Empty Table State (15 min)

**EDIT:** `apps/web/src/components/list/task-list.tsx`
- [ ] When all status groups are empty (0 total tasks), show a centered message:
  "No tasks found" with an icon, below the table headers

## Step 3.5: Shimmer Skeleton (15 min)

**EDIT:** `apps/web/src/app/globals.css`
- [ ] Add shimmer keyframe animation:
  ```css
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton-shimmer {
    background: linear-gradient(90deg, var(--color-muted) 25%, color-mix(in srgb, var(--color-muted) 60%, var(--color-background)) 50%, var(--color-muted) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  ```

**EDIT:** `apps/web/src/components/ui/skeleton.tsx`
- [ ] Replace `animate-pulse` with `skeleton-shimmer`

## Step 3.6: Accessibility Quick Fixes (15 min)

- [ ] Login page error div: add `role="alert"` (`login/page.tsx`)
- [ ] Sidebar section labels: change `text-muted-foreground/60` to `/80` and `text-[10px]` to `text-[11px]`
- [ ] Notification panel: disable "Mark all as read" button when `isEmpty`
- [ ] Mobile search icon: add onClick to dispatch Ctrl+K

## Step 3.7: Minor Visual Fixes (30 min)

- [ ] Compact card overdue indicator: add red tint to left border when overdue
- [ ] Labels "+N more" badge: show `+{count}` when task has >3 labels
- [ ] User menu: add simple fade transition on dropdown appear

## Step 3.8: TODO/FIXME Comments + CHANGELOG (30 min)

**EDIT** — Add strategic comments:

`apps/api/src/notifications/notification.processor.ts`:
```ts
// TODO: this retry logic is naive — if the job fails after 3 attempts it
// disappears. Need dead-letter queue or at least an alert. Low priority
// but will bite us in production.
```

`apps/web/src/hooks/use-socket.ts`:
```ts
// NOTE: reconnection backoff is handled by socket.io client defaults (exponential
// up to 5s). If we add collaborative cursors later this will need revisiting.
```

`apps/api/src/tasks/tasks.service.ts`:
```ts
// FIXME: position gap threshold is hardcoded at 0.001. Should be a named constant.
// Rebalance triggers more often than expected on large boards.
```

`apps/web/src/components/board/kanban-board.tsx`:
```ts
// NOTE: closestCorners collision detection struggles with empty columns.
// Tried closestCenter — worse. Leaving this with a note to revisit.
```

**NEW:** `CHANGELOG.md` at project root:
```markdown
# Changelog

## Unreleased
- Timezone-aware due dates (in progress)
- Email notifications via Resend

## [0.3.0] - 2026-03-20
### Added
- Sprint planning and completion with carry-over
- Sprint burndown and velocity charts
### Changed
- Analytics velocity chart now shows trailing 4 sprints (was 6 — too noisy)

## [0.2.0] - 2026-03-10
### Added
- AI task parsing via command palette
- Demo mode (frontend-only deployment)
### Fixed
- Concurrent drag-and-drop position collision
- Task card click firing during drag on touch devices

## [0.1.0] - 2026-02-24
### Added
- Kanban board with drag-and-drop (fractional indexing)
- Real-time collaboration via WebSocket + Redis adapter
- JWT auth with refresh token rotation
- Role-based access: Owner, Admin, Member, Viewer
```

## Completion Criteria
- Consistent tab active states across all nav contexts
- Kanban columns visible in light mode
- Shimmer skeletons instead of pulse
- TODO/FIXME comments in 4 files
- CHANGELOG.md with 3 versions
- Accessibility fixes applied
