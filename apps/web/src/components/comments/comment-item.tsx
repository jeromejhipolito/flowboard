'use client';

import { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Reply, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useUpdateComment, useDeleteComment } from '@/hooks/use-comments';
import { CommentForm } from './comment-form';
import type { Comment } from '@/hooks/use-comments';

interface MentionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CommentItemProps {
  comment: Comment;
  taskId: string;
  depth?: number;
  onReplySubmit: (body: string, parentCommentId: string) => Promise<void>;
  isSubmittingReply?: boolean;
  members?: MentionUser[];
}

export function CommentItem({
  comment,
  taskId,
  depth = 0,
  onReplySubmit,
  isSubmittingReply,
  members = [],
}: CommentItemProps) {
  const { user } = useAuth();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(comment.body);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const isOwnComment = user?.id === comment.authorId;
  const authorInitials = `${comment.author.firstName.charAt(0)}${comment.author.lastName.charAt(0)}`.toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

  const handleEditSave = useCallback(async () => {
    const trimmed = editBody.trim();
    if (!trimmed || trimmed === comment.body) {
      setIsEditing(false);
      setEditBody(comment.body);
      return;
    }
    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        body: trimmed,
      });
      setIsEditing(false);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  }, [editBody, comment, updateComment]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment.mutateAsync({
        commentId: comment.id,
        taskId,
      });
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  }, [comment.id, taskId, deleteComment]);

  const handleReply = useCallback(
    async (body: string) => {
      await onReplySubmit(body, comment.id);
      setShowReplyForm(false);
    },
    [comment.id, onReplySubmit],
  );

  const hasReplies = comment.replies && comment.replies.length > 0;
  const hiddenRepliesCount =
    hasReplies && !showReplies ? comment.replies!.length : 0;

  return (
    <div className={cn('group', depth > 0 && 'ml-8 border-l-2 border-border pl-4')}>
      <div className="flex items-start gap-3 py-2">
        <Avatar className="h-7 w-7 shrink-0">
          {comment.author.avatarUrl && (
            <AvatarImage
              src={comment.author.avatarUrl}
              alt={`${comment.author.firstName} ${comment.author.lastName}`}
            />
          )}
          <AvatarFallback className="text-[10px]">
            {authorInitials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          {/* Author name + timestamp */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {comment.editedAt && (
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[9px]"
              >
                Edited
              </Badge>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                autoFocus
              />
              <div className="mt-1 flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEditSave}
                  disabled={updateComment.isPending}
                  className="h-7 px-3 text-xs"
                >
                  {updateComment.isPending ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : null}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditBody(comment.body);
                  }}
                  className="h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
              {comment.body}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="mt-1 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {depth < 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="h-6 px-2 text-xs text-muted-foreground"
                >
                  <Reply className="mr-1 h-3 w-3" />
                  Reply
                </Button>
              )}
              {isOwnComment && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditBody(comment.body);
                      setIsEditing(true);
                    }}
                    className="h-6 px-2 text-xs text-muted-foreground"
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteComment.isPending}
                    className="h-6 px-2 text-xs text-destructive"
                  >
                    {deleteComment.isPending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="mr-1 h-3 w-3" />
                    )}
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleReply}
                isSubmitting={isSubmittingReply}
                placeholder="Write a reply..."
                autoFocus
                parentCommentId={comment.id}
                members={members}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <>
          {comment.replies!.length > 2 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="mb-1 ml-10 text-xs font-medium text-primary hover:underline"
            >
              {showReplies
                ? 'Hide replies'
                : `Show ${hiddenRepliesCount} ${hiddenRepliesCount === 1 ? 'reply' : 'replies'}`}
            </button>
          )}
          {showReplies &&
            comment.replies!.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                taskId={taskId}
                depth={depth + 1}
                onReplySubmit={onReplySubmit}
                isSubmittingReply={isSubmittingReply}
                members={members}
              />
            ))}
        </>
      )}
    </div>
  );
}
