# FlowBoard Demo Mode — Implementation Plan

**Source:** Demo Mode Meeting 2026-03-26
**BRs:** 6 business requirements
**Total Estimated:** 2-4 days

## Phases

| Phase | Name | BRs | Duration |
|-------|------|-----|----------|
| 1 | Infrastructure + Demo Data | BR-1, BR-2, BR-3, BR-5 | 1-2 days |
| 2 | Demo Hooks + Interactions | BR-4, BR-6 | 1-2 days |

## Architecture: Mock Provider Pattern
- 3 seams: AuthProvider, Middleware, Hook re-exports
- Demo code in `src/demo/` — never imported by real code
- `NEXT_PUBLIC_DEMO_MODE=true` is build-time constant
- Zero production impact (tree-shaken)

## File Structure
```
src/demo/
  index.ts              ← isDemoMode export
  data/                 ← all mock data (typed)
    users.ts, workspaces.ts, projects.ts, sprints.ts,
    tasks.ts, analytics.ts, comments.ts, notifications.ts
  hooks/                ← 8 demo hook files
  providers/
    demo-auth-provider.tsx
src/components/demo/
  demo-banner.tsx
```
