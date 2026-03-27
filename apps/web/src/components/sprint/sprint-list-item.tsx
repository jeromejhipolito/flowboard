'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSprintTasks, type Sprint } from '@/hooks/use-sprints';
import type { Task } from '@/hooks/use-tasks';

// --- Health Score Computation ---

function computeHealthScore(
  sprint: Sprint,
  doneTasks: number,
  totalTasks: number,
): number {
  if (totalTasks === 0) return 0;

  const completionRate = doneTasks / totalTasks;
  const carryoverRate = sprint.carriedOver
    ? sprint.carriedOver / totalTasks
    : 0;
  const scopeChangeRate = sprint.scopeAtStart
    ? Math.abs(totalTasks - sprint.scopeAtStart) / sprint.scopeAtStart
    : 0;

  const healthScore = Math.round(
    (completionRate * 0.5 +
      (1 - carryoverRate) * 0.3 +
      (1 - scopeChangeRate) * 0.2) *
      100,
  );

  return Math.max(0, Math.min(100, healthScore));
}

function HealthBadge({ score }: { score: number }) {
  let colorClass: string;
  if (score >= 70) {
    colorClass = 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
  } else if (score >= 40) {
    colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
  } else {
    colorClass = 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
  }

  return (
    <Badge variant="outline" className={cn('text-[11px] font-semibold', colorClass)}>
      Health: {score}%
    </Badge>
  );
}

// --- Progress Bar ---

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

// --- Mini task row for expanded view ---

