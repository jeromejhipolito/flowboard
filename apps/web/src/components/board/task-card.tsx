'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, isPast, isToday } from 'date-fns';
import {
  Calendar,
  MessageSquare,
  GitBranch,
} from 'lucide-react';
import { cn, highlightMatch } from '@/lib/utils';
import { PRIORITY_COLORS, type TaskPriority } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '@/hooks/use-tasks';
import type { CardDensity } from '@/stores/board-store';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragOverlay?: boolean;
  density?: CardDensity;
  searchQuery?: string | null;
}

export function TaskCard({ task, onClick, isDragOverlay, density = 'expanded', searchQuery }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = PRIORITY_COLORS[task.priority as TaskPriority];
  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const assigneeInitials = task.assignee
    ? `${task.assignee.firstName?.charAt(0) ?? ''}${task.assignee.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : null;

  const allLabels = task.labels ?? [];
  const labels = allLabels.slice(0, 3);
  const extraLabelCount = allLabels.length - 3;
  const commentCount = task._count?.comments ?? 0;
  const subtaskCount = task._count?.childTasks ?? 0;

  const isCompact = density === 'compact';

  if (isCompact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        role="button"
        tabIndex={0}
        aria-roledescription="sortable task"
        aria-label={`Task: ${task.title}. Priority: ${task.priority}.`}
        aria-describedby="dnd-instructions"
        className={cn(
          'group relative cursor-grab overflow-hidden rounded-md border border-border bg-card py-2 pr-3 pl-5 shadow-sm transition-all hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isDragging && !isDragOverlay && 'opacity-30',
          isDragOverlay && 'rotate-2 scale-105 shadow-xl border-primary/50',
        )}
        onClick={(e) => {
          if (!isDragging) {
            e.stopPropagation();
            onClick();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isDragging) {
            e.stopPropagation();
            onClick();
          }
        }}
      >
        {/* Left priority accent bar — red tint when overdue */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md"
          style={{ backgroundColor: isOverdue ? 'var(--color-destructive)' : priorityColor }}
        />

        <div className="flex items-center gap-2">
          <p className="flex-1 truncate text-sm font-medium text-foreground">
            {highlightMatch(task.title, searchQuery)}
          </p>
          <Badge
            variant="outline"
            className="h-5 shrink-0 px-1.5 text-[10px] font-semibold"
            style={{
              borderColor: priorityColor,
              color: priorityColor,
            }}
          >
            {task.priority}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      aria-roledescription="sortable task"
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. ${isOverdue ? 'Overdue.' : ''}`}
      aria-describedby="dnd-instructions"
      className={cn(
        'group relative cursor-grab rounded-lg border border-border bg-card p-3 pl-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_4px_12px_rgba(91,79,245,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging && !isDragOverlay && 'opacity-30',
        isDragOverlay && 'rotate-2 scale-105 shadow-xl border-primary/50',
      )}
      onClick={(e) => {
        // Only trigger click if not dragging
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      {/* Left priority accent bar — red tint when overdue */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ backgroundColor: isOverdue ? 'var(--color-destructive)' : priorityColor }}
      />

      {/* Title — single line truncated */}
      <p className="text-sm font-medium text-foreground truncate">
        {highlightMatch(task.title, searchQuery)}
      </p>

      {/* Labels — single row, no wrap, overflow hidden */}
      {labels.length > 0 && (
        <div className="mt-1 flex items-center gap-1 overflow-hidden">
          {labels.map((tl) => (
            <span
              key={tl.labelId}
              className="shrink-0 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white"
              style={{ backgroundColor: tl.label.color }}
            >
              {tl.label.name}
            </span>
          ))}
          {extraLabelCount > 0 && (
            <span className="shrink-0 inline-block rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              +{extraLabelCount}
            </span>
          )}
        </div>
      )}

      {/* Bottom metadata row */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Priority badge */}
          <Badge
            variant="outline"
            className="h-5 px-1.5 text-[10px] font-semibold"
            style={{
              borderColor: priorityColor,
              color: priorityColor,
            }}
          >
            {task.priority}
          </Badge>

          {/* Due date */}
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-[11px]',
                isOverdue
                  ? 'font-medium text-destructive'
                  : isDueToday
                    ? 'font-medium text-amber-500'
                    : 'text-muted-foreground',
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}

          {/* Comment count */}
          {commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          )}

          {/* Subtask count */}
          {subtaskCount > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <GitBranch className="h-3 w-3" />
              {subtaskCount}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <Avatar className="h-6 w-6">
            {task.assignee.avatarUrl && (
              <AvatarImage
                src={task.assignee.avatarUrl}
                alt={`${task.assignee.firstName} ${task.assignee.lastName}`}
              />
            )}
            <AvatarFallback className="text-[10px]">
              {assigneeInitials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
