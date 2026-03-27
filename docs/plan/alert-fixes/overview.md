# FlowBoard Alert Fixes — Implementation Plan

**Source:** Alert Level Meeting 2026-03-26
**BRs:** 6 business requirements (BR-1 through BR-6)
**Goal:** Fix all broken features, redesign UI, add testing foundation

## Phases

| Phase | Name | BRs | Duration | Demo-blocking? |
|-------|------|-----|----------|---------------|
| 1 | Fix Broken Features | BR-1, BR-2, BR-3, BR-6 | 2 hours | YES |
| 2 | Visual Design Overhaul | BR-4 | 90 minutes | No (polish) |
| 3 | Testing Foundation | BR-5 | 3-4 hours | No (quality) |

**Total: ~7-8 hours (1 focused day)**

## Key Architecture Decision
Command palette actions use URL-based navigation (`?action=create-task`)
instead of custom DOM events. Pages listen via `useQueryState('action')`.

## Files Touched Per Phase
- Phase 1: 6 files edited, 1 new file
- Phase 2: 8 files edited/rewritten
- Phase 3: 9+ new test files, 2 config files
