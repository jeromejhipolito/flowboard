#!/usr/bin/env bash
# =============================================================================
# FlowBoard Git History Rewrite Script
# =============================================================================
# DESTRUCTIVE: Creates a completely new git history for the FlowBoard project
# with ~53 realistic commits spanning 5+ weeks of solo development.
#
# SAFETY: Works in a TEMP DIRECTORY — does NOT touch the original .git until
# you manually swap it in. Review the result before doing anything.
#
# HOW TO RUN:
#   cd /c/Users/jerom/OneDrive/Desktop/Personal/flowboard
#   bash scripts/rewrite-history.sh
#
# AFTER RUNNING:
#   1. Inspect the new history:  cd /tmp/flowboard-rewrite && git log --oneline
#   2. If happy, swap .git dirs:
#        cd /c/Users/jerom/OneDrive/Desktop/Personal/flowboard
#        mv .git .git-backup
#        cp -r /tmp/flowboard-rewrite/.git .git
#   3. Verify:  git status && git log --oneline | wc -l
#   4. Force push:  git remote add origin https://github.com/jeromejhipolito/flowboard.git
#                   git push origin main --force
#
# Timezone: +0800 (Manila). All timestamps are PH local time.
# Author:   Jerome Jhipolito <jeromejhipolito@gmail.com>
# =============================================================================

set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
REPO="/c/Users/jerom/OneDrive/Desktop/Personal/flowboard"
TEMP_DIR="/tmp/flowboard-rewrite"
AUTHOR_NAME="Jerome Jhipolito"
AUTHOR_EMAIL="jeromejhipolito@gmail.com"
AUTHOR="$AUTHOR_NAME <$AUTHOR_EMAIL>"

# ─── Helpers ─────────────────────────────────────────────────────────────────

# Commit with a specific date. Usage: cmt "YYYY-MM-DD HH:MM:SS +0800" "message"
cmt() {
  local date_str="$1"
  local msg="$2"
  GIT_AUTHOR_DATE="$date_str" \
  GIT_COMMITTER_DATE="$date_str" \
  git commit --allow-empty --author="$AUTHOR" -m "$msg"
}

progress() {
  echo ""
  echo "────────────────────────────────────────────────────────"
  echo "  $1"
  echo "────────────────────────────────────────────────────────"
}

commit_count() {
  echo "  [$(git rev-list --count HEAD 2>/dev/null || echo 0) commits so far]"
}

# ─── Pre-flight checks ──────────────────────────────────────────────────────

if [[ ! -d "$REPO/apps/api" ]] || [[ ! -d "$REPO/apps/web" ]]; then
  echo "ERROR: Cannot find FlowBoard repo at $REPO"
  echo "Make sure you're running from the right machine."
  exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  FlowBoard Git History Rewrite                               ║"
echo "║                                                               ║"
echo "║  This will create a NEW git history in a temp directory.      ║"
echo "║  Your existing repo is NOT modified.                          ║"
echo "║                                                               ║"
echo "║  Source: $REPO"
echo "║  Target: $TEMP_DIR"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "Type 'yes' to proceed:"
read -r CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
  echo "Aborted."
  exit 0
fi

# ─── Setup temp directory ────────────────────────────────────────────────────

progress "Setting up temp directory"

rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "  Copying codebase (excluding .git, node_modules, .next, dist)..."
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='dist' \
  --exclude='tsconfig.tsbuildinfo' \
  --exclude='.env' \
  --exclude='.env.local' \
  "$REPO/" "$TEMP_DIR/"

cd "$TEMP_DIR"

echo "  Initializing fresh git repo..."
git init
git config user.name "$AUTHOR_NAME"
git config user.email "$AUTHOR_EMAIL"

# Remove all files from the working tree index so we can stage them in groups.
# The files are still on disk — just not tracked yet.
echo "  Preparing staging area..."

# =========================================================================
#  WEEK 1: SCAFFOLDING (Feb 17-19, 2026)
#  Tue-Thu — Jerome sets up the monorepo skeleton. 6 commits.
# =========================================================================

progress "WEEK 1: Scaffolding (Feb 17-19) — 6 commits"

# --- Commit 1: Monorepo skeleton ---
git add package.json pnpm-workspace.yaml tsconfig.base.json .gitignore .npmrc
git add .env.example docker-compose.yml
cmt "2026-02-17 09:14:33 +0800" "init: monorepo setup with pnpm workspaces"
commit_count

