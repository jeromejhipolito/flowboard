# Sprint 5 — Documentation, SEO & Growth (2-3 Days)

**Goal:** Portfolio polish, discoverability, interview-ready presentation.
**Flagged by:** Technical Writer (5.4), SEO Specialist (4.0), Growth Marketer (5.7)

---

## Step 5.1: WebSocket Event Reference Doc (2 hrs)

**File:** New `docs/websocket-events.md`
**Issue:** Most technically interesting feature is completely undocumented.
**Flagged by:** Technical Writer (#1 priority)

- [ ] Document each event:
  | Event | Direction | Payload | Trigger | Recipients |
  |-------|-----------|---------|---------|------------|
  | `joinBoard` | client→server | `{ projectId }` | Board page mount | N/A |
  | `leaveBoard` | client→server | `{ projectId }` | Board page unmount | N/A |
  | `task:created` | server→client | `{ taskId, projectId, data }` | Task created | Board room (excl. sender) |
  | `task:updated` | server→client | `{ taskId, projectId, data }` | Task updated | Board room (excl. sender) |
  | `task:moved` | server→client | `{ taskId, projectId, data }` | Task moved | Board room (excl. sender) |
  | `task:deleted` | server→client | `{ taskId, projectId }` | Task deleted | Board room (excl. sender) |
  | `notification:new` | server→client | `{ notification }` | Various triggers | User room |
- [ ] Include TypeScript interfaces for each payload
- [ ] Document room naming convention: `board:{projectId}`, `user:{userId}`
- [ ] Document auth: JWT passed via `handshake.auth.token`

## Step 5.2: Mermaid Architecture Diagram (2 hrs)

**File:** Embed in `README.md`
**Issue:** No visual architecture — the highest-signal missing element for senior roles.
**Flagged by:** Technical Writer (#2), Growth Marketer

- [ ] Create Mermaid sequence diagram for collaborative edit flow:
  ```mermaid
  sequenceDiagram
    Client A->>+API: PATCH /tasks/:id/move
    API->>DB: Update task position
    API->>EventEmitter: emit('task.moved')
    API-->>-Client A: 200 OK
    EventEmitter->>Gateway: @OnEvent('task.moved')
    Gateway->>Client B: socket.emit('task:moved')
    Client B->>Client B: Update TanStack Query cache
  ```
- [ ] Add module dependency diagram showing NestJS module relationships
- [ ] Add data flow diagram: Client → NextJS → NestJS → PostgreSQL/Redis
- [ ] Embed all diagrams in README under "Architecture" section

## Step 5.3: Complete Swagger Response DTOs (3 hrs)

**Files:** New response DTO files, modify all controllers
**Issue:** Only request DTOs documented — response shapes show `{}` in Swagger.
**Flagged by:** Technical Writer (#4), Backend

- [ ] Create response DTOs:
  - `UserResponseDto` (exclude password)
  - `WorkspaceResponseDto`, `WorkspaceMemberResponseDto`
  - `ProjectResponseDto`
  - `TaskResponseDto`, `TaskDetailResponseDto`
  - `NotificationResponseDto`
  - `ErrorResponseDto` (standard error shape)
- [ ] Add `@ApiResponse({ status: 200, type: XxxResponseDto })` to all endpoints
- [ ] Add `@ApiResponse({ status: 400/401/403/404/409 })` with descriptions
- [ ] Verify at `/api/docs`: all endpoints show complete request + response schemas

## Step 5.4: OG Tags + Social Meta + Sitemap (1 hr)

**Files:** Modify `apps/web/src/app/layout.tsx`, new `sitemap.ts`, `robots.ts`
**Issue:** No OG image, no sitemap, landing page invisible to search/social.
**Flagged by:** SEO Specialist (2/10 social sharing)

- [ ] Create static OG image (1200x630 PNG) in `apps/web/public/og-image.png`
- [ ] Update root `layout.tsx` metadata:
  ```ts
  openGraph: {
    title: "FlowBoard — Real-Time Collaborative Task Management",
    description: "Full-stack SaaS built with Next.js 15, NestJS, WebSockets, PostgreSQL",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" }
  ```
- [ ] Create `apps/web/src/app/sitemap.ts` — export landing page URL
- [ ] Create `apps/web/src/app/robots.ts` — allow `/`, disallow dashboard routes
- [ ] Add `noindex` meta to `/login` and `/register` pages

## Step 5.5: Annotated .env.example (30 min)

**File:** `.env.example`
**Issue:** Variable names only — no format docs, no required/optional marking.
**Flagged by:** Technical Writer (#5)

- [ ] Add comments above each variable:
  ```bash
  # Required. PostgreSQL connection string.
  # Format: postgresql://USER:PASS@HOST:PORT/DB
  DATABASE_URL=postgresql://flowboard:flowboard@localhost:5432/flowboard
  ```
- [ ] Mark each as Required or Optional
- [ ] Document consequences of wrong values

## Step 5.6: Fractional Indexing JSDoc (1 hr)

**File:** `apps/api/src/tasks/tasks.service.ts`
**Issue:** Highest-complexity algorithm has no comments.
**Flagged by:** Technical Writer (#3)

- [ ] Add JSDoc block above `moveTask()`:
  - Algorithm explanation + link to Figma engineering blog post
  - Time complexity: O(1) normal case, O(N) on rebalance
  - Edge cases: top/bottom of column, empty column, gap exhaustion
- [ ] Add inline comments on boundary condition branches
- [ ] Add JSDoc on position calculation helper functions

## Step 5.7: README Polish + GitHub Optimization (1 hr)

**Files:** `README.md`, GitHub repo settings
**Flagged by:** Growth Marketer, SEO Specialist

- [ ] Add 2-sentence hero statement at very top of README:
  > "FlowBoard is a real-time collaborative task management platform where
  > multiple users can drag, assign, and track tasks simultaneously with
  > instant sync. Built with Next.js 15, NestJS, WebSockets, and Redis."
- [ ] Add "Technical Highlights" section (3 bullets, above feature list)
- [ ] Add rejection language to Key Decisions ("Considered X, rejected because Y")
- [ ] Add "About the Developer" section at bottom with portfolio + contact link
- [ ] Set GitHub repo description + topics:
  `nextjs, nestjs, socket-io, redis, postgresql, kanban, real-time, rbac, typescript, ai`
- [ ] Add build status badge from GitHub Actions

## Step 5.8: Demo Data + Recording (2 hrs)

**Flagged by:** Growth Marketer, UX Designer

- [ ] Update seed script with richer demo data:
  - Realistic task titles (software team context)
  - Mix of priorities and statuses across all columns
  - Some overdue tasks, some with story points
  - `completedAt` set on DONE tasks for velocity chart
- [ ] Deploy to Railway with populated demo data
- [ ] Create two demo accounts: "Alice (Developer)" + "Bob (Manager)"
- [ ] Record 15-second looping GIF: two browser tabs, drag card, real-time sync
- [ ] Record 90-second full demo video: board → command palette → analytics → dark mode
- [ ] Add GIF to README and portfolio project card

## Completion Criteria
- WebSocket events fully documented with TypeScript interfaces
- Mermaid diagrams render in GitHub README
- Swagger shows complete request + response schemas for all endpoints
- OG image appears when sharing URL on LinkedIn/Twitter
- `.env.example` is self-documenting
- Fractional indexing has comprehensive JSDoc
- GitHub repo has topics, badges, and "About the Developer" section
- 15-second GIF shows real-time sync for portfolio
- Live demo accessible with two demo accounts
