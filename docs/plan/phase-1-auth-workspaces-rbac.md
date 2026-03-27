# Phase 1 — Authentication, Workspaces & RBAC

**Duration:** ~1.5 weeks
**Goal:** Complete auth system, workspace CRUD with invitations, role-based access control
**Deploy at end of this phase.**

---

## Step 1.1: Auth Module (Backend)

- [ ] Create `AuthModule` in NestJS
- [ ] Implement endpoints:
  - `POST /auth/register` — email, password (hashed bcrypt), firstName, lastName
  - `POST /auth/login` — returns accessToken (15min) + refreshToken (7d)
  - `POST /auth/refresh` — rotate refresh token, detect reuse (security)
  - `POST /auth/logout` — invalidate refresh token in Redis
- [ ] Store refresh tokens in Redis (not DB) with TTL
- [ ] Implement `JwtAuthGuard` (global guard, excludes public routes via `@Public()` decorator)
- [ ] Implement `@CurrentUser()` param decorator extracting user from JWT
- [ ] Add rate limiting on auth endpoints (`@nestjs/throttler`, 5 req/min)
- [ ] Validation: `ValidationPipe` globally with `whitelist: true`, `forbidNonWhitelisted: true`

## Step 1.2: User Module (Backend)

- [ ] Create `UsersModule`
- [ ] Endpoints:
  - `GET /users/me` — current user profile
  - `PATCH /users/me` — update profile (firstName, lastName, avatarUrl)
- [ ] User service: `findByEmail`, `findById`, `create`, `update`

## Step 1.3: Workspace Module (Backend)

- [ ] Create `WorkspacesModule`
- [ ] Endpoints:
  - `POST /workspaces` — create workspace (creator becomes OWNER)
  - `GET /workspaces` — list workspaces for current user
  - `GET /workspaces/:id` — workspace detail (members only)
  - `PATCH /workspaces/:id` — update name/description (OWNER/ADMIN only)
  - `DELETE /workspaces/:id` — soft delete (OWNER only)
- [ ] Implement `WorkspaceMemberGuard` — verifies current user is member of `:id`
- [ ] Auto-generate unique slug from workspace name

## Step 1.4: Workspace Membership & Invitations (Backend)

- [ ] Endpoints:
  - `POST /workspaces/:id/members` — invite user by email (OWNER/ADMIN)
  - `GET /workspaces/:id/members` — list members with roles
  - `PATCH /workspaces/:id/members/:userId` — change role (OWNER only)
  - `DELETE /workspaces/:id/members/:userId` — remove member (OWNER/ADMIN)
- [ ] Implement `RolesGuard` with `@Roles()` decorator
  - Check: route requires minimum role → compare against user's membership role
  - Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
- [ ] Prevent OWNER from removing themselves
- [ ] Prevent role escalation (ADMIN cannot make someone OWNER)

## Step 1.5: Response Standardization (Backend)

- [ ] Create `TransformInterceptor` — wrap all responses in `{ data, meta, timestamp }`
- [ ] Create `HttpExceptionFilter` — standardized error format `{ error, message, statusCode }`
- [ ] Create `LoggingInterceptor` — log request method, path, duration, status code

## Step 1.6: Auth Pages (Frontend)

- [ ] Create auth layout: `app/(auth)/layout.tsx` — centered card, no sidebar
- [ ] Pages:
  - `app/(auth)/login/page.tsx` — email + password form
  - `app/(auth)/register/page.tsx` — registration form with validation
- [ ] Use React Hook Form + Zod for client validation (mirror backend DTOs)
- [ ] Store tokens: accessToken in memory, refreshToken in httpOnly cookie
- [ ] Create auth context/provider with `useAuth()` hook
- [ ] Implement token refresh interceptor in API client (axios/fetch wrapper)

## Step 1.7: Dashboard Shell (Frontend)

- [ ] Create authenticated layout: `app/(dashboard)/layout.tsx`
  - Sidebar: workspace switcher, navigation links
  - Top bar: user avatar, notification bell (placeholder), settings
- [ ] `middleware.ts` — JWT validation, redirect unauthenticated users to `/login`
- [ ] Workspace list page: `app/(dashboard)/workspaces/page.tsx`
  - Card grid of user's workspaces
  - "Create Workspace" button → modal form
- [ ] Workspace detail: `app/(dashboard)/workspaces/[slug]/page.tsx`
  - Members list with role badges
  - "Invite Member" button → modal with email input + role select
  - Settings tab (rename, delete for OWNER)
- [ ] Use TanStack Query for all server state (`useQuery`, `useMutation`)

## Step 1.8: First Deploy

- [ ] Deploy API to Railway (connect PostgreSQL + Redis add-ons)
- [ ] Deploy Web to Vercel (set API URL env var)
- [ ] Verify: register → login → create workspace → invite → role check
- [ ] Run seed script on production DB for demo data

## Completion Criteria
- Full auth flow works (register, login, refresh, logout)
- Workspaces can be created, listed, updated, deleted
- Members can be invited with specific roles
- RBAC enforced: VIEWER cannot invite, MEMBER cannot change roles, etc.
- Live URL accessible — first demo-able version
