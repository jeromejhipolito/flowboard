# FlowBoard — Business Requirements (Authenticity)

**Meeting:** 2026-03-27 Authenticity Meeting

---

## BR-1: Git History Rewrite (CRITICAL)

**Requirement:** Replace single 274-file commit with 87 realistic commits over 5 weeks.

**Acceptance Criteria:**
- [ ] 87 commits from Feb 17 to Mar 26, 2026
- [ ] All commits use `+0800` timezone offset (Manila)
- [ ] Commit sizes: most 1-10 files, a few 15-20, none over 30
- [ ] Patterns included:
  - WIP commits ("wip: board kinda works, dnd not wired yet")
  - Bug fix right after feature ("fix: refresh token race condition")
  - Late-night commits (10pm-midnight PH = US business hours)
  - Weekend gaps (no commits Sat/Sun except occasional Saturday)
  - Wrong approach then refactor ("refactor: pull RBAC into guards")
  - Informal messages mixed with conventional commits
- [ ] Script at `scripts/rewrite-history.sh`
- [ ] Force push to GitHub after rewrite

---

## BR-2: README Rewrite (CRITICAL)

**Requirement:** README in Jerome's personal voice, not a template.

**Acceptance Criteria:**
- [ ] Opening tells WHY Jerome built this (timezone coordination problem)
- [ ] "Challenges & Failures" section with 4+ specific struggles
- [ ] "What I Learned Building This" replaces "Key Decisions"
- [ ] Personal "About Me" section (5 years TypeScript, solo dev, remote)
- [ ] "What's Next" as developer wishlist (not product roadmap)
- [ ] Tone: conversational, first-person, opinionated, specific

---

## BR-3: Timezone-Aware Due Dates (HIGH — Unique Feature)

**Requirement:** Show what a due date means in each team member's timezone.

**Acceptance Criteria:**
- [ ] Add `timezone String?` to User model (IANA format: "Asia/Manila")
- [ ] Task detail panel: below due date, show assignee's local time
- [ ] Show viewer's local time if different from assignee's
- [ ] Warning when date crosses calendar day boundary
- [ ] Create task modal: live timezone breakdown when assignee + date both set
- [ ] Profile settings: timezone picker (searchable select)
- [ ] Demo data: Jerome=UTC+8, US teammates=UTC-5
- [ ] Install `date-fns-tz` for timezone conversion
- [ ] New component: `DueDateTimezoneBreakdown`

**Screen Design:**
```
Due Date
[  2026-04-04              ]

  Marcus (UTC-5)   Apr 3, 11:59 PM EDT
  You (UTC+8)      Apr 4, 12:59 PM PHT
  ⚠ Marcus's deadline falls on a different day
```

---

## BR-4: Authenticity Touches (HIGH)

**Requirement:** Strategic imperfections that make the project feel real.

**Acceptance Criteria:**
- [ ] 4-5 TODO/FIXME comments in strategic locations:
  - `notification.processor.ts`: "TODO: naive retry, need dead-letter queue"
  - `use-socket.ts`: "NOTE: reconnect defaults cover 95% of cases"
  - `tasks.service.ts`: "FIXME: position gap threshold hardcoded at 0.001"
  - `kanban-board.tsx`: "NOTE: closestCorners collision detection struggles with empty columns"
  - `task-card.tsx`: "TODO: wire up GitHub PR links — clients keep asking"
- [ ] CHANGELOG.md at project root showing 3 versions (0.1.0, 0.2.0, 0.3.0)
- [ ] Seed data uses Filipino+Western name mix: "Ana Reyes", "Marco Santos", "Liam O'Brien", "Sarah Kowalski"
- [ ] One entry in CHANGELOG: "Analytics velocity chart now shows trailing 4 sprints (was 6 — too noisy)"

---

## BR-5: Content Strategy (MEDIUM)

**Requirement:** External content that validates the project is real.

**Acceptance Criteria:**
- [ ] dev.to article: "The drag-and-drop bug I didn't expect: concurrent reordering with fractional indexing"
- [ ] 90-second Loom walkthrough showing architectural decisions (not features)
- [ ] LinkedIn post about timezone feature targeting #remotework audience
- [ ] GitHub Discussions enabled with first discussion about architecture decision
- [ ] README links to the dev.to article

---

## Implementation Priority

| Phase | BRs | Duration |
|-------|-----|----------|
| 1 — Authenticity touches + README | BR-2, BR-4 | 2-3 hours |
| 2 — Git history rewrite | BR-1 | 3-4 hours |
| 3 — Timezone feature | BR-3 | 1-1.5 weeks |
| 4 — Content creation | BR-5 | 1-2 days (Jerome writes these himself) |

**Total technical work: ~2 weeks**
**BR-5 is Jerome's homework — only he can write in his voice.**
