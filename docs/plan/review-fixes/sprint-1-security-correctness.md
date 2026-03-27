# Sprint 1 — Security & Correctness (2-3 Days)

**Goal:** Harden auth, fix data model gaps, resolve correctness bugs.
**Flagged by:** Security (HIGH-1,2,3,4), CTO (#4,5), Backend (P1,P2), Data Analyst, QA

---

## Step 1.1: Move Refresh Token to HttpOnly Cookie (4 hrs)

**Files:** `auth.service.ts`, `auth.controller.ts`, `use-auth.ts`, `api.ts`
**Issue:** Refresh token in localStorage is XSS-accessible.
**Flagged by:** Security (CRIT-1), CTO, Frontend

- [ ] Backend: `auth.controller.ts` — on login/register, set refresh token as cookie:
  ```
  Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=604800
  ```
- [ ] Backend: `auth.controller.ts` — on refresh, read token from `req.cookies.refresh_token`
- [ ] Backend: `auth.controller.ts` — on logout, clear the cookie
- [ ] Backend: Install `cookie-parser` middleware in `main.ts`
- [ ] Frontend: `use-auth.ts` — remove localStorage for refreshToken
- [ ] Frontend: `use-auth.ts` — keep accessToken in memory (React state) only
- [ ] Frontend: `api.ts` — ensure `withCredentials: true` on all requests
- [ ] Frontend: remove `localStorage.getItem('refreshToken')` references

## Step 1.2: Create Shared Redis Module (2 hrs)

**Files:** New `src/redis/redis.module.ts`, modify `auth.service.ts`, `analytics.service.ts`
**Issue:** Multiple independent Redis clients created via `new Redis()` in constructors.
**Flagged by:** CTO (#4), Backend (P1)

- [ ] Create `src/redis/redis.module.ts` — @Global() module providing `REDIS_CLIENT` token
- [ ] Create `src/redis/redis.service.ts` — factory using ConfigService for REDIS_HOST/PORT
- [ ] Refactor `auth.service.ts` — inject `@Inject('REDIS_CLIENT')` instead of `new Redis()`
- [ ] Refactor `analytics.service.ts` — inject shared Redis client
- [ ] Remove `OnModuleDestroy` Redis cleanup from individual services (handled by module)
- [ ] Import `RedisModule` in `app.module.ts`

## Step 1.3: Add `completedAt` Field + Fix Velocity (3 hrs)

**Files:** `schema.prisma`, `tasks.service.ts`, `analytics.service.ts`
**Issue:** Velocity uses `updatedAt` as proxy — counts title edits as completions.
**Flagged by:** CTO (#5), Data Analyst (critical), QA

- [ ] Add `completedAt DateTime?` to Task model in `schema.prisma`
- [ ] Run `prisma migrate dev --name add-completed-at`
- [ ] In `tasks.service.ts` `moveTask()`:
  - If new status is `DONE`: set `completedAt = new Date()`
  - If moving OUT of `DONE`: clear `completedAt = null`
- [ ] In `tasks.service.ts` `update()`: same logic if status field changes
- [ ] Update `analytics.service.ts` velocity query:
  - Change `date_trunc('week', "updatedAt")` → `date_trunc('week', "completedAt")`
  - Add `WHERE "completedAt" IS NOT NULL` instead of `WHERE status = 'DONE'`
- [ ] Update seed script to set realistic `completedAt` on DONE tasks

## Step 1.4: Fix moveTask Rebalance Bug (2 hrs)

**File:** `apps/api/src/tasks/tasks.service.ts`
**Issue:** Rebalance assigns positions to other tasks but uses client-supplied position for moved task.
**Flagged by:** CTO, Backend (P1), QA (BUG-2)

- [ ] After rebalancing other tasks to 1.0, 2.0, 3.0...:
  - Find the intended position of the moved task in the sorted sequence
  - Insert it at the correct index and recalculate its position relative to neighbors
- [ ] Wrap the entire rebalance + move in a Prisma `$transaction`
- [ ] Add position validation: reject `NaN`, `Infinity`, negative values
- [ ] Update `move-task.dto.ts`: add `@IsPositive()` and `@IsFinite()` validators

## Step 1.5: Add Security Headers (30 min)

**File:** `apps/api/src/main.ts`
**Issue:** No security response headers.
**Flagged by:** Security (MED-5)

- [ ] Install `helmet`: `pnpm add helmet --filter @flowboard/api`
- [ ] Add `app.use(helmet())` in `main.ts` with CSP directives
- [ ] Fix WebSocket CORS from `origin: '*'` to env `CORS_ORIGIN` in `events.gateway.ts`

## Step 1.6: Add Global Exception Filter (1 hr)

**Files:** New `src/common/filters/all-exceptions.filter.ts`, `src/common/filters/prisma-exception.filter.ts`
**Issue:** Unhandled exceptions leak stack traces; Prisma P2002 returns raw 500.
**Flagged by:** CTO, Backend, QA (BUG-11)

- [ ] Create `AllExceptionsFilter` with `@Catch()` (no args) — catches everything
- [ ] Create `PrismaExceptionFilter` — maps P2002 → 409, P2025 → 404
- [ ] Register both as global filters in `main.ts`
- [ ] Sanitize error responses: never expose stack traces in production

## Step 1.7: Add Auth Rate Limiting (30 min)

**File:** `apps/api/src/auth/auth.controller.ts`
**Issue:** Global 100 req/60s too permissive for auth endpoints.
**Flagged by:** Security (HIGH-2), CTO

- [ ] Add `@Throttle({ default: { limit: 5, ttl: 60000 } })` on `login()`
- [ ] Add `@Throttle({ default: { limit: 10, ttl: 60000 } })` on `refresh()`
- [ ] Add `@Throttle({ default: { limit: 3, ttl: 60000 } })` on `register()`

## Completion Criteria
- Refresh token is HttpOnly cookie (not in localStorage)
- Single Redis client shared across all services
- `completedAt` field exists and velocity chart uses it
- Rebalance logic produces correct ordering under all cases
- Security headers present on all responses
- Prisma unique constraint → 409 (not 500)
- Auth endpoints have tighter rate limits
