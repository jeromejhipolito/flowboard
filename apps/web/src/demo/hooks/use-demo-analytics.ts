'use client';

import { useQuery } from '@tanstack/react-query';
import {
  DEMO_TASK_DISTRIBUTION,
  DEMO_PRIORITY_BREAKDOWN,
  DEMO_MEMBER_WORKLOAD,
  DEMO_SPRINT_VELOCITY,
  DEMO_BURNDOWN,
  DEMO_OVERDUE,
} from '@/demo/data/analytics';
import type {
  TaskDistributionItem,
  PriorityBreakdownItem,
  MemberWorkloadItem,
  VelocityItem,
  OverdueData,
  BurndownItem,
  SprintVelocityItem,
} from '@/hooks/use-analytics';

// Weekly velocity data (derived from sprint velocity for demo purposes)
const DEMO_VELOCITY: VelocityItem[] = [
  { week: '2026-W09', completedCount: 6 },
  { week: '2026-W10', completedCount: 8 },
  { week: '2026-W11', completedCount: 5 },
  { week: '2026-W12', completedCount: 9 },
  { week: '2026-W13', completedCount: 7 },
];

export function useDemoTaskDistribution(
  projectId: string,
  sprintId?: string,
) {
  return useQuery<TaskDistributionItem[]>({
    queryKey: ['analytics', 'task-distribution', projectId, sprintId ?? 'all'],
    queryFn: () => Promise.resolve(DEMO_TASK_DISTRIBUTION),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoPriorityBreakdown(
  projectId: string,
  sprintId?: string,
) {
  return useQuery<PriorityBreakdownItem[]>({
    queryKey: ['analytics', 'priority-breakdown', projectId, sprintId ?? 'all'],
    queryFn: () => Promise.resolve(DEMO_PRIORITY_BREAKDOWN),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoMemberWorkload(
  projectId: string,
  sprintId?: string,
) {
  return useQuery<MemberWorkloadItem[]>({
    queryKey: ['analytics', 'member-workload', projectId, sprintId ?? 'all'],
    queryFn: () => Promise.resolve(DEMO_MEMBER_WORKLOAD),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoVelocity(projectId: string, sprintId?: string) {
  return useQuery<VelocityItem[]>({
    queryKey: ['analytics', 'velocity', projectId, sprintId ?? 'all'],
    queryFn: () => Promise.resolve(DEMO_VELOCITY),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoOverdueTasks(projectId: string, sprintId?: string) {
  return useQuery<OverdueData>({
    queryKey: ['analytics', 'overdue', projectId, sprintId ?? 'all'],
    queryFn: () => Promise.resolve(DEMO_OVERDUE),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoSprintBurndown(
  projectId: string,
  sprintId?: string,
) {
  return useQuery<BurndownItem[]>({
    queryKey: ['analytics', 'burndown', projectId, sprintId],
    queryFn: () => Promise.resolve(DEMO_BURNDOWN),
    enabled: !!projectId && !!sprintId,
    staleTime: Infinity,
  });
}

export function useDemoSprintVelocity(projectId: string) {
  return useQuery<SprintVelocityItem[]>({
    queryKey: ['analytics', 'sprint-velocity', projectId],
    queryFn: () => Promise.resolve(DEMO_SPRINT_VELOCITY),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}
