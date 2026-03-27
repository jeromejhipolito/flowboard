'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DEMO_WORKSPACES,
  DEMO_WORKSPACE_MEMBERS,
} from '@/demo/data/workspaces';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDemoWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => Promise.resolve(DEMO_WORKSPACES),
    staleTime: Infinity,
  });
}

export function useDemoWorkspace(slug: string) {
  return useQuery({
    queryKey: ['workspaces', slug],
    queryFn: () =>
      Promise.resolve(
        DEMO_WORKSPACES.find((w) => w.slug === slug) ?? DEMO_WORKSPACES[0],
      ),
    enabled: !!slug,
    staleTime: Infinity,
  });
}

export function useDemoWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceId, 'members'],
    queryFn: () => Promise.resolve(DEMO_WORKSPACE_MEMBERS),
    enabled: !!workspaceId,
    staleTime: Infinity,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDemoCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const newWorkspace = {
        id: `demo-workspace-${Date.now()}`,
        name: payload.name,
        slug: payload.name.toLowerCase().replace(/\s+/g, '-'),
        description: payload.description,
        memberCount: 1,
        role: 'OWNER',
      };
      queryClient.setQueryData(
        ['workspaces'],
        (old: typeof DEMO_WORKSPACES = []) => [...old, newWorkspace],
      );
      toast.info('Demo mode — changes are not saved');
      return newWorkspace;
    },
  });
}

export function useDemoInviteMember() {
  return useMutation({
    mutationFn: async (_payload: {
      workspaceId: string;
      email: string;
      role: string;
    }) => {
      toast.info('Demo mode — invitations are disabled');
      return {};
    },
  });
}

export function useDemoUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      workspaceId: string;
      userId: string;
      role: string;
    }) => {
      queryClient.setQueryData(
        ['workspaces', payload.workspaceId, 'members'],
        (old: typeof DEMO_WORKSPACE_MEMBERS = []) =>
          old.map((m) =>
            m.userId === payload.userId ? { ...m, role: payload.role } : m,
          ),
      );
      toast.info('Demo mode — changes are not saved');
      return {};
    },
  });
}

export function useDemoRemoveMember() {
  return useMutation({
    mutationFn: async (_payload: { workspaceId: string; userId: string }) => {
      toast.info('Demo mode — member removal is disabled');
    },
  });
}
