'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { TaskStatus, TaskPriority } from '@/lib/constants';
import { isDemoMode } from '@/demo';
import {
  useDemoTasks,
  useDemoTask,
  useDemoCreateTask,
  useDemoUpdateTask,
  useDemoMoveTask,
  useDemoDeleteTask,
} from '@/demo/hooks/use-demo-tasks';

export interface TaskUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface TaskLabel {
  taskId: string;
  labelId: string;
  label: {
    id: string;
    workspaceId: string;
    name: string;
    color: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  parentTaskId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  reporterId: string;
  position: number;
  dueDate?: string | null;
  sprintId?: string | null;
  storyPoints?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  assignee?: TaskUser | null;
  reporter?: TaskUser;
  labels?: TaskLabel[];
  childTasks?: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId?: string | null;
    position: number;
  }[];
  _count?: {
    comments: number;
    childTasks?: number;
  };
}

export interface TasksResponse {
  tasks: Task[];
  grouped: Record<string, Task[]>;
  nextCursor: string | null;
  hasMore: boolean;
}

// Fetch all tasks for a project (returns tasks grouped by status)
export function useTasks(
  projectId: string,
  filters?: { sprintId?: string | null },
) {
  if (isDemoMode) return useDemoTasks(projectId, filters);
  return useQuery<TasksResponse>({
    queryKey: ['tasks', { projectId, sprintId: filters?.sprintId }],
    queryFn: async () => {
      const params: Record<string, any> = { limit: 100, sort: 'position' };
      if (filters?.sprintId) {
        params.sprintId = filters.sprintId;
      }
      const { data } = await api.get(`/projects/${projectId}/tasks`, {
        params,
      });
      return data;
    },
    enabled: !!projectId,
  });
}

// Fetch a single task by ID
export function useTask(taskId: string) {
  if (isDemoMode) return useDemoTask(taskId);
  return useQuery<Task>({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}`);
      return data;
    },
    enabled: !!taskId,
  });
}

// Create a new task
export function useCreateTask() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoCreateTask();

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
      const { projectId, ...body } = payload;
      const { data } = await api.post(`/projects/${projectId}/tasks`, body);
      return data as Task;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { projectId: variables.projectId }],
      });
    },
  });
}

// Update an existing task
export function useUpdateTask() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoUpdateTask();

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
      const { data } = await api.patch(
        `/tasks/${payload.taskId}`,
        payload.data,
      );
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { projectId: data.projectId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks', data.id],
      });
    },
  });
}

// Move a task to a different status/position
export function useMoveTask() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoMoveTask();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      status: TaskStatus;
      position: number;
    }) => {
      const { data } = await api.patch(`/tasks/${payload.taskId}/move`, {
        status: payload.status,
        position: payload.position,
      });
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { projectId: data.projectId }],
      });
    },
  });
}

// Delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoDeleteTask();

  return useMutation({
    mutationFn: async (payload: { taskId: string; projectId: string }) => {
      const { data } = await api.delete(`/tasks/${payload.taskId}`);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { projectId: variables.projectId }],
      });
    },
  });
}
