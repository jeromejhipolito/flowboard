# Phase 1 — Backend Service Tests (96 tests)

**Duration:** 1 day | **Priority:** P0 — Highest risk business logic

---

## Step 1.1: Expand auth.service.spec.ts (18 tests total, +15 new)

**File:** `apps/api/src/auth/auth.service.spec.ts` (exists, has 3 tests)

Add these test cases:
- [ ] login — throws UnauthorizedException for wrong password (bcrypt mismatch)
- [ ] login — returns tokens and user without password on correct credentials
- [ ] register — stores refresh token in Redis with key `refresh:{token}`
- [ ] register — stores refresh token with correct TTL
- [ ] refreshTokens — throws UnauthorizedException when redis.get returns null
- [ ] refreshTokens — throws UnauthorizedException when user no longer exists
- [ ] refreshTokens — deletes old refresh key before issuing new one (rotation)
- [ ] refreshTokens — returns new accessToken and refreshToken
- [ ] logout — calls redis.del with correct key when refreshToken provided
- [ ] logout — does NOT call redis.del when no refreshToken
- [ ] parseTtl — '7d' → 604800, '15m' → 900, '1h' → 3600, '30s' → 30
- [ ] parseTtl — defaults to 7 days for invalid format

Mock setup: PrismaService (user.findUnique, user.create), JwtService (sign), ConfigService (get), REDIS_CLIENT (set, get, del)

## Step 1.2: Create tasks.service.spec.ts (28 tests)

**NEW:** `apps/api/src/tasks/tasks.service.spec.ts`

- [ ] create — position is lastTask.position + 1.0 when tasks exist
- [ ] create — position is 1.0 when column is empty
- [ ] create — defaults status to TODO
- [ ] create — emits task.created event
- [ ] create — throws NotFoundException when parentTaskId not found
- [ ] create — throws BadRequestException when parent in different project
- [ ] findAllByProject — filters by status, priority, sprintId
- [ ] findAllByProject — sprintId: 'backlog' translates to sprintId: null
- [ ] findAllByProject — search applies OR on title and description
- [ ] findAllByProject — pagination: hasMore when tasks.length > limit
- [ ] findById — throws NotFoundException for unknown task
- [ ] update — sets completedAt when status changes TO DONE
- [ ] update — clears completedAt when status changes FROM DONE
- [ ] update — does NOT change completedAt when status unchanged
- [ ] update — emits task.updated event
- [ ] moveTask — throws NotFoundException for unknown task
- [ ] moveTask — sets completedAt when moved TO DONE
- [ ] moveTask — clears completedAt when moved FROM DONE
- [ ] moveTask — triggers rebalance via $transaction when gap < 0.001
- [ ] moveTask — normal move does NOT use $transaction
- [ ] moveTask — emits task.moved event
- [ ] softDelete — sets deletedAt, not hard delete
- [ ] softDelete — throws NotFoundException for unknown task
- [ ] addLabel — creates TaskLabel junction record
- [ ] removeLabel — deletes TaskLabel junction record

Mock: PrismaService (task CRUD, $transaction), EventEmitter2 (emit)

## Step 1.3: Create workspaces.service.spec.ts (22 tests)

**NEW:** `apps/api/src/workspaces/workspaces.service.spec.ts`

- [ ] create — creates workspace with creator as OWNER
- [ ] create — generates unique slug from name
- [ ] create — appends random hex when slug is taken
- [ ] findById — uses id lookup for CUIDs, slug lookup otherwise
- [ ] findById — throws NotFoundException for unknown workspace
- [ ] softDelete — sets deletedAt
- [ ] inviteMember — throws NotFoundException when user email not found
- [ ] inviteMember — throws ConflictException when already a member
- [ ] inviteMember — stores invitedById
- [ ] updateMemberRole — throws NotFoundException when membership not found
- [ ] updateMemberRole — throws ForbiddenException when OWNER changes own role
- [ ] updateMemberRole — throws ForbiddenException when non-OWNER assigns OWNER
- [ ] updateMemberRole — OWNER can assign OWNER to another user
- [ ] removeMember — throws BadRequestException when removing OWNER
- [ ] removeMember — throws NotFoundException when membership not found
- [ ] generateUniqueSlug — converts spaces/special chars to hyphens
- [ ] generateUniqueSlug — strips leading/trailing hyphens

Mock: PrismaService (workspace, workspaceMembership, user)

## Step 1.4: Create sprints.service.spec.ts (28 tests)

**NEW:** `apps/api/src/sprints/sprints.service.spec.ts`

- [ ] create — creates sprint with PLANNING status
- [ ] create — throws NotFoundException when project not found
- [ ] findById — computes totalTasks, doneTasks, totalPoints, donePoints
- [ ] findById — throws NotFoundException for unknown sprint
- [ ] update — throws BadRequestException when sprint is CLOSED
- [ ] update — ACTIVE sprint CAN be updated
- [ ] start — throws BadRequestException when sprint is not PLANNING
- [ ] start — throws ConflictException when project has ACTIVE sprint
- [ ] start — sets startDate to now when none provided
- [ ] start — preserves existing startDate
- [ ] start — sets scopeAtStart to current task count
- [ ] complete — throws BadRequestException when sprint not ACTIVE
- [ ] complete — throws NotFoundException when nextSprintId invalid
- [ ] complete — throws BadRequestException when nextSprintId different project
- [ ] complete — uses $transaction for atomicity
- [ ] complete — incomplete tasks move to null when no nextSprintId
- [ ] complete — incomplete tasks move to nextSprintId when provided
- [ ] complete — carriedOver = count of non-DONE tasks
- [ ] complete — emits sprint.completed event
- [ ] delete — throws BadRequestException when sprint not PLANNING
- [ ] delete — throws BadRequestException when sprint has tasks
- [ ] delete — PLANNING with 0 tasks is hard deleted

Mock: PrismaService ($transaction, sprint, task, project), EventEmitter2

## Step 1.5: Run all backend tests

- [ ] `cd apps/api && npx jest` — all tests pass
- [ ] Verify: 96+ tests, 0 failures
