# Phase 4 — Analytics Dashboard, Polish & Production Deploy

**Duration:** ~1.5 weeks
**Goal:** Data visualization, UX polish features, production-ready deployment

---

## Step 4.1: Analytics Endpoints (Backend)

- [ ] Create `AnalyticsModule`
- [ ] Endpoints (all scoped to project, require MEMBER+):
  - `GET /projects/:id/analytics/task-distribution`
    - Tasks grouped by status: `{ status, count }[]`
  - `GET /projects/:id/analytics/priority-breakdown`
    - Tasks grouped by priority: `{ priority, count }[]`
  - `GET /projects/:id/analytics/member-workload`
    - Tasks per assignee: `{ userId, name, avatarUrl, taskCount, completedCount }[]`
  - `GET /projects/:id/analytics/velocity`
    - Tasks completed per week (last 8 weeks): `{ week, completedCount }[]`
  - `GET /projects/:id/analytics/overdue`
    - Count of overdue tasks + list of top 5
- [ ] Add Redis caching on analytics endpoints (TTL: 5 min)
  - Cache key: `analytics:{projectId}:{endpoint}`
  - Invalidate on task mutations via event listener

## Step 4.2: Analytics Dashboard (Frontend)

- [ ] Create route: `app/(dashboard)/.../projects/[id]/analytics/page.tsx`
- [ ] Server Component shell with Suspense boundaries per widget
- [ ] Skeleton loaders matching exact chart shapes (no spinners)
- [ ] Charts (use Recharts):
  - **Task Distribution** — Donut chart with status colors
  - **Priority Breakdown** — Horizontal bar chart
  - **Team Workload** — Bar chart per member with avatar labels
  - **Velocity Trend** — Area chart (completed tasks/week over 8 weeks)
  - **Overdue Summary** — Stat card with count + task list
- [ ] Responsive grid layout: 2 columns on desktop, 1 on mobile
- [ ] Accessible color palettes (not relying on red/green alone)
- [ ] Charts animate on data load (stagger delays, 100ms between widgets)

## Step 4.3: Command Palette (Frontend)

- [ ] Install `cmdk` package
- [ ] Trigger: `Cmd+K` (Mac) / `Ctrl+K` (Windows)
- [ ] Features:
  - Search across: projects, tasks, members
  - Quick actions: "Create task", "Go to analytics", "Switch workspace"
  - Recent items section (last 5 visited)
  - Keyboard navigation: arrows to move, Enter to select, Escape to close
- [ ] Blur backdrop behind palette
- [ ] Fuzzy search using simple scoring (match start of word > match anywhere)
- [ ] Context-aware: if on a board, show tasks from that board first

## Step 4.4: Dark Mode (Frontend)

- [ ] Implement with `next-themes` provider
- [ ] Use CSS variables mapped to Tailwind's `dark:` variant
- [ ] Semantic color tokens (already set up in Phase 0 Tailwind config):
  - `--background`, `--foreground`, `--card`, `--border`, `--muted`, etc.
  - shadcn/ui handles most of this natively
- [ ] Toggle in settings + respect system preference by default
- [ ] Smooth transition (150ms on `background-color` and `color`)
- [ ] Verify all charts, badges, and custom components work in both modes

## Step 4.5: Empty States & Onboarding (Frontend)

- [ ] Design empty states for every list view:
  - No workspaces: illustration + "Create your first workspace" CTA
  - No projects: illustration + "Create your first project" CTA
  - Empty board: illustration + "Create your first task" CTA
  - No notifications: "You're all caught up" message
- [ ] First-time user flow:
  - After registration → guided workspace creation
  - After workspace creation → prompt to create first project
  - After project creation → prompt to create first task on board
- [ ] "Load demo data" button that seeds a realistic workspace (20+ tasks)

## Step 4.6: Performance & Quality Pass

- [ ] Bundle analysis: run `next build` with `ANALYZE=true`
  - Identify and code-split any oversized chunks
  - Lazy load: Recharts, TipTap editor, command palette
- [ ] Image optimization: all avatars use `next/image`
- [ ] Add error boundaries at route level (graceful error pages)
- [ ] Loading states: ensure every async boundary has a Suspense + skeleton
- [ ] Mobile responsive pass:
  - Sidebar collapses to hamburger menu
  - Board scrolls horizontally on mobile
  - Task detail panel goes full-screen on mobile
- [ ] Lighthouse audit: target 90+ on Performance, Accessibility, Best Practices

## Step 4.7: README & Documentation

- [ ] Write comprehensive README.md:
  - Project overview (what + why)
  - Screenshots/GIFs of key features (board, real-time, analytics)
  - Architecture diagram (module boundaries)
  - Tech stack table with justifications
  - "Key Decisions" section: WHY you chose each technology
  - Setup instructions (Docker Compose one-liner)
  - API documentation link (Swagger)
  - Future improvements (documented Phase 2 scope)
- [ ] Add OpenAPI/Swagger decorators to all endpoints
- [ ] Add architecture decision records (ADR) in `docs/decisions/`:
  - ADR-001: Why monorepo over separate repos
  - ADR-002: Why Prisma over TypeORM
  - ADR-003: Why fractional indexing for card ordering
  - ADR-004: Why Redis for refresh tokens

## Step 4.8: Production Deploy

- [ ] Finalize `Dockerfile` for API (multi-stage build)
- [ ] Environment variables documented and set in hosting platform
- [ ] Database: run migrations on production
- [ ] Redis: configure connection for production (TLS if required)
- [ ] Seed production DB with demo workspace (realistic data for viewers)
- [ ] Domain setup (optional): `flowboard.yourdomain.com`
- [ ] Verify full flow end-to-end on production:
  - Register → Create workspace → Invite member → Create project
  - Board: create tasks, drag-and-drop, real-time sync (2 tabs)
  - Notifications, comments, activity log
  - Analytics dashboard loads with data

## Completion Criteria
- Analytics dashboard renders all 5 chart types with real data
- Command palette works globally with keyboard shortcuts
- Dark mode toggles smoothly with no visual glitches
- Empty states exist for every zero-data scenario
- README tells the full story (screenshots, architecture, decisions)
- Production URL is live and demo-able
- Lighthouse scores: 90+ across all categories
- Two-tab real-time demo works flawlessly on production
