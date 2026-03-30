# Phase 3 — Guards + DTO Tests (40 tests)

**Duration:** 0.5 day | **Priority:** P1

---

## Step 3.1: Expand workspace-member.guard.spec.ts (+6 tests, 10 total)

- [ ] Uses params.workspaceId when params.id absent
- [ ] Sets request.workspaceMembership on success
- [ ] Returns false when both params absent
- [ ] Works with valid CUID (skips slug resolution)
- [ ] Returns false when user absent entirely
- [ ] Uses composite key userId_workspaceId for lookup

## Step 3.2: Create project-member.guard.spec.ts (12 tests)

- [ ] Returns false when user is null
- [ ] Strategy 1: resolves projectId from params.projectId
- [ ] Strategy 2: resolves via params.sprintId → sprint → projectId
- [ ] Strategy 2: throws NotFoundException when sprint not found
- [ ] Strategy 3: resolves via params.taskId → task → projectId
- [ ] Strategy 4a: resolves via params.id as task
- [ ] Strategy 4b: falls back to comment lookup
- [ ] Strategy 4: throws NotFoundException when neither found
- [ ] Throws NotFoundException when project not found
- [ ] Throws ForbiddenException when user not workspace member
- [ ] Sets request.workspaceMembership on success

## Step 3.3: Create roles.guard.spec.ts (8 tests)

- [ ] Returns true when no @Roles() metadata
- [ ] Returns false when workspaceMembership absent
- [ ] OWNER passes ADMIN check (hierarchy)
- [ ] ADMIN passes MEMBER check
- [ ] VIEWER fails MEMBER check
- [ ] MEMBER fails ADMIN check
- [ ] OWNER passes OWNER check
- [ ] Multiple roles uses minimum required level

## Step 3.4: DTO Validation Tests (10 tests)

**NEW:** `apps/api/src/common/dto-validation.spec.ts`

- [ ] RegisterDto — email must be valid, password min 8
- [ ] CreateTaskDto — title max 200, storyPoints >= 0
- [ ] CreateWorkspaceDto — name min 2 max 50
- [ ] InviteMemberDto — email valid format
- [ ] MoveTaskDto — position must be positive
- [ ] CreateSprintDto — name min 1 max 100

## Step 3.5: Run full backend suite

- [ ] `cd apps/api && npx jest` — 256 tests, 0 failures
