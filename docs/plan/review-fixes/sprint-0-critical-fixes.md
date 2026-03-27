# Sprint 0 — Critical Fixes (1 Day)

**Goal:** Fix all CRITICAL severity bugs found by Security, Backend, QA, and CTO reviewers.
**Flagged by:** Security (CRIT-1,2,3), CTO (#1,3), Backend (P0), QA (BUG-1,3,5)

---

## Step 0.1: Fix Redis KEYS* Scan in Auth (30 min)

**File:** `apps/api/src/auth/auth.service.ts`
**Issue:** `validateRefreshToken` scans ALL Redis keys with `KEYS refresh:*` — O(N) blocking.
**Flagged by:** ALL 5 engineering reviewers + CTO

- [ ] Change token storage: `refresh:{token}` → `userId` (not `refresh:{userId}` → `token`)
- [ ] `storeRefreshToken()`: `redis.set(\`refresh:${token}\`, userId, 'EX', ttl)`
- [ ] `validateRefreshToken()`: `redis.get(\`refresh:${token}\`)` — single O(1) GET
- [ ] `logout()`: accept refreshToken in request body, `redis.del(\`refresh:${token}\`)`
- [ ] Update `RefreshTokenDto` to pass token on logout
- [ ] Update `generateTokens()` to store token-keyed, not userId-keyed

## Step 0.2: Add WebSocket Room Authorization (1 hr)

**File:** `apps/api/src/gateway/events.gateway.ts`
**Issue:** Any authenticated user can join any `board:{projectId}` room — IDOR.
**Flagged by:** Security (CRIT-2), CTO (#3), Backend (P1), QA (BUG-5 related)

- [ ] Inject `PrismaService` into `EventsGateway`
- [ ] In `joinBoard` handler, before `client.join(room)`:
  - Extract `projectId` from the room name
  - Query: find project → get workspaceId → check WorkspaceMembership for `client.data.userId`
  - If no membership: `client.emit('error', { code: 'FORBIDDEN' })` and return
- [ ] Add same check on reconnection (not just initial join)
- [ ] Log unauthorized join attempts

## Step 0.3: Add RBAC Guards to TasksController (2 hrs)

**File:** `apps/api/src/tasks/tasks.controller.ts`
**Issue:** No `WorkspaceMemberGuard` on task endpoints — any auth'd user can CRUD any task.
**Flagged by:** CTO (#2), Backend (P1), QA (BUG-3,5)

- [ ] Create `ProjectMemberGuard` in `src/common/guards/project-member.guard.ts`:
  - Extract `projectId` from params (`:projectId` or lookup from `:id` task)
  - Query project → get `workspaceId` → check `WorkspaceMembership`
  - Attach membership to `request.workspaceMembership`
- [ ] Apply `@UseGuards(ProjectMemberGuard)` to all TasksController routes
- [ ] Apply `@UseGuards(ProjectMemberGuard)` to CommentsController routes
- [ ] Apply `@UseGuards(ProjectMemberGuard)` to labels attach/detach routes

## Step 0.4: Fix Bull Processor Error Swallowing (15 min)

**Files:** `apps/api/src/audit/audit.processor.ts`, `apps/api/src/notifications/notification.processor.ts`
**Issue:** `catch` blocks log but don't re-throw — Bull thinks jobs succeeded, retries never fire.
**Flagged by:** Backend (P0), QA

- [ ] In `audit.processor.ts`: re-throw error after logging
- [ ] In `notification.processor.ts`: re-throw error after logging
- [ ] Verify Bull retry config (attempts: 3, backoff: exponential) is still in place

## Step 0.5: Fix Notification Route Ordering (15 min)

**File:** `apps/api/src/notifications/notifications.controller.ts`
**Issue:** `PATCH :id/read` registered before `PATCH read-all` — Express interprets "read-all" as `:id`.
**Flagged by:** Backend (P0)

- [ ] Move `@Patch('read-all') markAllAsRead()` ABOVE `@Patch(':id/read') markAsRead()`
- [ ] Verify with manual test: `PATCH /notifications/read-all` returns correct response

## Step 0.6: Verify Full Build

- [ ] Run `npx nest build` — zero errors
- [ ] Run `npx next build` — all pages generate
- [ ] Manual smoke test: register → login → create workspace → create task

## Completion Criteria
- Redis token lookup is O(1)
- Unauthorized WebSocket room join is rejected
- Cross-workspace task access returns 403
- Bull retries fire on processor failure
- `PATCH /notifications/read-all` works correctly
