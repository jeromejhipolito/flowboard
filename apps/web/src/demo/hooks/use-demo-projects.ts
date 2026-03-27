'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DEMO_PROJECTS } from '@/demo/data/projects';
import type { Project } from '@/hooks/use-projects';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDemoProjects(workspaceId: string) {
  return useQuery<Project[]>({
    queryKey: ['projects', { workspaceId }],
    queryFn: () =>
      Promise.resolve(
        DEMO_PROJECTS.filter((p) => p.workspaceId === workspaceId) as Project[],
      ),
    enabled: !!workspaceId,
    staleTime: Infinity,
  });
}

export function useDemoProject(projectId: string) {
  return useQuery<Project>({
    queryKey: ['projects', projectId],
    queryFn: () =>
      Promise.resolve(
        (DEMO_PROJECTS.find((p) => p.id === projectId) ??
          DEMO_PROJECTS[0]) as Project,
      ),
    enabled: !!projectId,
    staleTime: Infinity,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDemoCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      workspaceId: string;
      name: string;
      description?: string;
    }) => {
      const newProject: Project = {
        id: `demo-project-${Date.now()}`,
        workspaceId: payload.workspaceId,
        name: payload.name,
        description: payload.description,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { tasks: 0 },
        taskCountByStatus: {},
      };
      queryClient.setQueryData(
        ['projects', { workspaceId: payload.workspaceId }],
        (old: Project[] = []) => [...old, newProject],
      );
      toast.info('Demo mode — changes are not saved');
      return newProject;
    },
  });
}
