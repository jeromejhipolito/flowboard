'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Loader2, AtSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MentionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface CommentFormProps {
  onSubmit: (body: string) => Promise<void>;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  parentCommentId?: string;
  members?: MentionUser[];
  onCancel?: () => void;
}

export function CommentForm({
  onSubmit,
  isSubmitting = false,
  placeholder = 'Write a comment...',
  autoFocus = false,
  parentCommentId,
  members = [],
  onCancel,
}: CommentFormProps) {
  const [body, setBody] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMembers = members.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return fullName.includes(mentionFilter.toLowerCase());
  });

  useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  // Reset mention index when filter changes
  useEffect(() => {
    setMentionIndex(0);
  }, [mentionFilter]);

  const handleSubmit = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed || isSubmitting) return;
    await onSubmit(trimmed);
    setBody('');
  }, [body, isSubmitting, onSubmit]);

  const insertMention = useCallback(
    (member: MentionUser) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursorPos = textarea.selectionStart;
      const textBefore = body.substring(0, cursorPos);
      const textAfter = body.substring(cursorPos);

      // Find the @ that triggered the mention
      const atIndex = textBefore.lastIndexOf('@');
      if (atIndex === -1) return;

      const mention = `@${member.firstName} ${member.lastName}`;
      const newText = textBefore.substring(0, atIndex) + mention + ' ' + textAfter;
      setBody(newText);
      setShowMentions(false);
      setMentionFilter('');

      // Restore focus
      setTimeout(() => {
        const newCursor = atIndex + mention.length + 1;
        textarea.focus();
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    },
    [body],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit with Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Handle mention navigation
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : 0,
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMembers.length - 1,
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    // Cancel reply on Escape
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBody(value);

    // Check for @ mentions
    const cursorPos = e.target.selectionStart;
    const textBefore = value.substring(0, cursorPos);
    const atMatch = textBefore.match(/@(\w*)$/);

    if (atMatch && members.length > 0) {
      setShowMentions(true);
      setMentionFilter(atMatch[1]);
    } else {
      setShowMentions(false);
      setMentionFilter('');
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={parentCommentId ? 2 : 3}
          className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={isSubmitting}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-1 right-1 h-8 w-8"
          onClick={handleSubmit}
          disabled={!body.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <AtSign className="h-3 w-3" />
          <span>Mention with @</span>
          <span className="mx-1">|</span>
          <span>Ctrl+Enter to send</span>
        </div>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 px-2 text-xs"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Mention dropdown */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 z-20 mb-1 w-64 rounded-md border border-border bg-card py-1 shadow-lg">
          {filteredMembers.map((member, index) => (
            <button
              key={member.id}
              onClick={() => insertMention(member)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors',
                index === mentionIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent',
              )}
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {member.firstName.charAt(0)}
                {member.lastName.charAt(0)}
              </div>
              <span>
                {member.firstName} {member.lastName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
