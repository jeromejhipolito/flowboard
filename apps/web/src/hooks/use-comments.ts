'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoComments,
  useDemoCreateComment,
  useDemoUpdateComment,
  useDemoDeleteComment,
} from '@/demo/hooks/use-demo-comments';

export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  author: CommentAuthor;
  body: string;
  parentCommentId?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
}

export interface CommentsResponse {
  comments: Comment[];
}

// Fetch comments for a task
export function useComments(taskId: string) {
  if (isDemoMode) return useDemoComments(taskId);
  return useQuery<CommentsResponse>({
    queryKey: ['comments', { taskId }],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}/comments`);
      return data;
    },
    enabled: !!taskId,
  });
}

// Create a new comment on a task
export function useCreateComment() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoCreateComment();

  return useMutation({
    mutationFn: async (payload: {
      taskId: string;
      body: string;
      parentCommentId?: string;
    }) => {
      const { taskId, ...body } = payload;
      const { data } = await api.post(`/tasks/${taskId}/comments`, body);
      return data as Comment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', { taskId: variables.taskId }],
      });
      // Also invalidate task to update comment count
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId],
      });
    },
  });
}

// Update an existing comment
export function useUpdateComment() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoUpdateComment();

  return useMutation({
    mutationFn: async (payload: { commentId: string; body: string }) => {
      const { data } = await api.patch(`/comments/${payload.commentId}`, {
        body: payload.body,
      });
      return data as Comment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', { taskId: data.taskId }],
      });
    },
  });
}

// Delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoDeleteComment();

  return useMutation({
    mutationFn: async (payload: { commentId: string; taskId: string }) => {
      await api.delete(`/comments/${payload.commentId}`);
      return payload;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['comments', { taskId: variables.taskId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks', variables.taskId],
      });
    },
  });
}
