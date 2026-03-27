'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DEMO_SPRINTS } from '@/demo/data/sprints';
import { DEMO_TASKS } from '@/demo/data/tasks';
import type { Sprint } from '@/hooks/use-sprints';
import type { Task } from '@/hooks/use-tasks';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDemoSprints(projectId: string) {
  return useQuery<Sprint[]>({
    queryKey: ['sprints', { projectId }],
    queryFn: () =>
      Promise.resolve(
        DEMO_SPRINTS.filter((s) => s.projectId === projectId) as Sprint[],
      ),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoActiveSprint(projectId: string) {
  return useQuery<Sprint | null>({
    queryKey: ['sprints', { projectId, active: true }],
    queryFn: () =>
      Promise.resolve(
        (DEMO_SPRINTS.find(
          (s) => s.projectId === projectId && s.status === 'ACTIVE',
        ) as Sprint | undefined) ?? null,
      ),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoSprint(sprintId: string) {
  return useQuery<Sprint>({
    queryKey: ['sprints', sprintId],
    queryFn: () =>
      Promise.resolve(
        (DEMO_SPRINTS.find((s) => s.id === sprintId) ??
          DEMO_SPRINTS[0]) as Sprint,
      ),
    enabled: !!sprintId,
    staleTime: Infinity,
  });
}

export function useDemoSprintTasks(projectId: string, sprintId: string) {
  return useQuery<Task[]>({
    queryKey: ['sprint-tasks', sprintId],
    queryFn: () =>
      Promise.resolve(
        DEMO_TASKS.filter(
          (t) => t.projectId === projectId && t.sprintId === sprintId,
        ) as Task[],
      ),
    enabled: !!projectId && !!sprintId,
    staleTime: Infinity,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDemoCreateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      projectId: string;
      name: string;
      goal?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const newSprint: Sprint = {
        id: `demo-sprint-${Date.now()}`,
        projectId: payload.projectId,
        name: payload.name,
        goal: payload.goal ?? null,
        status: 'PLANNING',
        startDate: payload.startDate ?? null,
        endDate: payload.endDate ?? null,
        completedAt: null,
        scopeAtStart: null,
        carriedOver: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { tasks: 0 },
      };

      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId }],
        (old: Sprint[] = []) => [...old, newSprint],
      );

      toast.info('Demo mode — changes are not saved');
      return newSprint;
    },
  });
}

export function useDemoStartSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { sprintId: string; projectId: string }) => {
      const sprint = DEMO_SPRINTS.find((s) => s.id === payload.sprintId);
      const started = {
        ...sprint,
        status: 'ACTIVE' as const,
        startDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Sprint;

      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId }],
        (old: Sprint[] = []) =>
          old.map((s) => (s.id === payload.sprintId ? started : s)),
      );
      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId, active: true }],
        started,
      );
      queryClient.setQueryData(['sprints', payload.sprintId], started);

      toast.info('Demo mode — changes are not saved');
      return started;
    },
  });
}

export function useDemoCompleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      sprintId: string;
      projectId: string;
      nextSprintId?: string;
    }) => {
      const sprint = DEMO_SPRINTS.find((s) => s.id === payload.sprintId);
      const completed = {
        ...sprint,
        status: 'COMPLETED' as const,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Sprint;

      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId }],
        (old: Sprint[] = []) =>
          old.map((s) => (s.id === payload.sprintId ? completed : s)),
      );
      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId, active: true }],
        null,
      );
      queryClient.setQueryData(['sprints', payload.sprintId], completed);

      toast.info('Demo mode — changes are not saved');
      return completed;
    },
  });
}

export function useDemoUpdateSprint() {
  const queryClient = useQueryClient();

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
      const sprint = DEMO_SPRINTS.find((s) => s.id === payload.sprintId);
      const updated = {
        ...sprint,
        ...payload.data,
        updatedAt: new Date().toISOString(),
      } as Sprint;

      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId }],
        (old: Sprint[] = []) =>
          old.map((s) => (s.id === payload.sprintId ? updated : s)),
      );
      queryClient.setQueryData(['sprints', payload.sprintId], updated);

      toast.info('Demo mode — changes are not saved');
      return updated;
    },
  });
}

export function useDemoDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { sprintId: string; projectId: string }) => {
      queryClient.setQueryData(
        ['sprints', { projectId: payload.projectId }],
        (old: Sprint[] = []) => old.filter((s) => s.id !== payload.sprintId),
      );

      toast.info('Demo mode — changes are not saved');
    },
  });
}