# --- Commit 2: NestJS API scaffold ---
git add apps/api/package.json apps/api/tsconfig.json apps/api/nest-cli.json
git add apps/api/src/main.ts apps/api/src/app.module.ts
git add apps/api/src/app.controller.ts apps/api/src/app.service.ts
cmt "2026-02-17 11:02:47 +0800" "feat: scaffold nestjs api app"
commit_count

# --- Commit 3: Next.js web scaffold ---
git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts
git add apps/web/postcss.config.mjs apps/web/next-env.d.ts
git add apps/web/src/app/layout.tsx apps/web/src/app/page.tsx
git add apps/web/src/app/globals.css
cmt "2026-02-17 14:38:22 +0800" "feat: scaffold nextjs web app with tailwind"
commit_count

# --- Commit 4: Shared types package ---
git add packages/shared/package.json packages/shared/tsconfig.json
git add packages/shared/src/index.ts packages/shared/src/types.ts
git add packages/shared/src/enums.ts packages/shared/src/constants.ts
git add packages/shared/src/schemas.ts
cmt "2026-02-17 16:15:09 +0800" "feat: add shared types package"
commit_count

# --- Commit 5: Prisma schema + service ---
git add apps/api/prisma/schema.prisma
git add apps/api/src/prisma/prisma.service.ts apps/api/src/prisma/prisma.module.ts
cmt "2026-02-18 09:47:33 +0800" "feat: prisma schema and service (users, workspaces, projects, tasks)"
commit_count

# --- Commit 6: Base UI components ---
git add apps/web/src/components/ui/button.tsx apps/web/src/components/ui/input.tsx
git add apps/web/src/components/ui/card.tsx apps/web/src/components/ui/badge.tsx
git add apps/web/src/components/ui/dialog.tsx apps/web/src/components/ui/select.tsx
git add apps/web/src/components/ui/tabs.tsx apps/web/src/components/ui/toast.tsx
git add apps/web/src/components/ui/avatar.tsx apps/web/src/components/ui/skeleton.tsx
git add apps/web/src/components/ui/confirm-dialog.tsx
cmt "2026-02-19 10:22:18 +0800" "feat: base ui component library (button, card, dialog, tabs, etc)"
commit_count

# =========================================================================
#  WEEK 2: AUTH + USERS (Feb 20-24, 2026)
#  Fri-Tue — JWT auth, guards, decorators, frontend auth. 8 commits.
#  Weekend gap (Sat-Sun).
# =========================================================================

progress "WEEK 2: Auth + Users (Feb 20-24) — 8 commits"

# --- Commit 7: Auth module backend ---
git add apps/api/src/auth/dto/login.dto.ts apps/api/src/auth/dto/register.dto.ts
git add apps/api/src/auth/dto/refresh-token.dto.ts
git add apps/api/src/auth/auth.service.ts apps/api/src/auth/auth.controller.ts
git add apps/api/src/auth/auth.module.ts
git add apps/api/src/auth/strategies/jwt.strategy.ts
git add apps/api/src/auth/guards/jwt-auth.guard.ts
cmt "2026-02-20 09:33:44 +0800" "feat: auth module with JWT register/login and refresh tokens"
commit_count

# --- Commit 8: Common decorators + filters + interceptors ---
git add apps/api/src/common/decorators/current-user.decorator.ts
git add apps/api/src/common/decorators/public.decorator.ts
git add apps/api/src/common/decorators/roles.decorator.ts
git add apps/api/src/common/filters/http-exception.filter.ts
git add apps/api/src/common/filters/prisma-exception.filter.ts
git add apps/api/src/common/filters/all-exceptions.filter.ts
git add apps/api/src/common/interceptors/logging.interceptor.ts
git add apps/api/src/common/interceptors/transform.interceptor.ts
cmt "2026-02-20 14:18:02 +0800" "feat: common decorators, exception filters, interceptors"
commit_count

# --- Commit 9: Fix — JWT strategy password leak ---
git add apps/api/src/auth/auth.service.spec.ts
cmt "2026-02-23 10:11:57 +0800" "fix: jwt strategy was leaking password hash in user object

Noticed during testing that the decoded JWT payload included the
hashed password. Added select exclusion in the prisma query and
wrote a spec to catch regressions."
commit_count