function SprintTaskRow({
  task,
  onTaskClick,
}: {
  task: Task;
  onTaskClick?: (taskId: string) => void;
}) {
  const statusColor = TASK_STATUS_COLORS[task.status as TaskStatus];
  const statusLabel = TASK_STATUS_LABELS[task.status as TaskStatus];
  const priorityColor = PRIORITY_COLORS[task.priority as TaskPriority];
  const priorityLabel = PRIORITY_LABELS[task.priority as TaskPriority];

  const assigneeInitials = task.assignee
    ? `${task.assignee.firstName?.charAt(0) ?? ''}${task.assignee.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : null;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent/50"
      onClick={() => onTaskClick?.(task.id)}
    >
      <span className="flex-1 truncate text-sm text-foreground">
        {task.title}
      </span>
      <Badge
        variant="secondary"
        className="shrink-0 text-[10px] font-semibold text-white"
        style={{ backgroundColor: statusColor }}
      >
        {statusLabel}
      </Badge>
      <Badge
        variant="outline"
        className="shrink-0 text-[10px] font-semibold"
        style={{ borderColor: priorityColor, color: priorityColor }}
      >
        {priorityLabel}
      </Badge>
      {task.assignee && (
        <Avatar className="h-5 w-5 shrink-0">
          {task.assignee.avatarUrl && (
            <AvatarImage
              src={task.assignee.avatarUrl}
              alt={`${task.assignee.firstName} ${task.assignee.lastName}`}
            />
          )}
          <AvatarFallback className="text-[9px]">
            {assigneeInitials}
          </AvatarFallback>
        </Avatar>
      )}
    </button>
  );
}

// --- Active Sprint Banner ---

interface ActiveSprintItemProps {
  sprint: Sprint;
  slug: string;
  projectId: string;
}

export function ActiveSprintItem({
  sprint,
  slug,
  projectId,
}: ActiveSprintItemProps) {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary text-primary-foreground text-[11px]">
            Active
          </Badge>
          <h3 className="text-sm font-semibold text-foreground">
            {sprint.name}
          </h3>
          {sprint.startDate && sprint.endDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(sprint.startDate), 'MMM d')} &ndash;{' '}
              {format(new Date(sprint.endDate), 'MMM d')}
            </span>
          )}
          {sprint._count && (
            <span className="text-xs text-muted-foreground">
              {sprint._count.tasks} tasks
            </span>
          )}
        </div>
        <a
          href={`/workspaces/${slug}/projects/${projectId}/board`}
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go to Board
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
      {sprint.goal && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Target className="mt-0.5 h-3 w-3 shrink-0" />
          {sprint.goal}
        </p>
      )}
    </div>
  );
}

// --- Completed Sprint Accordion Item ---

interface CompletedSprintItemProps {
  sprint: Sprint;
  projectId: string;
  onTaskClick?: (taskId: string) => void;
}

export function CompletedSprintItem({
  sprint,
  projectId,
  onTaskClick,
}: CompletedSprintItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: tasks, isLoading: tasksLoading } = useSprintTasks(
    projectId,
    isOpen ? sprint.id : '',
  );

  const doneTasks = tasks?.filter((t) => t.status === 'DONE') ?? [];
  const carriedOverTasks = tasks?.filter((t) => t.status !== 'DONE') ?? [];
  const totalTasks = tasks?.length ?? sprint._count?.tasks ?? 0;
  const doneCount = doneTasks.length;

  const healthScore = tasks
    ? computeHealthScore(sprint, doneCount, totalTasks)
    : null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Collapsed header */}
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <span className="flex-1 text-sm font-semibold text-foreground">
          {sprint.name}
        </span>

        {/* Dates */}
        {sprint.startDate && sprint.endDate && (
          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <Calendar className="h-3 w-3" />
            {format(new Date(sprint.startDate), 'MMM d')} &ndash;{' '}
            {format(new Date(sprint.endDate), 'MMM d, yyyy')}
          </span>
        )}

        {/* Completion badge */}
        <Badge variant="secondary" className="text-[11px]">
          {sprint._count?.tasks ?? totalTasks} tasks
        </Badge>

        {/* Inline mini progress bar */}
        {totalTasks > 0 && (
          <div className="hidden w-24 items-center gap-1.5 sm:flex">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500"
                style={{
                  width: `${Math.round((doneCount / totalTasks) * 100)}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {Math.round((doneCount / totalTasks) * 100)}%
            </span>
          </div>
        )}

        {/* Health badge (only if tasks loaded) */}
        {healthScore !== null && <HealthBadge score={healthScore} />}

        <Badge
          variant="outline"
          className="text-[11px] text-muted-foreground"
        >
          Completed
        </Badge>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="border-t border-border px-4 py-4">
          {tasksLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading sprint tasks...
              </span>
            </div>
          ) : (
            <>
              {/* Goal */}
              {sprint.goal && (
                <div className="mb-4 rounded-md bg-muted/50 p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Sprint Goal
                  </div>
                  <p className="text-sm text-foreground">{sprint.goal}</p>
                </div>
              )}

              {/* Full progress bar */}
              <div className="mb-4">
                <ProgressBar value={doneCount} max={totalTasks} />
              </div>

              {/* Health score (full display) */}
              {healthScore !== null && (
                <div className="mb-4">
                  <HealthBadge score={healthScore} />
                </div>
              )}

              {/* Two columns: DONE / CARRIED OVER */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Done */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Done ({doneTasks.length})
                    </h4>
                  </div>
                  <div className="space-y-0.5 rounded-md border border-border bg-muted/30 p-1">
                    {doneTasks.length === 0 ? (
                      <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                        No completed tasks
                      </p>
                    ) : (
                      doneTasks.map((task) => (
                        <SprintTaskRow
                          key={task.id}
                          task={task}
                          onTaskClick={onTaskClick}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Carried Over */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Carried Over ({carriedOverTasks.length})
                    </h4>
                  </div>
                  <div className="space-y-0.5 rounded-md border border-border bg-muted/30 p-1">
                    {carriedOverTasks.length === 0 ? (
                      <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                        No carried-over tasks
                      </p>
                    ) : (
                      carriedOverTasks.map((task) => (
                        <SprintTaskRow
                          key={task.id}
                          task={task}
                          onTaskClick={onTaskClick}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
