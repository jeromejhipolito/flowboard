'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoTaskDistribution,
  useDemoPriorityBreakdown,
  useDemoMemberWorkload,
  useDemoVelocity,
  useDemoOverdueTasks,
  useDemoSprintBurndown,
  useDemoSprintVelocity,
} from '@/demo/hooks/use-demo-analytics';

export interface TaskDistributionItem {
  status: string;
  count: number;
}

export interface PriorityBreakdownItem {
  priority: string;
  count: number;
}

export interface MemberWorkloadItem {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  totalTasks: number;
  completedTasks: number;
}

export interface VelocityItem {
  week: string;
  completedCount: number;
}

export interface OverdueTask {
  id: string;
  title: string;
  dueDate: string;
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  } | null;
}

export interface OverdueData {
  count: number;
  tasks: OverdueTask[];
}

export interface BurndownItem {
  day: string;
  ideal: number;
  actual: number;
}

export interface SprintVelocityItem {
  sprintName: string;
  sprintNumber: number;
  completedPoints: number;
  completedTasks: number;
  avgVelocity: number | null;
}

export function useTaskDistribution(projectId: string, sprintId?: string) {
  if (isDemoMode) return useDemoTaskDistribution(projectId, sprintId);
  return useQuery<TaskDistributionItem[]>({
    queryKey: ['analytics', 'task-distribution', projectId, sprintId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/task-distribution`,
        { params: { ...(sprintId && { sprintId }) } },
      );
      return data;
    },
    enabled: !!projectId,
  });
}

export function usePriorityBreakdown(projectId: string, sprintId?: string) {
  if (isDemoMode) return useDemoPriorityBreakdown(projectId, sprintId);
  return useQuery<PriorityBreakdownItem[]>({
    queryKey: ['analytics', 'priority-breakdown', projectId, sprintId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/priority-breakdown`,
        { params: { ...(sprintId && { sprintId }) } },
      );
      return data;
    },
    enabled: !!projectId,
  });
}

export function useMemberWorkload(projectId: string, sprintId?: string) {
  if (isDemoMode) return useDemoMemberWorkload(projectId, sprintId);
  return useQuery<MemberWorkloadItem[]>({
    queryKey: ['analytics', 'member-workload', projectId, sprintId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/member-workload`,
        { params: { ...(sprintId && { sprintId }) } },
      );
      return data;
    },
    enabled: !!projectId,
  });
}

export function useVelocity(projectId: string, sprintId?: string) {
  if (isDemoMode) return useDemoVelocity(projectId, sprintId);
  return useQuery<VelocityItem[]>({
    queryKey: ['analytics', 'velocity', projectId, sprintId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/velocity`,
        { params: { ...(sprintId && { sprintId }) } },
      );
      return data;
    },
    enabled: !!projectId,
  });
}

export function useOverdueTasks(projectId: string, sprintId?: string) {
  if (isDemoMode) return useDemoOverdueTasks(projectId, sprintId);
  return useQuery<OverdueData>({
    queryKey: ['analytics', 'overdue', projectId, sprintId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/overdue`,
        { params: { ...(sprintId && { sprintId }) } },
      );
      return data;
    },
    enabled: !!projectId,
  });
}

export function useSprintBurndown(projectId: string, sprintId?: string) {
  if (isDemoMode) return useDemoSprintBurndown(projectId, sprintId);
  return useQuery<BurndownItem[]>({
    queryKey: ['analytics', 'burndown', projectId, sprintId],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/burndown`,
        { params: { sprintId } },
      );
      return data;
    },
    enabled: !!projectId && !!sprintId,
  });
}

export function useSprintVelocity(projectId: string) {
  if (isDemoMode) return useDemoSprintVelocity(projectId);
  return useQuery<SprintVelocityItem[]>({
    queryKey: ['analytics', 'sprint-velocity', projectId],
    queryFn: async () => {
      const { data } = await api.get(
        `/projects/${projectId}/analytics/sprint-velocity`,
      );
      return data;
    },
    enabled: !!projectId,
  });
}
