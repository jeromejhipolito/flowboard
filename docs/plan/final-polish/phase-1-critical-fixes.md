# Phase 1 — Critical Fixes (2 hours)

**Sources:** Quality BR-1, BR-4, BR-5

---

## Step 1.1: Create ConfirmDialog Component (30 min)

**NEW:** `apps/web/src/components/ui/confirm-dialog.tsx`
- [ ] Reusable destructive confirmation dialog
- [ ] Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `onConfirm`, `isLoading`
- [ ] Uses existing Dialog/DialogContent/DialogHeader/DialogFooter
- [ ] Cancel button: `variant="outline"`
- [ ] Confirm button: `variant="destructive"` with loading spinner
- [ ] Renders destructive icon (AlertTriangle from lucide)

## Step 1.2: Replace window.confirm() in Task Detail (30 min)

**EDIT:** `apps/web/src/components/board/task-detail-panel.tsx`
- [ ] Import ConfirmDialog
- [ ] Add state: `const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)`
- [ ] Replace `window.confirm()` at delete handler with `setDeleteConfirmOpen(true)`
- [ ] Add `<ConfirmDialog>` in JSX with title "Delete Task", description "Are you sure? This cannot be undone."
- [ ] onConfirm calls the existing delete logic

## Step 1.3: Replace window.confirm() in Workspace Page (30 min)

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/page.tsx`
- [ ] Replace workspace delete `window.confirm()` with ConfirmDialog
- [ ] Replace member remove `window.confirm()` with ConfirmDialog
- [ ] Two separate dialog states: `deleteWorkspaceOpen`, `removeMemberOpen`
- [ ] Track which member is being removed: `memberToRemove` state

## Step 1.4: Remove Duplicate Close Button (15 min)

**EDIT:** `apps/web/src/components/board/task-detail-panel.tsx`
- [ ] Remove the standalone close button strip (the `<div>` with border-b containing only an X button above the content)
- [ ] Keep the header close button (next to task title) — it's contextually correct
- [ ] Ensure close button appears during loading skeleton too

## Step 1.5: Fix Sprint Complete Task Count (15 min)

**EDIT:** `apps/web/src/components/sprint/complete-sprint-dialog.tsx`
- [ ] Find where `allTasks` is derived from `Object.values(columns).flat()`
- [ ] Filter to only count tasks belonging to this sprint: `.filter(t => t.sprintId === sprint.id)`
- [ ] Verify: DONE count and incomplete count reflect sprint-specific totals
- [ ] Progress bar shows sprint-specific completion percentage

## Completion Criteria
- Zero `window.confirm()` calls in the codebase
- Task delete shows styled ConfirmDialog
- Workspace delete + member remove show ConfirmDialog
- One close button on task detail panel
- Sprint complete dialog counts only sprint tasks