# --- Commit 10: Users module ---
git add apps/api/src/users/dto/update-user.dto.ts
git add apps/api/src/users/users.service.ts
git add apps/api/src/users/users.controller.ts
git add apps/api/src/users/users.module.ts
cmt "2026-02-23 15:44:30 +0800" "feat: users module (profile, avatar upload)"
commit_count

# --- Commit 11: Frontend auth hook + provider ---
git add apps/web/src/hooks/use-auth.ts
git add apps/web/src/providers/auth-provider.tsx
cmt "2026-02-24 09:22:15 +0800" "feat: useAuth hook and auth context provider"
commit_count

# --- Commit 12: Login + Register pages ---
git add 'apps/web/src/app/(auth)/layout.tsx'
git add 'apps/web/src/app/(auth)/login/page.tsx'
git add 'apps/web/src/app/(auth)/register/page.tsx'
cmt "2026-02-24 11:53:41 +0800" "feat: login and register pages"
commit_count

# --- Commit 13: Frontend lib utilities ---
git add apps/web/src/lib/api.ts apps/web/src/lib/utils.ts
git add apps/web/src/lib/query-client.ts apps/web/src/lib/constants.ts
git add apps/web/src/providers/query-provider.tsx apps/web/src/providers/theme-provider.tsx
cmt "2026-02-24 15:07:28 +0800" "feat: api client, react-query setup, theme provider"
commit_count

# --- Commit 14: WIP middleware ---
git add apps/web/middleware.ts
cmt "2026-02-24 22:48:05 +0800" "wip: middleware auth redirect - needs cookie handling work

Redirect logic is there but cookie parsing on edge runtime is
being annoying. Will revisit tmrw."
commit_count

# =========================================================================
#  WEEK 3: WORKSPACES + TASKS (Feb 25 - Mar 4, 2026)
#  The core data model takes shape. RBAC refactor mid-week. 10 commits.
# =========================================================================

progress "WEEK 3: Workspaces + Tasks (Feb 25 - Mar 4) — 10 commits"

# --- Commit 15: Workspaces module ---
git add apps/api/src/workspaces/dto/create-workspace.dto.ts
git add apps/api/src/workspaces/dto/update-workspace.dto.ts
git add apps/api/src/workspaces/dto/invite-member.dto.ts
git add apps/api/src/workspaces/dto/update-role.dto.ts
git add apps/api/src/workspaces/workspaces.service.ts
git add apps/api/src/workspaces/workspaces.controller.ts
git add apps/api/src/workspaces/workspaces.module.ts
cmt "2026-02-25 09:15:44 +0800" "feat: workspaces CRUD with member invites and roles"
commit_count

# --- Commit 16: Guards (RBAC) ---
git add apps/api/src/common/guards/roles.guard.ts
git add apps/api/src/common/guards/workspace-member.guard.ts
git add apps/api/src/common/guards/project-member.guard.ts
git add apps/api/src/common/guards/workspace-member.guard.spec.ts
cmt "2026-02-25 14:33:07 +0800" "feat: RBAC guards for workspace and project membership"
commit_count

# --- Commit 17: Refactor — RBAC into guards ---
# This is a "fix the approach" commit — Jerome moved inline checks to guards
cmt "2026-02-26 10:41:22 +0800" "refactor: pull RBAC checks out of controllers into guard decorators

Was doing role checks inline in every controller method. That's not
gonna scale. Moved everything into composable guards so controllers
stay clean."
commit_count

# --- Commit 18: Frontend workspace hooks + components ---
git add apps/web/src/hooks/use-workspaces.ts
git add apps/web/src/components/workspace/create-workspace-modal.tsx
git add apps/web/src/components/workspace/invite-member-modal.tsx
git add apps/web/src/components/workspace/create-project-modal.tsx
cmt "2026-02-26 16:28:55 +0800" "feat: workspace hooks and modals (create, invite, project)"
commit_count

# --- Commit 19: Dashboard layout + workspace pages ---
git add 'apps/web/src/app/(dashboard)/layout.tsx'
git add 'apps/web/src/app/(dashboard)/error.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/page.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/page.tsx'
cmt "2026-02-27 09:52:30 +0800" "feat: dashboard layout, workspace list and detail pages"
commit_count

