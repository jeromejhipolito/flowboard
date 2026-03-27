'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type TaskStatus,
} from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskCard } from './task-card';
import type { Task } from '@/hooks/use-tasks';
import type { CardDensity } from '@/stores/board-store';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
  isOverColumn: boolean;
  density?: CardDensity;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchQuery?: string | null;
}

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
  isOverColumn,
  density = 'expanded',
  isCollapsed = false,
  onToggleCollapse,
  searchQuery,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: {
      type: 'column',
      status,
    },
  });

  const statusColor = TASK_STATUS_COLORS[status];
  const statusLabel = TASK_STATUS_LABELS[status];
  const highlighted = isOver || isOverColumn;

  // Collapsed column: narrow vertical strip
  if (isCollapsed) {
    return (
      <div
        ref={setNodeRef}
        className={cn(
          'flex h-full w-[48px] min-w-[48px] flex-col items-center overflow-hidden rounded-lg border border-border bg-muted/40 dark:bg-card/60 transition-colors duration-200',
          highlighted && 'bg-primary/5 ring-2 ring-primary/20',
        )}
      >
        {/* Colored top accent bar */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: statusColor }}
        />

        {/* Toggle button */}
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center py-2 hover:bg-accent/50 transition-colors"
          aria-label={`Expand ${statusLabel} column`}
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Vertical label + count */}
        <div className="flex flex-1 flex-col items-center gap-2 py-2">
          <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full bg-muted px-1.5 text-[11px]">
            {tasks.length}
          </Badge>
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: statusColor,
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-[280px] min-w-[280px] flex-col overflow-hidden rounded-lg border border-border bg-muted/40 dark:bg-card/60">
      {/* Colored top accent bar */}
      <div
        className="h-[3px] w-full"
        style={{ background: statusColor }}
      />

      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-sm p-0.5 hover:bg-accent transition-colors"
            aria-label={`Collapse ${statusLabel} column`}
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />
          </button>
        )}
        <h3
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: statusColor }}
        >
          {statusLabel}
        </h3>
        <Badge variant="secondary" className="ml-auto h-5 min-w-[20px] rounded-full bg-muted px-1.5 text-[11px]">
          {tasks.length}
        </Badge>
      </div>

      {/* Droppable area with sortable cards */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 transition-colors duration-200',
          highlighted && 'rounded-md bg-primary/5 ring-2 ring-primary/20',
        )}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
              density={density}
              searchQuery={searchQuery}
            />
          ))}
        </SortableContext>

        {/* Empty state / drop hint */}
        {tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-md border-2 border-dashed border-border py-8 text-center">
            <p className="text-xs text-muted-foreground">
              Drop tasks here
            </p>
          </div>
        )}
      </div>

      {/* Add task button */}
      <div className="px-2 pb-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => onAddTask(status)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add task
        </Button>
      </div>
    </div>
  );
}
