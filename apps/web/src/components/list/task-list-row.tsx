'use client';

import { format, isPast, isToday } from 'date-fns';
import { cn, highlightMatch } from '@/lib/utils';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Task } from '@/hooks/use-tasks';

interface TaskListRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: (taskId: string, checked: boolean) => void;
  onTaskClick: (taskId: string) => void;
  searchQuery?: string | null;
  sprintName?: string;
}

export function TaskListRow({
  task,
  isSelected,
  onSelect,
  onTaskClick,
  searchQuery,
  sprintName,
}: TaskListRowProps) {
  const statusColor = TASK_STATUS_COLORS[task.status as TaskStatus];
  const statusLabel = TASK_STATUS_LABELS[task.status as TaskStatus];
  const priorityColor = PRIORITY_COLORS[task.priority as TaskPriority];
  const priorityLabel = PRIORITY_LABELS[task.priority as TaskPriority];

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const assigneeInitials = task.assignee
    ? `${task.assignee.firstName?.charAt(0) ?? ''}${task.assignee.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : null;

  return (
    <tr
      className={cn(
        'group cursor-pointer border-b border-border transition-colors hover:bg-accent/50',
        isSelected && 'bg-primary/5',
      )}
      onClick={() => onTaskClick(task.id)}
    >
      {/* Checkbox */}
      <td className="w-10 px-3 py-2.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(task.id, e.target.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          aria-label={`Select task: ${task.title}`}
        />
      </td>

      {/* Title */}
      <td className="max-w-[300px] px-3 py-2.5">
        <span className="text-sm font-medium text-foreground line-clamp-1">
          {highlightMatch(task.title, searchQuery)}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-2.5">
        <Badge
          variant="secondary"
          className="text-[11px] font-semibold text-white"
          style={{ backgroundColor: statusColor }}
        >
          {statusLabel}
        </Badge>
      </td>

      {/* Priority */}
      <td className="px-3 py-2.5">
        <Badge
          variant="outline"
          className="text-[11px] font-semibold"
          style={{ borderColor: priorityColor, color: priorityColor }}
        >
          {priorityLabel}
        </Badge>
      </td>

      {/* Assignee */}
      <td className="px-3 py-2.5">
        {task.assignee ? (
          <div className="flex items-center gap-2">
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
            <span className="text-sm text-foreground">
              {task.assignee.firstName} {task.assignee.lastName}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </td>

      {/* Sprint */}
      <td className="px-3 py-2.5">
        {sprintName ? (
          <Badge variant="outline" className="text-[11px] font-medium">
            {sprintName}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        )}
      </td>

      {/* Due Date */}
      <td className="px-3 py-2.5">
        {task.dueDate ? (
          <span
            className={cn(
              'text-sm',
              isOverdue
                ? 'font-medium text-destructive'
                : isDueToday
                  ? 'font-medium text-amber-500'
                  : 'text-foreground',
            )}
          >
            {format(new Date(task.dueDate), 'MMM d, yyyy')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        )}
      </td>

      {/* Story Points */}
      <td className="px-3 py-2.5 text-center">
        {task.storyPoints != null ? (
          <span className="text-sm text-foreground">{task.storyPoints}</span>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        )}
      </td>
    </tr>
  );
}
