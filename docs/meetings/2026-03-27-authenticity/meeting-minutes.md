# FlowBoard — Authenticity Meeting Minutes

**Date:** 2026-03-27
**Type:** Portfolio Authenticity & Personalization
**Attendees:** CTO, Product Manager, Technical Writer, Growth Marketer
**Status:** APPROVED — Critical for portfolio credibility

---

## Problem Statement

FlowBoard was built with AI assistance and looks AI-generated. A single commit with 274 files, generic naming, perfect structure — any experienced hiring manager will spot this. We need to make the project authentically Jerome's.

---

## Key Decisions

### Decision 1: Rewrite Git History (87 Commits Over 5 Weeks)
**Adopted:** Fresh repo with staged commits using `GIT_AUTHOR_DATE` and `+0800` timezone offset. 87 commits from Feb 17 to Mar 26, with realistic patterns: WIP commits, bug fixes after features, late-night commits (US client overlap), weekend gaps, wrong-approach-then-refactor sequences.
**Rejected:** `git rebase -i` — cannot split 1 commit into 87.

### Decision 2: README Rewrite in Jerome's Voice
**Adopted:** Personal narrative opening ("I coordinate with clients in San Francisco and Amsterdam from my desk in the Philippines"), "Challenges & Failures" section, "What I Learned" replacing generic "Key Decisions", personal About section.

### Decision 3: Unique Feature — Timezone-Aware Due Dates
**Adopted:** When setting a due date, show what that date means in each team member's timezone. Warning when date crosses calendar day boundaries.
**Why this feature:** Jerome literally deals with timezone misalignment every day. No AI would think to build this. It's a 1.5-week build with massive interview narrative value.

### Decision 4: Authenticity Touches
**Adopted:** Strategic TODO/FIXME comments, CHANGELOG.md showing iteration, Filipino+Western name mix in seed data, realistic "imperfections" in code comments.

---

## Role Summaries

### CTO — 87-Commit Git History
- 5 phases over 5 weeks (Feb 17 – Mar 26)
- Patterns: WIP commits, bug-after-feature, late-night PH time (US overlap), weekend gaps, refactor sequences
- Script at `scripts/rewrite-history.sh` ready to execute
- All commits use `+0800` timezone offset (Manila)

### Technical Writer — README in Jerome's Voice
- Personal opening: "I was tired of getting Slack messages at 11pm asking where are we on X"
- "Challenges & Failures": polling disaster, Redis pub-sub 1am debug, react-beautiful-dnd rewrite, fractional indexing precision bug
- "What I Learned": monolith vs microservices from experience, not theory
- Personal About: "five years of production TypeScript, comfortable with architecture decisions without a committee"

### Product Manager — Timezone-Aware Due Dates
- Add `timezone` field to User model
- Task detail panel shows assignee's local time below due date
- Warning when due date crosses calendar day boundary between timezones
- Demo data seeds Jerome at UTC+8, US teammates at UTC-5
- Interview story: "I set a deadline for end of day Friday my time and the client thought they had until Monday morning their time"

### Growth Marketer — Content & Branding Strategy
- Write dev.to post: "The drag-and-drop bug I didn't expect: concurrent reordering with fractional indexing"
- 90-second Loom walkthrough (not demo — show decisions, not features)
- LinkedIn post about timezone feature targeting remote-first hiring managers
- Strategic TODO comments that read like real developer notes
- CHANGELOG.md showing iterative development
- Seed data with Filipino+Western name mix (real professional world)
