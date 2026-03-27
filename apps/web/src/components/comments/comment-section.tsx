'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useComments, useCreateComment } from '@/hooks/use-comments';
import { CommentList } from './comment-list';
import { CommentForm } from './comment-form';

interface MentionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CommentSectionProps {
  taskId: string;
  members?: MentionUser[];
}

export function CommentSection({ taskId, members = [] }: CommentSectionProps) {
  const { data, isLoading } = useComments(taskId);
  const createComment = useCreateComment();

  const comments = data?.comments ?? [];

  const handleCreateComment = useCallback(
    async (body: string) => {
      try {
        await createComment.mutateAsync({ taskId, body });
      } catch {
        toast.error('Failed to post comment');
      }
    },
    [taskId, createComment],
  );

  const handleReply = useCallback(
    async (body: string, parentCommentId: string) => {
      try {
        await createComment.mutateAsync({ taskId, body, parentCommentId });
      } catch {
        toast.error('Failed to post reply');
      }
    },
    [taskId, createComment],
  );

  return (
    <div className="space-y-4">
      <CommentForm
        onSubmit={handleCreateComment}
        isSubmitting={createComment.isPending}
        placeholder="Write a comment..."
        members={members}
      />

      <CommentList
        comments={comments}
        taskId={taskId}
        isLoading={isLoading}
        onReplySubmit={handleReply}
        isSubmittingReply={createComment.isPending}
        members={members}
      />
    </div>
  );
}
