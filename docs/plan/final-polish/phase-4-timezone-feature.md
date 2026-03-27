# Phase 4 — Timezone-Aware Due Dates (1-1.5 weeks)

**Source:** Authenticity BR-3 — The unique feature that makes this project Jerome's

---

## Step 4.1: Backend — User Timezone Field (1 hr)

**EDIT:** `apps/api/prisma/schema.prisma`
- [ ] Add `timezone String?` to User model (IANA format, e.g. "Asia/Manila")
- [ ] Run `npx prisma generate`

**EDIT:** `apps/api/src/users/dto/update-user.dto.ts`
- [ ] Add `timezone?: string` with `@IsString()` `@IsOptional()`

**EDIT:** All Prisma select blocks that return user fields
- [ ] Add `timezone: true` to selects in: tasks.service.ts, workspaces.service.ts, comments.service.ts

## Step 4.2: Frontend — Install date-fns-tz (15 min)

- [ ] `pnpm add date-fns-tz --filter @flowboard/web`
- [ ] Add `timezone` to User type in use-auth.ts
- [ ] Add `timezone` to Task.assignee type in use-tasks.ts

## Step 4.3: DueDateTimezoneBreakdown Component (2 hrs)

**NEW:** `apps/web/src/components/board/due-date-timezone.tsx`
- [ ] Props: `dueDate: string`, `assignee?: { firstName, timezone? }`, `viewerTimezone?: string`
- [ ] Uses `date-fns-tz` `formatInTimeZone` for timezone conversion
- [ ] Shows assignee's local time: "Marcus (UTC-5) Apr 3, 11:59 PM EDT"
- [ ] Shows viewer's local time: "You (UTC+8) Apr 4, 12:59 PM PHT"
- [ ] Warning when date crosses calendar day boundary: "Marcus's deadline falls on a different day"
- [ ] Muted text styling: `text-xs text-muted-foreground`
- [ ] Only renders when both dueDate and timezone are set
- [ ] Derives timezone abbreviation from IANA ID at the specific date (handles DST)

## Step 4.4: Integration — Task Detail Panel (1 hr)

**EDIT:** `apps/web/src/components/board/task-detail-panel.tsx`
- [ ] Import `DueDateTimezoneBreakdown`
- [ ] Render below the due date input when both dueDate and assignee are present
- [ ] Pass `viewerTimezone` from current user's auth context

## Step 4.5: Integration — Create Task Modal (1 hr)

**EDIT:** `apps/web/src/components/board/create-task-modal.tsx`
- [ ] Render `DueDateTimezoneBreakdown` below due date field
- [ ] Updates live when assignee or due date changes (no save required)
- [ ] Pass selected assignee's timezone + viewer's timezone

## Step 4.6: Settings Page — Timezone Picker (1 hr)

**EDIT:** `apps/web/src/app/(dashboard)/settings/page.tsx`
- [ ] Add timezone searchable select with common IANA values
- [ ] Group by region: Asia, Americas, Europe, etc.
- [ ] Show UTC offset next to each option: "Asia/Manila (UTC+8)"
- [ ] Save via PATCH /users/me

## Step 4.7: Demo Data — Timezone Seeds (30 min)

**EDIT:** `apps/web/src/demo/data/users.ts`
- [ ] Alex Rivera: `timezone: 'Asia/Manila'`
- [ ] Samantha Cho: `timezone: 'America/New_York'`
- [ ] Marcus Webb: `timezone: 'America/Los_Angeles'`
- [ ] Priya Nair: `timezone: 'Europe/London'`
- [ ] Jordan Lee: `timezone: 'America/Chicago'`

**EDIT:** `apps/web/src/demo/data/tasks.ts`
- [ ] Set due dates on key tasks to dates where PH and US timezones cross calendar days
  (e.g., due Apr 4 midnight UTC = Apr 4 8am PHT but Apr 3 7pm EDT)

## Step 4.8: Seed Script — Real Backend (30 min)

**EDIT:** `apps/api/prisma/seed.ts`
- [ ] Set timezone on seed users: Jerome=Asia/Manila, Sarah=America/New_York, etc.

## Step 4.9: Verify

- [ ] Open task with due date + assigned to US user → see timezone breakdown
- [ ] Create task → select assignee + due date → live breakdown appears
- [ ] Calendar day boundary warning shows when applicable
- [ ] Settings page → set timezone → reflected in task panels
- [ ] Demo mode: breakdown visible with pre-seeded timezones
- [ ] `npx tsc --noEmit` + `npx nest build` — zero errors

## Completion Criteria
- Timezone breakdown visible on task detail panel
- Live update in create task modal
- Calendar day boundary warning
- Settings page with timezone picker
- Demo data pre-seeded with diverse timezones
- The interview story: "I set a deadline Friday my time and my client thought they had until Monday"
