import type { SprintStatus } from '@/hooks/use-sprints';

export interface DemoSprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string | null;
  status: SprintStatus;
  startDate?: string | null;
  endDate?: string | null;
  completedAt?: string | null;
  scopeAtStart?: number | null;
  carriedOver?: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export const DEMO_SPRINTS: DemoSprint[] = [
  // Meridian Core — active sprint
  {
    id: 'demo-sprint-1',
    projectId: 'demo-project-1',
    name: 'Sprint 14',
    goal: 'Reliability & Scale — cache refactor, rate limiting, CDN compression',
    status: 'ACTIVE',
    startDate: '2026-03-17T00:00:00.000Z',
    endDate: '2026-03-28T23:59:59.000Z',
    completedAt: null,
    scopeAtStart: 47,
    carriedOver: 3,
    createdAt: '2026-03-16T10:00:00.000Z',
    updatedAt: '2026-03-25T14:30:00.000Z',
    _count: { tasks: 17 },
  },
  // Meridian Core — closed sprint
  {
    id: 'demo-sprint-2',
    projectId: 'demo-project-1',
    name: 'Sprint 13',
    goal: 'Auth hardening & observability',
    status: 'COMPLETED',
    startDate: '2026-03-03T00:00:00.000Z',
    endDate: '2026-03-14T23:59:59.000Z',
    completedAt: '2026-03-14T17:00:00.000Z',
    scopeAtStart: 44,
    carriedOver: 3,
    createdAt: '2026-03-02T10:00:00.000Z',
    updatedAt: '2026-03-14T17:00:00.000Z',
    _count: { tasks: 14 },
  },
  // Meridian Core — closed sprint
  {
    id: 'demo-sprint-3',
    projectId: 'demo-project-1',
    name: 'Sprint 12',
    goal: 'UI polish & performance',
    status: 'COMPLETED',
    startDate: '2026-02-17T00:00:00.000Z',
    endDate: '2026-02-28T23:59:59.000Z',
    completedAt: '2026-02-28T17:00:00.000Z',
    scopeAtStart: 46,
    carriedOver: 2,
    createdAt: '2026-02-16T10:00:00.000Z',
    updatedAt: '2026-02-28T17:00:00.000Z',
    _count: { tasks: 13 },
  },
  // Customer Portal — active sprint
  {
    id: 'demo-sprint-4',
    projectId: 'demo-project-2',
    name: 'Sprint 2',
    goal: 'New onboarding flow & design token foundations',
    status: 'ACTIVE',
    startDate: '2026-03-24T00:00:00.000Z',
    endDate: '2026-04-04T23:59:59.000Z',
    completedAt: null,
    scopeAtStart: 21,
    carriedOver: 0,
    createdAt: '2026-03-23T10:00:00.000Z',
    updatedAt: '2026-03-25T09:15:00.000Z',
    _count: { tasks: 5 },
  },
];
