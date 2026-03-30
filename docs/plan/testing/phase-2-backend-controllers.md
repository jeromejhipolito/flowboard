# Phase 2 — Backend Controller Tests (120 tests)

**Duration:** 1.5 days | **Priority:** P0

---

## Step 2.1: auth.controller.spec.ts (14 tests)

- [ ] register — calls authService.register(dto) and sets refresh_token cookie
- [ ] register — returns { accessToken, user } without refreshToken in body
- [ ] register — response does not include password
- [ ] login — sets cookie with httpOnly: true
- [ ] login — returns HTTP 200 (not 201)
- [ ] refresh — throws UnauthorizedException when no cookie
- [ ] refresh — rotates cookie with new refresh token
- [ ] logout — clears the refresh_token cookie
- [ ] me — returns @CurrentUser() user object
- [ ] register/login have @Public() (no JWT required)
- [ ] logout/me require JWT
- [ ] register throttled at 3/min
- [ ] login throttled at 5/min
- [ ] refresh throttled at 10/min

## Step 2.2: workspaces.controller.spec.ts (18 tests)

- [ ] POST /workspaces — calls create(userId, dto)
- [ ] GET /workspaces — calls findAllForUser(userId)
- [ ] GET /:id — requires WorkspaceMemberGuard
- [ ] PATCH /:id — requires RolesGuard + @Roles('ADMIN')
- [ ] DELETE /:id — requires @Roles('OWNER'), calls softDelete
- [ ] POST /:id/members — requires @Roles('ADMIN')
- [ ] GET /:id/members — requires WorkspaceMemberGuard only
- [ ] PATCH /:id/members/:userId — requires @Roles('OWNER')
- [ ] DELETE /:id/members/:userId — requires @Roles('ADMIN')
- [ ] VIEWER rejected on PATCH, MEMBER rejected on DELETE
- [ ] All auth-required endpoints return 401 without token

## Step 2.3: tasks.controller.spec.ts (16 tests)

- [ ] All endpoints apply ProjectMemberGuard at class level
- [ ] POST — passes projectId, userId, dto
- [ ] GET tasks — passes projectId + TaskQueryDto
- [ ] PATCH /move — rejects position <= 0 (IsPositive)
- [ ] PATCH /move — rejects invalid status enum
- [ ] POST tasks — rejects title > 200 chars
- [ ] POST tasks — rejects invalid priority/status enum
- [ ] Labels: POST/DELETE pass taskId + labelId
- [ ] All return 401 without token

## Step 2.4: sprints.controller.spec.ts (14 tests)

- [ ] All endpoints apply ProjectMemberGuard
- [ ] POST — calls create(projectId, dto)
- [ ] GET active — distinct from GET list
- [ ] POST start — calls start(sprintId)
- [ ] POST complete — calls complete(sprintId, dto)
- [ ] DELETE — calls delete (hard), not softDelete
- [ ] Route ordering: /active resolves before /:sprintId
- [ ] DTO validations: name required, max 100
- [ ] All return 401 without token

## Step 2.5: Remaining controllers (58 tests)

- [ ] projects.controller.spec.ts — 10 tests
- [ ] comments.controller.spec.ts — 10 tests
- [ ] labels.controller.spec.ts — 8 tests
- [ ] notifications.controller.spec.ts — 8 tests
- [ ] analytics.controller.spec.ts — 9 tests
- [ ] users.controller.spec.ts — 4 tests
- [ ] ai.controller.spec.ts — 5 tests
- [ ] health.controller.spec.ts — 4 tests

## Step 2.6: Run all backend tests

- [ ] `cd apps/api && npx jest` — 216+ tests pass (96 services + 120 controllers)