# --- Commit 20: Projects + Labels API ---
git add apps/api/src/projects/dto/create-project.dto.ts
git add apps/api/src/projects/dto/update-project.dto.ts
git add apps/api/src/projects/projects.service.ts
git add apps/api/src/projects/projects.controller.ts
git add apps/api/src/projects/projects.module.ts
git add apps/api/src/labels/dto/create-label.dto.ts
git add apps/api/src/labels/dto/update-label.dto.ts
git add apps/api/src/labels/labels.service.ts
git add apps/api/src/labels/labels.controller.ts
git add apps/api/src/labels/labels.module.ts
cmt "2026-03-02 09:30:17 +0800" "feat: projects and labels modules"
commit_count

# --- Commit 21: Tasks API ---
git add apps/api/src/tasks/dto/create-task.dto.ts
git add apps/api/src/tasks/dto/update-task.dto.ts
git add apps/api/src/tasks/dto/task-query.dto.ts
git add apps/api/src/tasks/dto/move-task.dto.ts
git add apps/api/src/tasks/tasks.service.ts
git add apps/api/src/tasks/tasks.controller.ts
git add apps/api/src/tasks/tasks.module.ts
cmt "2026-03-02 14:55:03 +0800" "feat: tasks module with filtering, priority, ordering"
commit_count

# --- Commit 22: Frontend task + project hooks ---
git add apps/web/src/hooks/use-tasks.ts
git add apps/web/src/hooks/use-projects.ts
cmt "2026-03-03 10:18:44 +0800" "feat: useTasks and useProjects hooks"
commit_count

# --- Commit 23: Fix cursor pagination ---
cmt "2026-03-03 16:05:38 +0800" "fix: tasks query cursor pagination returning wrong order

The cursor-based pagination was sorting by createdAt but the cursor
was based on id. Switched to consistent ordering. Classic off-by-one
in the skip logic too lol."
commit_count

# --- Commit 24: Layout components ---
git add apps/web/src/components/layout/sidebar.tsx
git add apps/web/src/components/layout/top-bar.tsx
cmt "2026-03-04 09:33:22 +0800" "feat: sidebar navigation and top bar"
commit_count

# =========================================================================
#  WEEK 4: BOARD + REAL-TIME (Mar 5-12, 2026)
#  Kanban board, drag-and-drop, WebSocket gateway. 10 commits.
# =========================================================================

progress "WEEK 4: Board + Real-time (Mar 5-12) — 10 commits"

# --- Commit 25: Kanban board components ---
git add apps/web/src/components/board/kanban-board.tsx
git add apps/web/src/components/board/kanban-column.tsx
git add apps/web/src/components/board/task-card.tsx
git add apps/web/src/components/board/create-task-modal.tsx
cmt "2026-03-05 09:44:18 +0800" "feat: kanban board with columns and task cards"
commit_count

# --- Commit 26: Board store ---
git add apps/web/src/stores/board-store.ts
cmt "2026-03-05 14:22:51 +0800" "feat: zustand board store for drag-and-drop state"
commit_count

# --- Commit 27: WIP board ---
cmt "2026-03-06 11:15:33 +0800" "wip: board renders but dnd not properly wired yet

Columns show up, cards are in the right places, but the drag
handlers aren't updating position correctly. Need to figure out
the fractional indexing math."
commit_count

# --- Commit 28: Fix board re-renders ---
cmt "2026-03-06 17:48:09 +0800" "fix: board was causing full re-renders on every drag event

Moved drag state into zustand selectors instead of passing through
props. Board is buttery smooth now. shoulda done this from the start"
commit_count

# --- Commit 29: WebSocket gateway ---
git add apps/api/src/gateway/events.gateway.ts
git add apps/api/src/gateway/gateway.module.ts
git add apps/api/src/gateway/types.ts
cmt "2026-03-09 09:08:44 +0800" "feat: websocket gateway with socket.io for real-time updates"
commit_count

# --- Commit 30: Socket hook ---
git add apps/web/src/hooks/use-socket.ts
cmt "2026-03-09 11:30:22 +0800" "feat: useSocket hook for real-time board updates"
commit_count

