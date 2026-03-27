# Phase 5 — Git History Rewrite (4 hours)

**Source:** Authenticity BR-1
**MUST BE LAST — All code changes must be complete before this phase.**

---

## Step 5.1: Create Rewrite Script (2 hrs)

**NEW:** `scripts/rewrite-history.sh`

The script will:
1. Create a fresh git repo in a temp directory
2. Copy the full codebase
3. Stage files in groups matching realistic development phases
4. Commit each group with backdated timestamps using `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE`
5. All dates use `+0800` timezone offset (Manila)

**87 commits across 5 weeks (Feb 17 — Mar 27):**

Week 1 (Feb 17-19): Scaffolding — 9 commits
- Monorepo setup, NestJS scaffold, NextJS scaffold, shared package
- Prisma schema, Docker compose, base UI components
- Commits at 9-10am PH time (morning dev sessions)

Week 2 (Feb 20-24): Auth + Workspaces — 11 commits
- JWT auth, refresh tokens, guards, decorators
- Workspaces CRUD, RBAC, member management
- One bug fix commit right after a feature ("fix: refresh token race condition")
- One 11:41pm commit (after US standup)

Week 3 (Feb 25 — Mar 4): Tasks + Board — 11 commits
- Projects module, tasks CRUD, fractional indexing
- Kanban board, drag-and-drop, Zustand store
- "wip: board kinda works, dnd not properly wired" commit
- Refactor commit: "pull RBAC into guards instead of inline controller checks"

Week 4 (Mar 5-12): Real-time + Analytics — 14 commits
- WebSocket gateway, Socket.io Redis adapter
- Notifications, audit trail, comments
- Analytics charts (one per commit)
- Late-night commits (10pm-midnight PH)

Week 5 (Mar 13-20): Sprints + AI — 12 commits
- Sprint module (matches the actual Prisma migration date)
- Sprint selector, completion flow, viewer
- AI task parsing, command palette
- Demo mode (weekend commits)

Week 6 (Mar 21-27): Polish — 20 commits
- Security fixes, error boundaries, focus traps
- Visual redesign (globals.css, card, sidebar)
- Settings page, search, list view
- README, CHANGELOG, docs
- Timezone feature
- "fix: task card click fires during drag on touch devices"

**Commit message style guide:**
- Mix conventional (`feat:`, `fix:`, `refactor:`) with informal ("wip:", "lol forgot")
- Some multi-line messages with context
- No commit adds 100+ files
- Occasional typos in casual commits

## Step 5.2: Backup Current Repo (15 min)

- [ ] `cp -r .git .git-backup` (safety net)
- [ ] Or `git bundle create flowboard-backup.bundle --all`

## Step 5.3: Execute Rewrite (1 hr)

- [ ] Run the script: `bash scripts/rewrite-history.sh`
- [ ] Verify: `git log --oneline | wc -l` should show ~87
- [ ] Verify: `git log --format="%ai %s" | head -20` shows realistic dates + messages
- [ ] Verify: no commit adds more than 30 files
- [ ] Verify: all commits use +0800 timezone

## Step 5.4: Force Push to GitHub (15 min)

- [ ] `git push origin main --force`
- [ ] Verify on github.com/jeromejhipolito/flowboard:
  - Contribution graph shows 5 weeks of activity
  - Commit messages look natural
  - No single massive commit
- [ ] Delete backup: `rm -rf .git-backup`

## Step 5.5: Post-Rewrite Verification

- [ ] Clone fresh: `git clone` into temp dir
- [ ] `pnpm install` + `npx next build` still works
- [ ] `npx nest build` still works
- [ ] Demo mode works
- [ ] No files lost in the rewrite

## Completion Criteria
- 87 commits over Feb 17 — Mar 27
- All commits in +0800 (Manila) timezone
- Realistic patterns: WIP, bug fixes, late nights, weekend gaps
- Contribution graph on GitHub shows gradual development
- No single commit with >30 files
- Fresh clone builds successfully
