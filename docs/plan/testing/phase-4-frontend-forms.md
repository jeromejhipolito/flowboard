# Phase 4 — Frontend Form Tests (69 tests)

**Duration:** 1 day | **Priority:** P0

---

## Step 4.1: Login Form (12 tests)

**NEW:** `apps/web/src/__tests__/auth/login.test.tsx`
- [ ] Renders email + password inputs + Sign In button
- [ ] Shows email validation error for invalid format
- [ ] Shows "Password is required" for empty password
- [ ] Calls login() with email + password on valid submit
- [ ] Disables button + shows spinner while submitting
- [ ] Displays server error in role="alert" div
- [ ] Clears error on next submit attempt
- [ ] Redirects to /workspaces in demo mode
- [ ] Password input type is "password"
- [ ] Link to /register exists
- [ ] Email has correct label association
- [ ] Error div has role="alert"

## Step 4.2: Register Form (10 tests)

**NEW:** `apps/web/src/__tests__/auth/register.test.tsx`
- [ ] Renders 4 fields: firstName, lastName, email, password
- [ ] Validates each required field
- [ ] Shows "Password must be at least 8 characters" for short password
- [ ] Calls register() with correct args
- [ ] Shows spinner during submission
- [ ] Shows API error on rejection
- [ ] Link to /login exists

## Step 4.3: CreateWorkspaceModal (10 tests)

**NEW:** `apps/web/src/__tests__/workspace/create-workspace-modal.test.tsx`
- [ ] Renders when open=true, hidden when false
- [ ] Name required validation
- [ ] Calls mutateAsync with name + description
- [ ] Fires onOpenChange(false) on success
- [ ] Shows toast.success and toast.error
- [ ] Cancel closes without submitting
- [ ] Form resets after success
- [ ] Submit disabled during loading

## Step 4.4: CreateProjectModal (5 tests)

**NEW:** `apps/web/src/__tests__/workspace/create-project-modal.test.tsx`

## Step 4.5: InviteMemberModal (7 tests)

**NEW:** `apps/web/src/__tests__/workspace/invite-member-modal.test.tsx`

## Step 4.6: CreateTaskModal (9 tests)

**NEW:** `apps/web/src/__tests__/board/create-task-modal.test.tsx`
- [ ] Title required, max 200
- [ ] Priority defaults to MEDIUM
- [ ] DueDateTimezoneBreakdown renders when dueDate + assignee set
- [ ] Calls mutateAsync with projectId + form values
- [ ] Shows toast on success/error

## Step 4.7: CreateSprintModal (6 tests)

**NEW:** `apps/web/src/__tests__/sprint/create-sprint-modal.test.tsx`

## Step 4.8: CompleteSprintDialog (13 tests)

**NEW:** `apps/web/src/__tests__/sprint/complete-sprint-dialog.test.tsx`
- [ ] Progress bar shows correct percentage
- [ ] Incomplete tasks listed with status badges
- [ ] Radio: "Move to backlog" default, planning sprint options
- [ ] Calls completeSprint with correct nextSprintId
- [ ] Returns null when sprint is null
- [ ] Hidden when all tasks DONE

## Step 4.9: Run frontend tests

- [ ] `cd apps/web && npx jest` — 69 tests, 0 failures