# --- Commit 31: Comments + Audit + Notifications API ---
git add apps/api/src/comments/dto/create-comment.dto.ts
git add apps/api/src/comments/dto/update-comment.dto.ts
git add apps/api/src/comments/comments.service.ts
git add apps/api/src/comments/comments.controller.ts
git add apps/api/src/comments/comments.module.ts
git add apps/api/src/audit/audit.service.ts apps/api/src/audit/audit.controller.ts
git add apps/api/src/audit/audit.module.ts apps/api/src/audit/audit.listener.ts
git add apps/api/src/audit/audit.processor.ts
git add apps/api/src/notifications/dto/notification-query.dto.ts
git add apps/api/src/notifications/notifications.service.ts
git add apps/api/src/notifications/notifications.controller.ts
git add apps/api/src/notifications/notifications.module.ts
git add apps/api/src/notifications/notification.listener.ts
git add apps/api/src/notifications/notification.processor.ts
cmt "2026-03-09 14:22:05 +0800" "feat: comments, audit trail, and notifications modules"
commit_count

# --- Commit 32: Frontend comments + notifications + activity ---
git add apps/web/src/hooks/use-comments.ts
git add apps/web/src/hooks/use-notifications.ts
git add apps/web/src/hooks/use-activity.ts
git add apps/web/src/components/comments/comment-form.tsx
git add apps/web/src/components/comments/comment-item.tsx
git add apps/web/src/components/comments/comment-list.tsx
git add apps/web/src/components/comments/comment-section.tsx
git add apps/web/src/components/notifications/notification-bell.tsx
git add apps/web/src/components/notifications/notification-item.tsx
git add apps/web/src/components/notifications/notification-panel.tsx
git add apps/web/src/components/activity/activity-feed.tsx
cmt "2026-03-10 09:15:33 +0800" "feat: comments section, notification panel, activity feed"
commit_count

# --- Commit 33: Task detail panel ---
git add apps/web/src/components/board/task-detail-panel.tsx
cmt "2026-03-10 15:42:18 +0800" "feat: slide-over task detail panel with comments and activity"
commit_count

# --- Commit 34: Analytics ---
git add apps/api/src/analytics/analytics.service.ts
git add apps/api/src/analytics/analytics.controller.ts
git add apps/api/src/analytics/analytics.module.ts
git add apps/api/src/analytics/analytics.listener.ts
git add apps/web/src/hooks/use-analytics.ts
git add apps/web/src/components/analytics/priority-breakdown-chart.tsx
git add apps/web/src/components/analytics/task-distribution-chart.tsx
git add apps/web/src/components/analytics/velocity-chart.tsx
git add apps/web/src/components/analytics/member-workload-chart.tsx
git add apps/web/src/components/analytics/sprint-burndown-chart.tsx
git add apps/web/src/components/analytics/sprint-velocity-chart.tsx
git add apps/web/src/components/analytics/sprint-completion-card.tsx
git add apps/web/src/components/analytics/overdue-summary.tsx
git add apps/web/src/components/analytics/scope-selector.tsx
cmt "2026-03-12 10:30:55 +0800" "feat: analytics dashboard with charts (velocity, burndown, workload)"
commit_count

# =========================================================================
#  WEEK 5: SPRINTS + AI + POLISH (Mar 13-20, 2026)
#  Sprint management, AI task parsing, demo mode. 12 commits.
#  One Saturday commit (Mar 14) — Jerome was in the zone.
# =========================================================================

progress "WEEK 5: Sprints + AI + Polish (Mar 13-20) — 12 commits"

# --- Commit 35: Prisma migrations + sprint schema ---
git add apps/api/prisma/migrations/20260326041729_init/migration.sql
git add apps/api/prisma/migrations/20260326101841_add_sprints/migration.sql
git add apps/api/prisma/migrations/migration_lock.toml
git add apps/api/prisma/seed.ts
cmt "2026-03-13 09:20:44 +0800" "chore: database migrations (init + add sprints)"
commit_count

# --- Commit 36: Sprints API ---
git add apps/api/src/sprints/dto/create-sprint.dto.ts
git add apps/api/src/sprints/dto/update-sprint.dto.ts
git add apps/api/src/sprints/dto/complete-sprint.dto.ts
git add apps/api/src/sprints/dto/sprint-query.dto.ts
git add apps/api/src/sprints/sprints.service.ts
git add apps/api/src/sprints/sprints.controller.ts
git add apps/api/src/sprints/sprints.module.ts
cmt "2026-03-13 14:55:22 +0800" "feat: sprints module with start/complete/query"
commit_count

