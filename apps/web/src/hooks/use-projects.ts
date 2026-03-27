'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoProjects,
  useDemoProject,
  useDemoCreateProject,
} from '@/demo/hooks/use-demo-projects';

export interface Project {
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

// Fetch all projects in a workspace
export function useProjects(workspaceId: string) {
  if (isDemoMode) return useDemoProjects(workspaceId);
  return useQuery<Project[]>({
    queryKey: ['projects', { workspaceId }],
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}/projects`);
      return data;
    },
    enabled: !!workspaceId,
  });
}

// Fetch a single project by ID
export function useProject(projectId: string) {
  if (isDemoMode) return useDemoProject(projectId);
  return useQuery<Project>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });
}

// Create a new project
export function useCreateProject() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoCreateProject();

  return useMutation({
    mutationFn: async (payload: {
      workspaceId: string;
      name: string;
      description?: string;
    }) => {
      const { data } = await api.post(
        `/workspaces/${payload.workspaceId}/projects`,
        {
          name: payload.name,
          description: payload.description,
        },
      );
      return data as Project;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', { workspaceId: variables.workspaceId }],
      });
    },
  });
}
