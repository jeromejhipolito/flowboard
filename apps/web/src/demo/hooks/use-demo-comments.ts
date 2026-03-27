'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getDemoComments } from '@/demo/data/comments';
import { DEMO_CURRENT_USER } from '@/demo/data/users';
import type { Comment, CommentsResponse } from '@/hooks/use-comments';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDemoComments(taskId: string) {
  return useQuery<CommentsResponse>({
    queryKey: ['comments', { taskId }],
    queryFn: () => Promise.resolve(getDemoComments(taskId)),
    enabled: !!taskId,
    staleTime: Infinity,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDemoCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      body: string;
      parentCommentId?: string;
    }) => {
      const newComment: Comment = {
        id: `demo-comment-${Date.now()}`,
        taskId: payload.taskId,
        authorId: DEMO_CURRENT_USER.id,
        author: {
          id: DEMO_CURRENT_USER.id,
          firstName: DEMO_CURRENT_USER.firstName,
          lastName: DEMO_CURRENT_USER.lastName,
          avatarUrl: DEMO_CURRENT_USER.avatarUrl,
        },
        body: payload.body,
        parentCommentId: payload.parentCommentId ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        editedAt: null,
      };

      queryClient.setQueryData(
        ['comments', { taskId: payload.taskId }],
        (old: CommentsResponse | undefined) => ({
          comments: [...(old?.comments ?? []), newComment],
        }),
      );

      toast.info('Demo mode — changes are not saved');
      return newComment;
    },
  });
}

export function useDemoUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { commentId: string; body: string }) => {
      // Find the comment's taskId by searching across cached queries
      let taskId = '';
      const queries = queryClient.getQueriesData<CommentsResponse>({
        queryKey: ['comments'],
      });
      for (const [key, data] of queries) {
        if (data?.comments.some((c) => c.id === payload.commentId)) {
          taskId = (key[1] as { taskId: string }).taskId;
          break;
        }
      }

      const now = new Date().toISOString();
      let updated: Comment | undefined;

      if (taskId) {
        queryClient.setQueryData(
          ['comments', { taskId }],
          (old: CommentsResponse | undefined) => ({
            comments: (old?.comments ?? []).map((c) => {
              if (c.id === payload.commentId) {
                updated = { ...c, body: payload.body, editedAt: now, updatedAt: now };
                return updated;
              }
              return c;
            }),
          }),
        );
      }

      toast.info('Demo mode — changes are not saved');
      return updated ?? ({ id: payload.commentId, taskId, body: payload.body } as Comment);
    },
  });
}

export function useDemoDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { commentId: string; taskId: string }) => {
      queryClient.setQueryData(
        ['comments', { taskId: payload.taskId }],
        (old: CommentsResponse | undefined) => ({
          comments: (old?.comments ?? []).filter(
            (c) => c.id !== payload.commentId,
          ),
        }),
      );

      toast.info('Demo mode — changes are not saved');
      return payload;
    },
  });
}
