'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoTaskActivity,
  useDemoProjectActivity,
} from '@/demo/hooks/use-demo-activity';

export interface ActivityActor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  actorId: string;
  actor: ActivityActor;
  before?: any;
  after?: any;
  timestamp: string;
}

export interface ActivityResponse {
  data: ActivityEntry[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Fetch activity feed for a specific task (paginated)
export function useTaskActivity(taskId: string) {
  if (isDemoMode) return useDemoTaskActivity(taskId);
  return useInfiniteQuery<ActivityResponse>({
    queryKey: ['activity', 'task', taskId],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = { limit: 20 };
      if (pageParam) params.cursor = pageParam;
      const { data } = await api.get(`/tasks/${taskId}/activity`, { params });
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!taskId,
  });
}

// Fetch activity feed for a project (paginated)
export function useProjectActivity(
  projectId: string,
  filters?: { action?: string; actorId?: string },
) {
  if (isDemoMode) return useDemoProjectActivity(projectId, filters);
  return useInfiniteQuery<ActivityResponse>({
    queryKey: ['activity', 'project', projectId, filters],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = { limit: 30 };
      if (pageParam) params.cursor = pageParam;
      if (filters?.action) params.action = filters.action;
      if (filters?.actorId) params.actorId = filters.actorId;
      const { data } = await api.get(`/projects/${projectId}/activity`, {
        params,
      });
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!projectId,
  });
}
