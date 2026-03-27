# Phase 1 — Fix All Broken Features (BR-1, BR-2, BR-3, BR-6)

**Duration:** 2 hours | **Priority:** CRITICAL — Demo-blocking
**Note:** Frontend Engineer already implemented some fixes during the meeting. Verify and complete.

---

## Step 1.1: Create Project Modal (BR-1) — 45 min

**NEW file:** `apps/web/src/components/workspace/create-project-modal.tsx`
- [ ] Copy pattern from `create-workspace-modal.tsx`
- [ ] Props: `open`, `onOpenChange`, `workspaceId`
- [ ] Form fields: name (required, 2-100 chars), description (optional)
- [ ] Zod schema validation matching backend DTO
- [ ] Uses `useCreateProject()` mutation from `hooks/use-projects.ts`
- [ ] On success: toast, close modal, invalidate projects query
- [ ] On error: show error message, keep modal open

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/page.tsx`
- [ ] Import `CreateProjectModal` and `useProjects`
- [ ] Add state: `const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)`
- [ ] Wire BOTH "Create Project" buttons: `onClick={() => setCreateProjectModalOpen(true)}`
- [ ] Render `<CreateProjectModal>` in JSX with workspace.id
- [ ] Replace hardcoded empty state in Projects tab with real data:
  - Fetch: `const { data: projects } = useProjects(workspace?.id)`
  - Render project cards with name, description, task count, status badge
  - Each card links to `/workspaces/${slug}/projects/${project.id}/board`
  - Show empty state only when projects array is empty
- [ ] Add `useQueryState('action')` listener for command palette integration

## Step 1.2: Command Palette Integration (BR-2) — 30 min

**EDIT:** `apps/web/src/components/command-palette/command-palette.tsx`
- [ ] Import `useRouter` and `usePathname` from `next/navigation`
- [ ] Replace `window.dispatchEvent(new CustomEvent('flowboard:create-task'))` with:
  `router.push(\`/workspaces/${slug}/projects/${projectId}/board?action=create-task\`)`
- [ ] Replace `flowboard:create-project` dispatch with:
  `router.push(\`/workspaces/${slug}?tab=projects&action=create-project\`)`
- [ ] Replace `flowboard:create-workspace` dispatch with:
  `router.push('/workspaces?action=create-workspace')`
- [ ] Extract slug/projectId from current pathname using regex or split
- [ ] Close palette after navigation: `setOpen(false)`

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/page.tsx`
- [ ] Add `useQueryState('action')` from nuqs
- [ ] useEffect: if `action === 'create-workspace'`, open modal, clear action

**EDIT:** `apps/web/src/app/(dashboard)/workspaces/[slug]/projects/[projectId]/board/page.tsx`
- [ ] Add `useQueryState('action')` from nuqs
- [ ] useEffect: if `action === 'create-task'`, open CreateTaskModal, clear action

## Step 1.3: Theme Toggle Prominence (BR-3) — 15 min

**EDIT:** `apps/web/src/components/layout/top-bar.tsx`
- [ ] Import `ThemeToggle` from `@/components/theme-toggle`
- [ ] Add `<ThemeToggle />` next to the notification bell in the right section
- [ ] Remove `readOnly` from search input (BR-6)
- [ ] Add `onClick` on search input to open command palette

**EDIT:** `apps/web/src/components/layout/sidebar.tsx`
- [ ] Remove ThemeToggle from sidebar bottom (it's now in top bar)
- [ ] Remove the `border-t border-border p-4` wrapper div

**EDIT:** `apps/web/src/providers/theme-provider.tsx`
- [ ] Add explicit defaults: `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `storageKey="flowboard-theme"`

## Step 1.4: Search Input Fix (BR-6) — 5 min

Already covered in Step 1.3 (top-bar.tsx changes).

## Step 1.5: Verify All Fixes

- [ ] Login flow: login → redirects to /workspaces
- [ ] Workspace list: shows workspace cards
- [ ] Click workspace → detail page with tabs
- [ ] Projects tab: shows "Create Project" button → click → modal opens → submit → project appears
- [ ] Click project → board page with columns
- [ ] Create task on board → task appears
- [ ] Theme toggle: click → switches light/dark/system
- [ ] Search input: click → command palette opens
- [ ] Ctrl+K → command palette → "Create Task" → navigates and opens modal
- [ ] Ctrl+K → "Create Project" → navigates and opens modal

## Completion Criteria
- Create Project button works end-to-end
- Projects list shows real data from API
- Command palette actions navigate and trigger modals
- Theme toggle visible in top bar
- Search input opens command palette
- All above verified in browser
