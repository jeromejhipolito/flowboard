# FlowBoard — Implementation Plan Overview

## Project Summary
Real-Time Collaborative Task Management Platform (Jira/Linear-lite)
Built with **NestJS** (backend) + **NextJS** (frontend)

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend Framework | NestJS (Node.js) |
| Frontend Framework | NextJS 15 (App Router) |
| Database | PostgreSQL via Prisma ORM |
| Cache / Pub-Sub | Redis |
| Real-Time | Socket.io (@nestjs/websockets) |
| Queue | Bull (@nestjs/bull) |
| Auth | JWT (access + refresh token rotation) |
| Frontend State | TanStack Query + Zustand + URL params (nuqs) |
| Drag & Drop | @dnd-kit/core |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS + shadcn/ui |
| Deployment | Docker Compose (dev) + Railway/Render (prod) |

## Architecture
```
flowboard/
  apps/
    api/          # NestJS backend (monolith, modular)
    web/          # NextJS frontend (App Router)
  packages/
    shared/       # Shared types, DTOs, Zod schemas
  docker-compose.yml
  package.json    # Workspace root (pnpm)
```

## Phases

| Phase | Name | Duration | Key Deliverable |
|-------|------|----------|-----------------|
| 0 | Project Scaffolding | 2-3 days | Monorepo, Docker, CI, DB schema |
| 1 | Auth + Workspaces + RBAC | ~1.5 weeks | Full auth flow, workspace CRUD, role system |
| 2 | Kanban Board + Real-Time | ~2 weeks | Drag-and-drop board with live WebSocket sync |
| 3 | Collaboration Features | ~1.5 weeks | Notifications, activity log, comments |
| 4 | Analytics + Polish + Deploy | ~1.5 weeks | Dashboard, command palette, dark mode, production deploy |

## Data Model (Entity Map)
```
User ──┐
       ├── WorkspaceMembership (role: OWNER|ADMIN|MEMBER|VIEWER)
       │         │
Workspace ───────┘
       │
    Project
       │
    Task (self-ref: parentTask → subtasks)
    ├── Label (M2M via TaskLabel)
    ├── Comment (self-ref: threaded replies)
    ├── AuditLog (before/after JSON snapshots)
    └── Notification (polymorphic: resourceType + resourceId)
```

## Non-Negotiable Rules
1. Deploy at end of Phase 1, not Phase 4
2. No GraphQL, no Kafka, no microservices — clean modular monolith
3. README documents architectural WHY, not just WHAT
4. Every phase must be independently demo-able
5. Prisma middleware enforces tenant scoping at ORM layer
6. Keyboard accessibility for drag-and-drop (WCAG 2.1)
