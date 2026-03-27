# Phase 3 — Testing Foundation (BR-5)

**Duration:** 3-4 hours | **Priority:** HIGH — Regression prevention

---

## Step 3.1: Frontend Test Infrastructure — 30 min

**EDIT:** `apps/web/package.json` — add devDependencies:
- [ ] jest, jest-environment-jsdom, @testing-library/react, @testing-library/user-event
- [ ] @testing-library/jest-dom, @types/jest, ts-jest
- [ ] Add scripts: `"test": "jest"`, `"test:watch": "jest --watch"`

**NEW:** `apps/web/jest.config.ts`
- [ ] testEnvironment: jest-environment-jsdom
- [ ] transform: ts-jest with jsx: react-jsx
- [ ] moduleNameMapper: `@/*` → `<rootDir>/src/$1`
- [ ] setupFilesAfterSetup: jest.setup.ts

**NEW:** `apps/web/jest.setup.ts`
- [ ] Import `@testing-library/jest-dom`

**Run:** `pnpm install` to install test deps

## Step 3.2: Backend Test Infrastructure — 15 min

**EDIT:** `apps/api/package.json`
- [ ] Add scripts: `"test": "jest"`, `"test:watch": "jest --watch"`
- [ ] Add jest config section (moduleFileExtensions, rootDir, testRegex, transform)
- [ ] Install: `pnpm add -D jest-mock-extended --filter @flowboard/api`

## Step 3.3: Backend Unit Tests — 60 min

**NEW:** `apps/api/src/auth/auth.service.spec.ts`
- [ ] Test: register throws ConflictException for duplicate email
- [ ] Test: register returns tokens + user without password
- [ ] Test: login throws UnauthorizedException for wrong email
- [ ] Test: login throws UnauthorizedException for wrong password
- [ ] Test: parseTtl('7d') returns 604800
- [ ] Test: parseTtl('15m') returns 900
- [ ] Test: parseTtl('invalid') defaults to 7 days

**NEW:** `apps/api/src/tasks/tasks.service.spec.ts`
- [ ] Test: moveTask sets completedAt when status → DONE
- [ ] Test: moveTask clears completedAt when status away from DONE
- [ ] Test: moveTask throws NotFoundException for bad task ID

**NEW:** `apps/api/src/common/guards/workspace-member.guard.spec.ts`
- [ ] Test: returns false when user is null
- [ ] Test: throws ForbiddenException when user not a member
- [ ] Test: resolves slug to ID before checking membership
- [ ] Test: throws ForbiddenException when slug doesn't exist

**Run:** `cd apps/api && pnpm test` — all must pass

## Step 3.4: Frontend Component Tests — 90 min

**NEW:** `apps/web/src/__tests__/workspace/create-project-button.test.tsx`
- [ ] Test: "Create Project" button renders for ADMIN users
- [ ] Test: clicking button opens CreateProjectModal
- [ ] Test: button not visible for VIEWER role

**NEW:** `apps/web/src/__tests__/board/kanban-board.test.tsx`
- [ ] Test: renders exactly 5 columns in correct order
- [ ] Test: passes tasks to correct column based on status

**NEW:** `apps/web/src/__tests__/providers/theme-provider.test.tsx`
- [ ] Test: renders children without crashing
- [ ] Test: applies class attribute strategy

**NEW:** `apps/web/src/__tests__/board/create-task-modal.test.tsx`
- [ ] Test: shows validation error when title empty
- [ ] Test: closes modal after successful creation

**Run:** `cd apps/web && pnpm test` — all must pass

## Step 3.5: Update CI Pipeline — 15 min

**EDIT:** `.github/workflows/ci.yml`
- [ ] Add test job after build:
  ```yaml
  test-api:
    - pnpm --filter @flowboard/api test
  test-web:
    - pnpm --filter @flowboard/web test
  ```
- [ ] Tests must pass before merge

## Step 3.6: Verify All Tests

- [ ] `cd apps/api && pnpm test` — all backend tests pass
- [ ] `cd apps/web && pnpm test` — all frontend tests pass
- [ ] No existing build broken

## Completion Criteria
- Jest configured for both frontend and backend
- 7+ backend unit tests passing
- 6+ frontend component tests passing
- CI pipeline runs tests on push
- Zero test failures
