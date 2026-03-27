'use client';

import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentItem } from './comment-item';
import type { Comment } from '@/hooks/use-comments';

interface MentionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CommentListProps {
  comments: Comment[];
  taskId: string;
  isLoading: boolean;
  onReplySubmit: (body: string, parentCommentId: string) => Promise<void>;
  isSubmittingReply?: boolean;
  members?: MentionUser[];
}

/**
 * Organises flat comments into a threaded structure where top-level comments
 * contain their nested replies.
 */
function buildThreadedComments(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const topLevel: Comment[] = [];

  // First pass – index by id and initialise reply array
  for (const comment of comments) {
    commentMap.set(comment.id, { ...comment, replies: [] });
  }

  // Second pass – attach replies to parents
  for (const comment of commentMap.values()) {
    if (comment.parentCommentId) {
      const parent = commentMap.get(comment.parentCommentId);
      if (parent) {
        parent.replies = parent.replies ?? [];
        parent.replies.push(comment);
      } else {
        // Parent not found – treat as top-level
        topLevel.push(comment);
      }
    } else {
      topLevel.push(comment);
    }
  }

  return topLevel;
}

export function CommentList({
  comments,
  taskId,
  isLoading,
  onReplySubmit,
  isSubmittingReply,
  members = [],
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton variant="circle" className="h-7 w-7" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="h-4 w-32" />
              <Skeleton variant="text" className="h-4 w-full" />
              <Skeleton variant="text" className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No comments yet</p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          Be the first to comment
        </p>
      </div>
    );
  }

  const threaded = buildThreadedComments(comments);

  return (
    <div className="divide-y divide-border">
      {threaded.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          taskId={taskId}
          onReplySubmit={onReplySubmit}
          isSubmittingReply={isSubmittingReply}
          members={members}
        />
      ))}
    </div>
  );
}
