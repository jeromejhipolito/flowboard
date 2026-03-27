'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FocusTrap from 'focus-trap-react';
import { format, isPast } from 'date-fns';
import {
  X,
  Calendar,
  Loader2,
  CheckSquare,
  Square,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  TASK_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  PRIORITY_COLORS,
  TASK_STATUS_COLORS,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTask, useUpdateTask, useDeleteTask, useCreateTask } from '@/hooks/use-tasks';
import { useSprints } from '@/hooks/use-sprints';
import { useTaskActivity } from '@/hooks/use-activity';
import { useAuth } from '@/hooks/use-auth';
import { useBoardStore } from '@/stores/board-store';
import { ActivityFeed } from '@/components/activity/activity-feed';
import { CommentSection } from '@/components/comments/comment-section';
import { DueDateTimezoneBreakdown } from '@/components/board/due-date-timezone';

interface TaskDetailPanelProps {
  taskId: string | null;
  projectId: string;
  onClose: () => void;
  members?: { id: string; firstName: string; lastName: string; avatarUrl?: string }[];
}

export function TaskDetailPanel({
  taskId,
  projectId,
  onClose,
  members = [],
}: TaskDetailPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();
  const { data: task, isLoading } = useTask(taskId ?? '');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const { updateTask: updateBoardTask, removeTask } = useBoardStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [descriptionValue, setDescriptionValue] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isOpen = !!taskId;

  // Sync URL query param
  useEffect(() => {
    if (taskId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('task', taskId);
      router.replace(`?${params.toString()}`, { scroll: false });
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('task');
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      });
    }
  }, [taskId, router, searchParams]);

  // Initialize form values from task
  useEffect(() => {
    if (task) {
      setTitleValue(task.title);
      setDescriptionValue(task.description ?? '');
    }
  }, [task]);

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleTitleSave = useCallback(async () => {
    setIsEditingTitle(false);
    if (!task || titleValue.trim() === task.title) return;
    if (!titleValue.trim()) {
      setTitleValue(task.title);
      return;
    }
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: { title: titleValue.trim() },
      });
      updateBoardTask(task.id, { title: titleValue.trim() });
    } catch {
      toast.error('Failed to update title');
      setTitleValue(task.title);
    }
  }, [task, titleValue, updateTask, updateBoardTask]);

  const handleDescriptionSave = useCallback(async () => {
    setIsEditingDescription(false);
    if (!task || descriptionValue === (task.description ?? '')) return;
    try {
      await updateTask.mutateAsync({
        taskId: task.id,
        data: { description: descriptionValue },
      });
    } catch {
      toast.error('Failed to update description');
      setDescriptionValue(task.description ?? '');
    }
  }, [task, descriptionValue, updateTask]);

  const handleFieldChange = useCallback(
    async (field: string, value: string | null) => {
      if (!task) return;
      try {
        await updateTask.mutateAsync({
          taskId: task.id,
          data: { [field]: value || null },
        });
        updateBoardTask(task.id, { [field]: value || null } as any);
        toast.success('Task updated');
      } catch {
        toast.error('Failed to update task');
      }
    },
    [task, updateTask, updateBoardTask],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!task) return;
    try {
      await deleteTask.mutateAsync({ taskId: task.id, projectId });
      removeTask(task.id);
      toast.success('Task deleted');
      setDeleteConfirmOpen(false);
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
  }, [task, deleteTask, projectId, removeTask, onClose]);

  const handleAddSubtask = useCallback(async () => {
    if (!task || !newSubtaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({
        projectId,
        title: newSubtaskTitle.trim(),
        parentTaskId: task.id,
        status: 'TODO',
      });
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
      toast.success('Subtask created');
    } catch {
      toast.error('Failed to create subtask');
    }
  }, [task, newSubtaskTitle, createTask, projectId]);

  const { data: sprints = [] } = useSprints(projectId);

  // Show ACTIVE and PLANNING sprints + None option
  const sprintOptions = [
    { value: '', label: 'None (backlog)' },
    ...sprints
      .filter((s) => s.status === 'ACTIVE' || s.status === 'PLANNING')
      .map((s) => ({
        value: s.id,
        label: `${s.name}${s.status === 'ACTIVE' ? ' (Active)' : ''}`,
      })),
  ];

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.id,
      label: `${m.firstName} ${m.lastName}`,
    })),
  ];

  const isOverdue =
    task?.dueDate &&
    isPast(new Date(task.dueDate)) &&
    task.status !== 'DONE';

  return (
    <FocusTrap
      active={isOpen && !isLoading && !!task}
      focusTrapOptions={{
        allowOutsideClick: true,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
        fallbackFocus: '[data-task-panel]',
      }}
    >
      <div data-task-panel tabIndex={-1}>
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/30 transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Slide-over panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Task details"
          className={cn(
            'fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out',
            isOpen ? 'translate-x-0' : 'translate-x-full',
          )}
        >
        {isLoading ? (
          <div className="p-6">
            <div className="mb-4 flex justify-end">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <Skeleton variant="text" className="h-8 w-3/4" />
              <Skeleton variant="text" className="h-5 w-full" />
              <Skeleton variant="text" className="h-5 w-1/2" />
              <Skeleton variant="card" className="h-40" />
            </div>
          </div>
        ) : task ? (
          <div className="flex h-full flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border p-4">
              <div className="flex-1 pr-4">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') {
                        setTitleValue(task.title);
                        setIsEditingTitle(false);
                      }
                    }}
                    className="w-full border-none bg-transparent text-lg font-semibold text-foreground outline-none focus:ring-0"
                  />
                ) : (
                  <h2
                    className="cursor-text text-lg font-semibold text-foreground hover:text-primary"
                    onClick={() => setIsEditingTitle(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setIsEditingTitle(true);
                    }}
                  >
                    {task.title}
                  </h2>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Created {format(new Date(task.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Metadata bar */}
            <div className="space-y-3 border-b border-border p-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Status"
                  options={TASK_STATUS_OPTIONS}
                  value={task.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                />
                <Select
                  label="Priority"
                  options={PRIORITY_OPTIONS}
                  value={task.priority}
                  onChange={(e) => handleFieldChange('priority', e.target.value)}
                />
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-3">
                {task.assignee && (
                  <Avatar className="h-7 w-7">
                    {task.assignee.avatarUrl && (
                      <AvatarImage
                        src={task.assignee.avatarUrl}
                        alt={`${task.assignee.firstName} ${task.assignee.lastName}`}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {`${task.assignee.firstName?.charAt(0) ?? ''}${task.assignee.lastName?.charAt(0) ?? ''}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Select
                  label="Assignee"
                  options={memberOptions}
                  value={task.assigneeId ?? ''}
                  onChange={(e) =>
                    handleFieldChange('assigneeId', e.target.value || null)
                  }
                  className="flex-1"
                />
              </div>

              {/* Sprint */}
              <Select
                label="Sprint"
                options={sprintOptions}
                value={task.sprintId ?? ''}
                onChange={(e) =>
                  handleFieldChange('sprintId', e.target.value || null)
                }
              />

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">
                  Due Date
                </label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={
                      task.dueDate
                        ? format(new Date(task.dueDate), 'yyyy-MM-dd')
                        : ''
                    }
                    onChange={(e) =>
                      handleFieldChange(
                        'dueDate',
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      )
                    }
                    className={cn(
                      'flex-1',
                      isOverdue && 'border-destructive text-destructive',
                    )}
                  />
                </div>
                {isOverdue && (
                  <p className="text-xs font-medium text-destructive">
                    This task is overdue
                  </p>
                )}
                {task.dueDate && (
                  <DueDateTimezoneBreakdown
                    dueDate={task.dueDate}
                    assignee={task.assignee ?? undefined}
                    viewerTimezone={currentUser?.timezone}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-border p-4">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Description
              </label>
              {isEditingDescription ? (
                <textarea
                  rows={4}
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  onBlur={handleDescriptionSave}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Add a description..."
                  autoFocus
                />
              ) : (
                <div
                  className="min-h-[60px] cursor-text rounded-md border border-transparent px-3 py-2 text-sm text-foreground hover:border-border"
                  onClick={() => setIsEditingDescription(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setIsEditingDescription(true);
                  }}
                >
                  {task.description ? (
                    <p className="whitespace-pre-wrap">{task.description}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Click to add a description...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="border-b border-border p-4">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Labels
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {task.labels.map((tl) => (
                    <Badge
                      key={tl.labelId}
                      className="text-white"
                      style={{ backgroundColor: tl.label.color }}
                    >
                      {tl.label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            <div className="border-b border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Subtasks
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingSubtask(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
              {task.childTasks && task.childTasks.length > 0 ? (
                <ul className="space-y-1.5">
                  {task.childTasks.map((child) => (
                    <li key={child.id} className="flex items-center gap-2">
                      {child.status === 'DONE' ? (
                        <CheckSquare className="h-4 w-4 text-green-500" />
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          child.status === 'DONE' &&
                            'text-muted-foreground line-through',
                        )}
                      >
                        {child.title}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-auto h-4 px-1 text-[9px]"
                        style={{
                          borderColor:
                            PRIORITY_COLORS[child.priority as TaskPriority],
                          color:
                            PRIORITY_COLORS[child.priority as TaskPriority],
                        }}
                      >
                        {child.priority}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : !isAddingSubtask ? (
                <p className="text-sm text-muted-foreground">No subtasks yet</p>
              ) : null}
              {isAddingSubtask && (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Subtask title..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubtask();
                      if (e.key === 'Escape') {
                        setIsAddingSubtask(false);
                        setNewSubtaskTitle('');
                      }
                    }}
                    autoFocus
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSubtask}
                    disabled={!newSubtaskTitle.trim()}
                  >
                    {createTask.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="border-b border-border p-4">
              <CommentSection taskId={task.id} members={members} />
            </div>

            {/* Activity */}
            <TaskActivitySection taskId={task.id} />

            {/* Actions */}
            <div className="mt-auto p-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deleteTask.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </Button>
            </div>

            <ConfirmDialog
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
              title="Delete Task"
              description="Are you sure? This cannot be undone."
              confirmLabel="Delete"
              onConfirm={handleDeleteConfirm}
              isLoading={deleteTask.isPending}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-muted-foreground">Task not found</p>
          </div>
        )}
      </div>
      </div>
    </FocusTrap>
  );
}

// --- Internal sub-component for task activity ---

function TaskActivitySection({ taskId }: { taskId: string }) {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTaskActivity(taskId);

  const allEntries = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return (
    <div className="border-b border-border p-4">
      <p className="mb-2 text-sm font-medium text-foreground">Activity</p>
      <ActivityFeed
        entries={allEntries}
        isLoading={isLoading}
        hasMore={hasNextPage}
        onLoadMore={() => fetchNextPage()}
        isLoadingMore={isFetchingNextPage}
      />
    </div>
  );
}