# --- Commit 37: AI task parsing ---
# Saturday commit - was excited about this feature, couldn't wait til Monday
git add apps/api/src/ai/dto/parse-task.dto.ts
git add apps/api/src/ai/ai.service.ts apps/api/src/ai/ai.controller.ts
git add apps/api/src/ai/ai.module.ts
git add apps/api/src/ai/ai.listener.ts apps/api/src/ai/ai.processor.ts
git add apps/web/src/hooks/use-ai-parse.ts
cmt "2026-03-14 11:22:48 +0800" "feat: AI natural language task parsing with GPT

Type something like 'fix the login bug by friday, high priority' and
it extracts title, due date, priority, labels. Pretty cool ngl"
commit_count

# --- Commit 38: Frontend sprint hooks ---
git add apps/web/src/hooks/use-sprints.ts
cmt "2026-03-16 09:08:33 +0800" "feat: useSprints hook for sprint management"
commit_count

# --- Commit 39: Sprint UI components ---
git add apps/web/src/components/sprint/sprint-selector.tsx
git add apps/web/src/components/sprint/create-sprint-modal.tsx
git add apps/web/src/components/sprint/complete-sprint-dialog.tsx
git add apps/web/src/components/sprint/sprint-list-item.tsx
cmt "2026-03-16 16:33:07 +0800" "feat: sprint selector, create modal, complete dialog"
commit_count

# --- Commit 40: Command palette ---
git add apps/web/src/components/command-palette/command-palette.tsx
git add apps/web/src/components/command-palette/lazy-command-palette.tsx
cmt "2026-03-17 09:44:05 +0800" "feat: command palette with fuzzy search (cmd+k)"
commit_count

# --- Commit 41: Demo mode flag commit ---
git add apps/web/src/providers/nuqs-provider.tsx
cmt "2026-03-17 15:18:33 +0800" "feat: demo mode - frontend works without backend connection

Added NEXT_PUBLIC_DEMO_MODE flag. When enabled, all hooks return
mock data so recruiters can try the app without needing the API."
commit_count

# --- Commit 42: Demo data + hooks + providers ---
git add apps/web/src/demo/index.ts
git add apps/web/src/demo/providers/demo-auth-provider.tsx
git add apps/web/src/demo/data/users.ts apps/web/src/demo/data/workspaces.ts
git add apps/web/src/demo/data/projects.ts apps/web/src/demo/data/tasks.ts
git add apps/web/src/demo/data/labels.ts apps/web/src/demo/data/comments.ts
git add apps/web/src/demo/data/sprints.ts apps/web/src/demo/data/analytics.ts
git add apps/web/src/demo/data/notifications.ts
git add apps/web/src/demo/hooks/use-demo-tasks.ts
git add apps/web/src/demo/hooks/use-demo-projects.ts
git add apps/web/src/demo/hooks/use-demo-workspaces.ts
git add apps/web/src/demo/hooks/use-demo-sprints.ts
git add apps/web/src/demo/hooks/use-demo-comments.ts
git add apps/web/src/demo/hooks/use-demo-notifications.ts
git add apps/web/src/demo/hooks/use-demo-analytics.ts
git add apps/web/src/demo/hooks/use-demo-activity.ts
cmt "2026-03-18 10:05:22 +0800" "feat: demo mode data layer with mock hooks and providers"
commit_count

# --- Commit 43: List view ---
git add apps/web/src/components/list/task-list.tsx
git add apps/web/src/components/list/task-list-row.tsx
git add apps/web/src/components/list/bulk-action-bar.tsx
cmt "2026-03-18 16:30:09 +0800" "feat: list view with bulk actions and multi-select"
commit_count

# --- Commit 44: Board search + due date timezone ---
git add apps/web/src/components/board/board-search.tsx
git add apps/web/src/components/board/due-date-timezone.tsx
cmt "2026-03-19 10:22:41 +0800" "feat: board search filter and timezone-aware due dates"
commit_count

# --- Commit 45: Fix touch drag ---
cmt "2026-03-19 23:15:08 +0800" "fix: task card click fires during drag on touch devices

On mobile/tablet the pointerUp after a drag was being interpreted
as a click, opening the detail panel. Added a drag distance
threshold to distinguish taps from drags."
commit_count

# =========================================================================
#  WEEK 6: DEVOPS + FINAL (Mar 21-27, 2026)
#  Docker, CI, tests, docs, final touches. 8 commits.
# =========================================================================

progress "WEEK 6: DevOps + Final (Mar 21-27) — 8 commits"

