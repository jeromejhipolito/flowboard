import type {
  TaskDistributionItem,
  PriorityBreakdownItem,
  MemberWorkloadItem,
  SprintVelocityItem,
  BurndownItem,
  OverdueData,
} from '@/hooks/use-analytics';

// ─── Task Distribution (Meridian Core — all tasks) ──────────────────────────

export const DEMO_TASK_DISTRIBUTION: TaskDistributionItem[] = [
  { status: 'BACKLOG', count: 5 },
  { status: 'TODO', count: 0 },
  { status: 'IN_PROGRESS', count: 7 },
  { status: 'IN_REVIEW', count: 5 },
  { status: 'DONE', count: 7 },
];

// ─── Priority Breakdown ─────────────────────────────────────────────────────

export const DEMO_PRIORITY_BREAKDOWN: PriorityBreakdownItem[] = [
  { priority: 'LOW', count: 4 },
  { priority: 'MEDIUM', count: 8 },
  { priority: 'HIGH', count: 11 },
  { priority: 'URGENT', count: 0 },
];

// ─── Member Workload ────────────────────────────────────────────────────────

export const DEMO_MEMBER_WORKLOAD: MemberWorkloadItem[] = [
  {
    userId: 'demo-user-1',
    firstName: 'Alex',
    lastName: 'Rivera',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
    totalTasks: 5,
    completedTasks: 3,
  },
  {
    userId: 'demo-user-2',
    firstName: 'Samantha',
    lastName: 'Cho',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Samantha',
    totalTasks: 5,
    completedTasks: 1,
  },
  {
    userId: 'demo-user-3',
    firstName: 'Marcus',
    lastName: 'Webb',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Marcus',
    totalTasks: 5,
    completedTasks: 2,
  },
  {
    userId: 'demo-user-4',
    firstName: 'Priya',
    lastName: 'Nair',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
    totalTasks: 4,
    completedTasks: 1,
  },
  {
    userId: 'demo-user-5',
    firstName: 'Jordan',
    lastName: 'Lee',
    avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
    totalTasks: 4,
    completedTasks: 1,
  },
];

// ─── Sprint Velocity (last 6 sprints) ───────────────────────────────────────

export const DEMO_SPRINT_VELOCITY: SprintVelocityItem[] = [
  { sprintName: 'Sprint 9', sprintNumber: 9, completedPoints: 38, completedTasks: 10, avgVelocity: null },
  { sprintName: 'Sprint 10', sprintNumber: 10, completedPoints: 42, completedTasks: 12, avgVelocity: 40 },
  { sprintName: 'Sprint 11', sprintNumber: 11, completedPoints: 35, completedTasks: 9, avgVelocity: 38.3 },
  { sprintName: 'Sprint 12', sprintNumber: 12, completedPoints: 44, completedTasks: 13, avgVelocity: 39.8 },
  { sprintName: 'Sprint 13', sprintNumber: 13, completedPoints: 41, completedTasks: 14, avgVelocity: 40 },
  { sprintName: 'Sprint 14', sprintNumber: 14, completedPoints: 29, completedTasks: 7, avgVelocity: 38.2 },
];

// ─── Burndown (Sprint 14 — 8 days of data, slightly behind then catching up)

export const DEMO_BURNDOWN: BurndownItem[] = [
  { day: '2026-03-17', ideal: 47, actual: 47 },
  { day: '2026-03-18', ideal: 41, actual: 44 },
  { day: '2026-03-19', ideal: 35, actual: 39 },
  { day: '2026-03-20', ideal: 29, actual: 35 },
  { day: '2026-03-21', ideal: 24, actual: 28 },
  { day: '2026-03-23', ideal: 18, actual: 22 },
  { day: '2026-03-24', ideal: 12, actual: 17 },
  { day: '2026-03-25', ideal: 6, actual: 10 },
];

// ─── Overdue Tasks ──────────────────────────────────────────────────────────

export const DEMO_OVERDUE: OverdueData = {
  count: 2,
  tasks: [
    {
      id: 'demo-task-28',
      title: 'Build step-indicator component for multi-step onboarding wizard',
      dueDate: '2026-03-24T23:59:59.000Z',
      assignee: {
        id: 'demo-user-5',
        firstName: 'Jordan',
        lastName: 'Lee',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
      },
    },
    {
      id: 'demo-task-30',
      title: 'Implement responsive sidebar navigation for portal shell',
      dueDate: '2026-03-25T23:59:59.000Z',
      assignee: {
        id: 'demo-user-5',
        firstName: 'Jordan',
        lastName: 'Lee',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan',
      },
    },
  ],
};
