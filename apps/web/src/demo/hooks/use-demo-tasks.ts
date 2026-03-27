'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DEMO_TASKS, getDemoTasksGrouped } from '@/demo/data/tasks';
import { DEMO_CURRENT_USER } from '@/demo/data/users';
import type { Task, TasksResponse } from '@/hooks/use-tasks';
import type { TaskStatus, TaskPriority } from '@/lib/constants';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDemoTasks(
  projectId: string,
  filters?: { sprintId?: string | null },
) {
  return useQuery<TasksResponse>({
    queryKey: ['tasks', { projectId, sprintId: filters?.sprintId }],
    queryFn: () =>
      Promise.resolve(
        getDemoTasksGrouped(projectId, filters?.sprintId) as TasksResponse,
      ),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

export function useDemoTask(taskId: string) {
  return useQuery<Task>({
    queryKey: ['tasks', taskId],
    queryFn: () =>
      Promise.resolve(
        (DEMO_TASKS.find((t) => t.id === taskId) ?? DEMO_TASKS[0]) as Task,
      ),
    enabled: !!taskId,
    staleTime: Infinity,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDemoCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      projectId: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      dueDate?: string;
      parentTaskId?: string;
      storyPoints?: number;
    }) => {
      const status = payload.status ?? 'TODO';
      const newTask: Task = {
        id: `demo-task-${Date.now()}`,
        projectId: payload.projectId,
        title: payload.title,
        description: payload.description ?? null,
        status,
        priority: payload.priority ?? 'MEDIUM',
        assigneeId: payload.assigneeId ?? null,
        reporterId: DEMO_CURRENT_USER.id,
        position: Date.now(),
        dueDate: payload.dueDate ?? null,
        storyPoints: payload.storyPoints ?? null,
        sprintId: null,
        parentTaskId: payload.parentTaskId ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reporter: {
          id: DEMO_CURRENT_USER.id,
          email: DEMO_CURRENT_USER.email,
          firstName: DEMO_CURRENT_USER.firstName,
          lastName: DEMO_CURRENT_USER.lastName,
          avatarUrl: DEMO_CURRENT_USER.avatarUrl,
        },
        labels: [],
        _count: { comments: 0 },
      };

      // Update all tasks query caches that match this project
      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ['tasks', { projectId: payload.projectId }], exact: false },
        (old) => {
          if (!old) return old;
          const newTasks = [...old.tasks, newTask as Task];
          const newGrouped = { ...old.grouped };
          newGrouped[status] = [...(newGrouped[status] || []), newTask as Task];
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );

      toast.info('Demo mode — changes are not saved');
      return newTask as Task;
    },
  });
}

export function useDemoUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      data: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: string | null;
        dueDate?: string | null;
        parentTaskId?: string | null;
        sprintId?: string | null;
        storyPoints?: number | null;
      };
    }) => {
      const existing = DEMO_TASKS.find((t) => t.id === payload.taskId);
      const projectId = existing?.projectId ?? '';
      const updated = { ...existing, ...payload.data, updatedAt: new Date().toISOString() } as Task;

      // Update grouped cache
      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ['tasks', { projectId }], exact: false },
        (old) => {
          if (!old) return old;
          const newTasks = old.tasks.map((t) =>
            t.id === payload.taskId ? { ...t, ...payload.data, updatedAt: new Date().toISOString() } : t,
          );
          const newGrouped: Record<string, Task[]> = {};
          for (const task of newTasks) {
            if (!newGrouped[task.status]) newGrouped[task.status] = [];
            newGrouped[task.status].push(task);
          }
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );

      // Update individual task cache
      queryClient.setQueryData(['tasks', payload.taskId], (old: Task | undefined) =>
        old ? { ...old, ...payload.data, updatedAt: new Date().toISOString() } : old,
      );

      toast.info('Demo mode — changes are not saved');
      return updated;
    },
  });
}

export function useDemoMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      status: TaskStatus;
      position: number;
    }) => {
      const existing = DEMO_TASKS.find((t) => t.id === payload.taskId);
      const projectId = existing?.projectId ?? '';
      const moved = {
        ...existing,
        status: payload.status,
        position: payload.position,
        updatedAt: new Date().toISOString(),
      } as Task;

      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ['tasks', { projectId }], exact: false },
        (old) => {
          if (!old) return old;
          const newTasks = old.tasks.map((t) =>
            t.id === payload.taskId
              ? { ...t, status: payload.status, position: payload.position }
              : t,
          );
          const newGrouped: Record<string, Task[]> = {};
          for (const task of newTasks) {
            if (!newGrouped[task.status]) newGrouped[task.status] = [];
            newGrouped[task.status].push(task);
          }
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );

      toast.info('Demo mode — changes are not saved');
      return moved;
    },
  });
}

export function useDemoDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { taskId: string; projectId: string }) => {
      queryClient.setQueriesData<TasksResponse>(
        { queryKey: ['tasks', { projectId: payload.projectId }], exact: false },
        (old) => {
          if (!old) return old;
          const newTasks = old.tasks.filter((t) => t.id !== payload.taskId);
          const newGrouped: Record<string, Task[]> = {};
          for (const task of newTasks) {
            if (!newGrouped[task.status]) newGrouped[task.status] = [];
            newGrouped[task.status].push(task);
          }
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );

      toast.info('Demo mode — changes are not saved');
      return {};
    },
  });
}
