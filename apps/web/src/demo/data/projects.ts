export interface DemoProject {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
  taskCountByStatus?: Record<string, number>;
}

export const DEMO_PROJECTS: DemoProject[] = [
  {
    id: 'demo-project-1',
    workspaceId: 'demo-workspace-1',
    name: 'Lakbay Platform',
    description:
      'Core platform — API gateway, auth service, event bus, and shared infrastructure.',
    status: 'ACTIVE',
    createdAt: '2025-11-01T08:00:00.000Z',
    updatedAt: '2026-03-25T14:30:00.000Z',
    _count: { tasks: 24 },
    taskCountByStatus: {
      BACKLOG: 5,
      TODO: 0,
      IN_PROGRESS: 7,
      IN_REVIEW: 5,
      DONE: 7,
    },
  },
  {
    id: 'demo-project-2',
    workspaceId: 'demo-workspace-1',
    name: 'Customer Portal Redesign',
    description:
      'Full redesign of the self-serve customer portal — new IA, design system tokens, and improved onboarding.',
    status: 'ACTIVE',
    createdAt: '2026-02-10T10:00:00.000Z',
    updatedAt: '2026-03-24T09:15:00.000Z',
    _count: { tasks: 8 },
    taskCountByStatus: {
      BACKLOG: 3,
      TODO: 3,
      IN_PROGRESS: 1,
      IN_REVIEW: 0,
      DONE: 1,
    },
  },
];
