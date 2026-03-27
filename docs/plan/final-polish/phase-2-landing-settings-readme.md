# Phase 2 — Landing Page + Settings + README (5 hours)

**Sources:** Quality BR-2, BR-3, BR-7 + Authenticity BR-2

---

## Step 2.1: Landing Page — Screenshot + Try Demo + Features (1 hr)

**EDIT:** `apps/web/src/app/page.tsx`
- [ ] Add 3 feature chips below subtitle:
  ```tsx
  <div className="mt-6 flex flex-wrap justify-center gap-2">
    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">Real-Time Sync</span>
    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">Sprint Planning</span>
    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs">AI Task Parsing</span>
  </div>
  ```
- [ ] Add "Try Demo" button between Get Started and Sign In (outline style)
- [ ] Try Demo links to deployed demo URL or `/workspaces` with demo flag
- [ ] Add product screenshot below buttons:
  ```tsx
  <div className="mt-16 w-full max-w-4xl mx-auto">
    <div className="rounded-xl border border-border shadow-2xl overflow-hidden">
      <img src="/screenshot-board.png" alt="FlowBoard board" className="w-full" />
    </div>
  </div>
  ```
- [ ] Increase gradient blob opacity: `rgba(91,79,245,0.12)` → `rgba(91,79,245,0.18)`
- [ ] Make primary CTA larger: `h-12 px-10 text-base`
- [ ] Widen container: `max-w-3xl` → `max-w-5xl` when screenshot present

**NOTE:** Screenshot needs to be taken manually and saved to `apps/web/public/screenshot-board.png`. For now, use a placeholder div with text.

## Step 2.2: User Settings Page (2 hrs)

**NEW:** `apps/web/src/app/(dashboard)/settings/page.tsx`
- [ ] "use client" page with Suspense wrapper
- [ ] Uses `useAuth()` to get current user
- [ ] Form fields: firstName, lastName, email (read-only/disabled), avatarUrl
- [ ] Timezone picker: searchable select with common IANA values
- [ ] React Hook Form + Zod validation
- [ ] Submit calls `api.patch('/users/me', data)`
- [ ] Toast on success
- [ ] Card layout matching workspace settings pattern

**NEW:** `apps/web/src/hooks/use-user-settings.ts`
- [ ] `useUpdateProfile()` — useMutation PATCH /users/me
- [ ] Demo mode version: toast "Demo mode" + no-op

**EDIT:** `apps/web/src/components/layout/top-bar.tsx`
- [ ] Profile button → `router.push('/settings')`
- [ ] Settings button → `router.push('/settings')`
- [ ] Import `useRouter` from next/navigation

**EDIT:** `apps/web/src/components/layout/sidebar.tsx`
- [ ] Add Settings link at bottom of sidebar nav (optional — it's in the user menu too)

## Step 2.3: README Rewrite in Jerome's Voice (2 hrs)

**REWRITE:** `README.md`
- [ ] Personal opening: WHY Jerome built this (timezone coordination, 11pm Slack messages)
- [ ] "Challenges & Failures" section:
  - Polling → WebSocket ("network tab looked like a crime scene")
  - Redis pub-sub debug at 1am
  - react-beautiful-dnd → @dnd-kit rewrite
  - Fractional indexing precision edge case
- [ ] "What I Learned" section (replaces Key Decisions):
  - Modular monolith over microservices (from experience, not theory)
  - Why Redis for refresh tokens
  - Event emitter decoupling rationale
- [ ] Personal "About Me": 5 years TypeScript, solo dev, remote PH → US/EU
- [ ] "What's Next": developer wishlist ("the feature I miss most from Jira without the rest of Jira")
- [ ] Fix placeholder GitHub/LinkedIn links with real URLs
- [ ] Fix broken screenshot references

## Completion Criteria
- Landing page has feature chips, Try Demo, product screenshot (or placeholder)
- Settings page works: load profile, edit, save
- User menu Profile/Settings navigate to /settings
- README reads like a real developer wrote it, not a template
