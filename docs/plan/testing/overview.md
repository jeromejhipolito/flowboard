# FlowBoard Testing — Implementation Plan

**Source:** Testing Strategy Meeting 2026-03-29
**Target:** 406 test cases (256 backend + 150 frontend)
**Current:** 7 tests (expand to 406)

## Phases

| Phase | Name | Tests | Duration |
|-------|------|-------|----------|
| 1 | Backend Services (High Risk) | 96 | 1 day |
| 2 | Backend Controllers | 120 | 1.5 days |
| 3 | Backend Guards + DTOs | 40 | 0.5 day |
| 4 | Frontend Forms | 69 | 1 day |
| 5 | Frontend Interactive + Hooks | 81 | 1 day |

**Total: ~5 days, 406 tests across ~45 test files**

## Write Order (Risk Priority)
1. Sprint service (atomic completion) → Tasks service (rebalance) → Workspaces service (RBAC)
2. All 12 controllers (validation, auth, guard checks)
3. Guards (4 files) + DTO validation
4. Form components (8 files — validation, submit, error states)
5. Interactive components (11 files) + hooks (5 files)

## Test Infrastructure (Already Configured)
- Backend: Jest + @nestjs/testing + jest-mock-extended
- Frontend: Jest + @testing-library/react + @testing-library/user-event + @testing-library/jest-dom
