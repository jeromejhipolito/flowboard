'use client';

import { useState, useMemo } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  type TaskStatus,
} from '@/lib/constants';
import { useBoardStore } from '@/stores/board-store';
import { useCompleteSprint, useSprints, type Sprint } from '@/hooks/use-sprints';

interface CompleteSprintDialogProps {
  sprint: Sprint | null;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompleteSprintDialog({
  sprint,
  projectId,
  open,
  onOpenChange,
}: CompleteSprintDialogProps) {
  const [destination, setDestination] = useState<'backlog' | string>('backlog');
  const completeSprint = useCompleteSprint();
  const { columns } = useBoardStore();
  const { data: sprints = [] } = useSprints(projectId);

  // Find next sprint candidates (PLANNING sprints)
  const nextSprintCandidates = useMemo(
    () => sprints.filter((s) => s.status === 'PLANNING'),
    [sprints],
  );

  // Derive task summary from board store
  const { doneCount, incompleteCount, incompleteTasks, totalCount, progressPct } =
    useMemo(() => {
      const allTasks = Object.values(columns).flat();
      const done = allTasks.filter((t) => t.status === 'DONE');
      const incomplete = allTasks.filter((t) => t.status !== 'DONE');
      const total = allTasks.length;
      const pct = total > 0 ? Math.round((done.length / total) * 100) : 0;
      return {
        doneCount: done.length,
        incompleteCount: incomplete.length,
        incompleteTasks: incomplete,
        totalCount: total,
        progressPct: pct,
      };
    }, [columns]);

  const handleComplete = async () => {
    if (!sprint) return;
    try {
      await completeSprint.mutateAsync({
        sprintId: sprint.id,
        projectId,
        nextSprintId:
          destination !== 'backlog' ? destination : undefined,
      });
      toast.success('Sprint completed successfully');
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to complete sprint',
      );
    }
  };

  if (!sprint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Complete Sprint: {sprint.name}
          </DialogTitle>
          <DialogDescription>
            Review the sprint summary and choose what to do with incomplete
            tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {doneCount} / {totalCount} tasks done ({progressPct}%)
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Task summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-green-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {doneCount}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-lg border border-border bg-amber-500/10 p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {incompleteCount}
              </p>
              <p className="text-xs text-muted-foreground">Incomplete</p>
            </div>
          </div>

          {/* Incomplete tasks list */}
          {incompleteTasks.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Incomplete tasks:
              </p>
              <div className="max-h-32 overflow-y-auto rounded-md border border-border">
                {incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 border-b border-border px-3 py-1.5 last:border-b-0"
                  >
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px] text-white"
                      style={{
                        backgroundColor:
                          TASK_STATUS_COLORS[task.status as TaskStatus],
                      }}
                    >
                      {TASK_STATUS_LABELS[task.status as TaskStatus]}
                    </Badge>
                    <span className="truncate text-sm text-foreground">
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination for incomplete tasks */}
          {incompleteCount > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Move incomplete tasks to:
              </p>
              <div className="space-y-1.5">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 transition-colors hover:bg-accent">
                  <input
                    type="radio"
                    name="destination"
                    value="backlog"
                    checked={destination === 'backlog'}
                    onChange={() => setDestination('backlog')}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Move to backlog</span>
                </label>
                {nextSprintCandidates.map((s) => (
                  <label
                    key={s.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2.5 transition-colors hover:bg-accent"
                  >
                    <input
                      type="radio"
                      name="destination"
                      value={s.id}
                      checked={destination === s.id}
                      onChange={() => setDestination(s.id)}
                      className="h-4 w-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">
                      Move to {s.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="ml-auto text-[10px]"
                    >
                      Planning
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Warning */}
          <p className="text-xs font-medium text-destructive">
            This cannot be undone. Completed tasks will remain in Done.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleComplete}
            disabled={completeSprint.isPending}
          >
            {completeSprint.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Complete Sprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
