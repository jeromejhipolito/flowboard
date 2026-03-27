'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoSprints,
  useDemoActiveSprint,
  useDemoSprint,
  useDemoCreateSprint,
  useDemoStartSprint,
  useDemoCompleteSprint,
  useDemoUpdateSprint,
  useDemoSprintTasks,
  useDemoDeleteSprint,
} from '@/demo/hooks/use-demo-sprints';

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
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
  _count?: {
    tasks: number;
  };
}

// Fetch all sprints for a project
export function useSprints(projectId: string) {
  if (isDemoMode) return useDemoSprints(projectId);
  return useQuery<Sprint[]>({
    queryKey: ['sprints', { projectId }],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/sprints`);
      // API returns { sprints: [...], nextCursor, hasMore } or array directly
      return Array.isArray(data) ? data : (data.sprints ?? data.data ?? []);
    },
    enabled: !!projectId,
  });
}

// Fetch the active sprint for a project
export function useActiveSprint(projectId: string) {
  if (isDemoMode) return useDemoActiveSprint(projectId);
  return useQuery<Sprint | null>({
    queryKey: ['sprints', { projectId, active: true }],
    queryFn: async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}/sprints/active`);
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!projectId,
  });
}

// Fetch a single sprint by ID (detail with stats)
export function useSprint(sprintId: string) {
  if (isDemoMode) return useDemoSprint(sprintId);
  return useQuery<Sprint>({
    queryKey: ['sprints', sprintId],
    queryFn: async () => {
      const { data } = await api.get(`/sprints/${sprintId}`);
      return data;
    },
    enabled: !!sprintId,
  });
}

// Create a new sprint
export function useCreateSprint() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoCreateSprint();

  return useMutation({
    mutationFn: async (payload: {
      projectId: string;
      name: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const { projectId, ...body } = payload;
      const { data } = await api.post(`/projects/${projectId}/sprints`, body);
      return data as Sprint;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId }],
      });
    },
  });
}

// Start a sprint
export function useStartSprint() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoStartSprint();

  return useMutation({
    mutationFn: async (payload: { sprintId: string; projectId: string }) => {
      const { data } = await api.post(`/sprints/${payload.sprintId}/start`);
      return data as Sprint;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId, active: true }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', variables.sprintId],
      });
    },
  });
}

// Complete a sprint
export function useCompleteSprint() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoCompleteSprint();

  return useMutation({
    mutationFn: async (payload: {
      sprintId: string;
      projectId: string;
      nextSprintId?: string;
    }) => {
      const { data } = await api.post(`/sprints/${payload.sprintId}/complete`, {
        nextSprintId: payload.nextSprintId,
      });
      return data as Sprint;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId, active: true }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', variables.sprintId],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks', { projectId: variables.projectId }],
      });
    },
  });
}

// Update a sprint
export function useUpdateSprint() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoUpdateSprint();

  return useMutation({
    mutationFn: async (payload: {
      sprintId: string;
      projectId: string;
      data: {
        name?: string;
        goal?: string;
        startDate?: string;
        endDate?: string;
      };
    }) => {
      const { data } = await api.patch(
        `/sprints/${payload.sprintId}`,
        payload.data,
      );
      return data as Sprint;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', variables.sprintId],
      });
    },
  });
}

// Fetch all tasks for a specific sprint
export function useSprintTasks(projectId: string, sprintId: string) {
  if (isDemoMode) return useDemoSprintTasks(projectId, sprintId);
  return useQuery<import('./use-tasks').Task[]>({
    queryKey: ['sprint-tasks', sprintId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/tasks`, {
        params: { sprintId, limit: 200 },
      });
      return data.tasks ?? data;
    },
    enabled: !!projectId && !!sprintId,
  });
}

// Delete a sprint
export function useDeleteSprint() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoDeleteSprint();

  return useMutation({
    mutationFn: async (payload: { sprintId: string; projectId: string }) => {
      await api.delete(`/sprints/${payload.sprintId}`);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: variables.projectId }],
      });
    },
  });
}
