'use client';

import { useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_STATUS_ORDER,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type TaskStatus,
} from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { TaskListRow } from './task-list-row';
import type { Task } from '@/hooks/use-tasks';
import type { Sprint } from '@/hooks/use-sprints';

export type SortColumn = 'title' | 'status' | 'priority' | 'assignee' | 'sprint' | 'dueDate' | 'storyPoints';
export type SortDirection = 'asc' | 'desc';

interface TaskListProps {
  tasks: Task[];
  sortBy: SortColumn;
  sortDir: SortDirection;
  onSort: (column: SortColumn) => void;
  onTaskClick: (taskId: string) => void;
  selectedIds: Set<string>;
  onSelect: (taskId: string, checked: boolean) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (status: string) => void;
  searchQuery?: string | null;
  sprints?: Sprint[];
}

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const STATUS_ORDER: Record<string, number> = {
  BACKLOG: 0,
  TODO: 1,
  IN_PROGRESS: 2,
  IN_REVIEW: 3,
  DONE: 4,
};

function SortHeader({
  label,
  column,
  currentSort,
  currentDir,
  onSort,
  className,
}: {
  label: string;
  column: SortColumn;
  currentSort: SortColumn;
  currentDir: SortDirection;
  onSort: (column: SortColumn) => void;
  className?: string;
}) {
  const isActive = currentSort === column;

  return (
    <th
      className={cn('px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground', className)}
      aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <button
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        {isActive && (
          currentDir === 'asc' ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        )}
      </button>
    </th>
  );
}

export function TaskList({
  tasks,
  sortBy,
  sortDir,
  onSort,
  onTaskClick,
  selectedIds,
  onSelect,
  collapsedGroups,
  onToggleGroup,
  searchQuery,
  sprints = [],
}: TaskListProps) {
  // Build a lookup map from sprintId -> sprint name
  const sprintMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of sprints) {
      map[s.id] = s.name;
    }
    return map;
  }, [sprints]);
  // Sort tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      let cmp = 0;

      switch (sortBy) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
          break;
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
          break;
        case 'assignee': {
          const aName = a.assignee ? `${a.assignee.firstName} ${a.assignee.lastName}` : 'zzz';
          const bName = b.assignee ? `${b.assignee.firstName} ${b.assignee.lastName}` : 'zzz';
          cmp = aName.localeCompare(bName);
          break;
        }
        case 'sprint': {
          const aName = a.sprintId ? (sprintMap[a.sprintId] ?? '') : 'zzz';
          const bName = b.sprintId ? (sprintMap[b.sprintId] ?? '') : 'zzz';
          cmp = aName.localeCompare(bName);
          break;
        }
        case 'dueDate': {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = aDate - bDate;
          break;
        }
        case 'storyPoints':
          cmp = (a.storyPoints ?? -1) - (b.storyPoints ?? -1);
          break;
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [tasks, sortBy, sortDir]);

  // Group tasks by status
  const grouped = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const status of TASK_STATUS_ORDER) {
      groups[status] = [];
    }
    for (const task of sortedTasks) {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    }
    return groups;
  }, [sortedTasks]);

  const allIds = tasks.map((t) => t.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
  const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            <th className="w-10 px-3 py-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={(e) => {
                  for (const id of allIds) {
                    onSelect(id, e.target.checked);
                  }
                }}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                aria-label="Select all tasks"
              />
            </th>
            <SortHeader label="Title" column="title" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Status" column="status" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Priority" column="priority" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Assignee" column="assignee" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Sprint" column="sprint" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Due Date" column="dueDate" currentSort={sortBy} currentDir={sortDir} onSort={onSort} />
            <SortHeader label="Points" column="storyPoints" currentSort={sortBy} currentDir={sortDir} onSort={onSort} className="text-center" />
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={8} className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Inbox className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No tasks found</p>
                </div>
              </td>
            </tr>
          )}
          {TASK_STATUS_ORDER.map((status) => {
            const statusTasks = grouped[status] ?? [];
            if (statusTasks.length === 0) return null;

            const isCollapsed = collapsedGroups.has(status);
            const statusColor = TASK_STATUS_COLORS[status as TaskStatus];
            const statusLabel = TASK_STATUS_LABELS[status as TaskStatus];

            return (
              <GroupSection key={status}>
                {/* Group header row */}
                <tr
                  className="cursor-pointer border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  onClick={() => onToggleGroup(status)}
                >
                  <td colSpan={8} className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span className="text-sm font-semibold text-foreground">
                        {statusLabel}
                      </span>
                      <Badge variant="secondary" className="h-5 min-w-[20px] rounded-full bg-muted px-1.5 text-[11px]">
                        {statusTasks.length}
                      </Badge>
                    </div>
                  </td>
                </tr>
                {/* Task rows */}
                {!isCollapsed &&
                  statusTasks.map((task) => (
                    <TaskListRow
                      key={task.id}
                      task={task}
                      isSelected={selectedIds.has(task.id)}
                      onSelect={onSelect}
                      onTaskClick={onTaskClick}
                      searchQuery={searchQuery}
                      sprintName={task.sprintId ? sprintMap[task.sprintId] : undefined}
                    />
                  ))}
              </GroupSection>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Wrapper fragment for grouping rows */
function GroupSection({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
