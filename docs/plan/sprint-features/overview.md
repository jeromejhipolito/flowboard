# FlowBoard Sprint Features — Implementation Plan

**Source:** Sprint Features Meeting 2026-03-26
**BRs:** 6 business requirements (BR-1 through BR-6)
**Total Estimated:** ~6.5 weeks solo developer

## Phases

| Phase | Name | BRs | Duration |
|-------|------|-----|----------|
| 1 | Quick Wins (List View + Card Density) | BR-2, BR-3 | 1 week |
| 2 | Sprint Backend (Schema + API) | BR-1 (backend) | 1.5 weeks |
| 3 | Sprint Frontend (Selector + Assign + Complete) | BR-1 (frontend) | 1.5 weeks |
| 4 | Search + Past Sprint Viewer | BR-4, BR-5 | 1.5 weeks |
| 5 | Sprint Analytics | BR-6 | 1 week |

## Dependencies
- Phase 2 must complete before Phase 3 (frontend needs API)
- Phase 3 must complete before Phase 5 (analytics needs sprint data)
- Phase 1 and Phase 4's search are independent of sprints
- Phase 4's sprint viewer depends on Phase 2+3

## Key Architecture Decisions
- Sprint = filter lens, not data container (tasks stay in Task table)
- Sprint completion is atomic $transaction
- activeSprintId on Project for O(1) active sprint lookup
- Card density in Zustand with localStorage persist
- Search is client-side for v1 (≤100 tasks already in memory)