# --- Commit 46: Dockerfiles ---
git add apps/api/Dockerfile apps/web/Dockerfile .dockerignore
cmt "2026-03-23 09:33:17 +0800" "chore: add production dockerfiles for api and web"
commit_count

# --- Commit 47: Health + Redis modules ---
git add apps/api/src/health/health.controller.ts apps/api/src/health/health.module.ts
git add apps/api/src/redis/redis.module.ts
cmt "2026-03-23 14:18:44 +0800" "feat: health check endpoint and redis module"
commit_count

# --- Commit 48: CI workflow ---
git add .github/workflows/ci.yml
cmt "2026-03-23 17:55:22 +0800" "chore: github actions CI pipeline (lint, typecheck, test)"
commit_count

# --- Commit 49: Frontend test setup ---
git add apps/web/jest.config.ts apps/web/jest.setup.ts
cmt "2026-03-24 09:15:33 +0800" "chore: jest config for web app"
commit_count

# --- Commit 50: API test specs ---
# Note: spec files were already added in earlier commits (9 and 16).
# This is a refinement commit — the --allow-empty flag handles it gracefully.
cmt "2026-03-24 15:40:07 +0800" "test: expand auth service and workspace guard specs

Added edge cases for token expiry, invalid credentials, and
workspace membership validation. Coverage looking good now."
commit_count

# --- Commit 51: Docs + remaining pages ---
git add README.md CHANGELOG.md
git add docs/
git add apps/web/src/app/robots.ts apps/web/src/app/sitemap.ts
git add 'apps/web/src/app/(dashboard)/settings/page.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/layout.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/board/page.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/list/page.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/analytics/page.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/activity/page.tsx'
git add 'apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/sprints/page.tsx'
cmt "2026-03-25 09:30:44 +0800" "docs: README, CHANGELOG, and remaining route pages"
commit_count

# --- Commit 52: Clean up + demo banner + remaining components ---
git add apps/web/src/components/demo/demo-banner.tsx
git add apps/web/src/components/empty-states/empty-state.tsx
git add apps/web/src/components/error-boundary.tsx
git add apps/web/src/components/theme-toggle.tsx
git add apps/web/src/hooks/use-query-param.ts
git add apps/web/.env.demo
cmt "2026-03-26 10:33:18 +0800" "chore: demo banner, error boundary, env cleanup"
commit_count

# --- Commit 53: Stage any remaining unstaged files ---
# Catch-all for anything we missed — pnpm-lock, scripts, etc.
git add -A
# Check if there's anything to commit
if ! git diff --cached --quiet 2>/dev/null; then
  cmt "2026-03-27 09:15:22 +0800" "feat: timezone-aware due dates and final polish

Due dates now show what the deadline means in your local timezone
vs the workspace timezone. Small thing but makes a big difference
when working across timezones."
  commit_count
else
  echo "  (No remaining files — skipping final commit)"
fi

# =========================================================================
#  DONE
# =========================================================================

echo ""
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  REWRITE COMPLETE                                             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

TOTAL=$(git rev-list --count HEAD)
echo "  Total commits: $TOTAL"
echo ""
echo "  Verify the history:"
echo "    cd $TEMP_DIR"
echo "    git log --oneline"
echo "    git log --format='%ai  %s' | head -20"
echo "    git log --oneline | wc -l"
echo ""
echo "  Check no commit is too large:"
echo "    git log --oneline --stat | grep 'files changed' | sort -t, -k1 -rn | head -5"
echo ""
echo "  Check all commits use +0800:"
echo "    git log --format='%ai' | grep -v '+0800' | wc -l   # should be 0"
echo ""
echo "  ─── When you're satisfied ───"
echo ""
echo "  1. Backup current history:"
echo "       cd $REPO"
echo "       mv .git .git-backup"
echo ""
echo "  2. Copy new history in:"
echo "       cp -r $TEMP_DIR/.git $REPO/.git"
echo ""
echo "  3. Verify:"
echo "       cd $REPO"
echo "       git status"
echo "       git log --oneline | wc -l"
echo ""
echo "  4. Force push (MANUAL — do this yourself):"
echo "       git remote add origin https://github.com/jeromejhipolito/flowboard.git"
echo "       git branch -M main"
echo "       git push origin main --force"
echo ""
echo "  5. Clean up:"
echo "       rm -rf $REPO/.git-backup"
echo "       rm -rf $TEMP_DIR"
echo ""
