'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoWorkspaces,
  useDemoWorkspace,
  useDemoCreateWorkspace,
  useDemoWorkspaceMembers,
  useDemoInviteMember,
  useDemoUpdateMemberRole,
  useDemoRemoveMember,
} from '@/demo/hooks/use-demo-workspaces';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  memberCount?: number;
  role?: string;
}

interface WorkspaceMember {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  timezone?: string;
}

// Fetch all workspaces for the current user
export function useWorkspaces() {
  if (isDemoMode) return useDemoWorkspaces();
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await api.get('/workspaces');
      return data;
    },
  });
}

// Fetch a single workspace by slug
export function useWorkspace(slug: string) {
  if (isDemoMode) return useDemoWorkspace(slug);
  return useQuery<Workspace>({
    queryKey: ['workspaces', slug],
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

// Create a new workspace
export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoCreateWorkspace();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const { data } = await api.post('/workspaces', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

// Fetch workspace members
export function useWorkspaceMembers(workspaceId: string) {
  if (isDemoMode) return useDemoWorkspaceMembers(workspaceId);
  return useQuery<WorkspaceMember[]>({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: async () => {
      const { data } = await api.get(`/workspaces/${workspaceId}/members`);
      return data;
    },
    enabled: !!workspaceId,
  });
}

// Invite a member to a workspace
export function useInviteMember() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoInviteMember();

  return useMutation({
    mutationFn: async (payload: {
      workspaceId: string;
      email: string;
      role: string;
    }) => {
      const { data } = await api.post(
        `/workspaces/${payload.workspaceId}/members`,
        {
          email: payload.email,
          role: payload.role,
        },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });
    },
  });
}

// Update a member's role
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoUpdateMemberRole();

  return useMutation({
    mutationFn: async (payload: {
      workspaceId: string;
      userId: string;
      role: string;
    }) => {
      const { data } = await api.patch(
        `/workspaces/${payload.workspaceId}/members/${payload.userId}`,
        { role: payload.role },
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });
    },
  });
}

// Remove a member from a workspace
export function useRemoveMember() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoRemoveMember();

  return useMutation({
    mutationFn: async (payload: { workspaceId: string; userId: string }) => {
      await api.delete(
        `/workspaces/${payload.workspaceId}/members/${payload.userId}`,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', variables.workspaceId, 'members'],
      });
    },
  });
}
