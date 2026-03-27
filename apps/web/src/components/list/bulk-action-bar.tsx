'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { useUpdateTask } from '@/hooks/use-tasks';
import {
  TASK_STATUS_OPTIONS,
  type TaskStatus,
} from '@/lib/constants';

interface BulkActionBarProps {
  selectedIds: Set<string>;
  onClearSelection: () => void;
  members: { id: string; firstName: string; lastName: string }[];
}

export function BulkActionBar({
  selectedIds,
  onClearSelection,
  members,
}: BulkActionBarProps) {
  const updateTask = useUpdateTask();
  const [isUpdating, setIsUpdating] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const memberOptions = [
    { value: '', label: 'Select member...' },
    ...members.map((m) => ({
      value: m.id,
      label: `${m.firstName} ${m.lastName}`,
    })),
  ];

  const statusOptions = [
    { value: '', label: 'Select status...' },
    ...TASK_STATUS_OPTIONS,
  ];

  const handleBulkStatusChange = async (status: string) => {
    if (!status) return;
    setIsUpdating(true);
    try {
      const promises = Array.from(selectedIds).map((taskId) =>
        updateTask.mutateAsync({
          taskId,
          data: { status: status as TaskStatus },
        }),
      );
      await Promise.all(promises);
      toast.success(`Updated ${count} tasks`);
      onClearSelection();
    } catch {
      toast.error('Failed to update some tasks');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkAssigneeChange = async (assigneeId: string) => {
    if (!assigneeId) return;
    setIsUpdating(true);
    try {
      const promises = Array.from(selectedIds).map((taskId) =>
        updateTask.mutateAsync({
          taskId,
          data: { assigneeId },
        }),
      );
      await Promise.all(promises);
      toast.success(`Assigned ${count} tasks`);
      onClearSelection();
    } catch {
      toast.error('Failed to assign some tasks');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-lg">
      {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}

      <span className="text-sm font-medium text-foreground">
        {count} task{count !== 1 ? 's' : ''} selected
      </span>

      {count > 20 && (
        <span className="flex items-center gap-1 text-xs text-amber-500">
          <AlertTriangle className="h-3 w-3" />
          Large selection
        </span>
      )}

      <div className="h-5 w-px bg-border" />

      <div className="w-36">
        <Select
          options={statusOptions}
          value=""
          onChange={(e) => handleBulkStatusChange(e.target.value)}
          disabled={isUpdating}
          aria-label="Bulk change status"
        />
      </div>

      {members.length > 0 && (
        <div className="w-40">
          <Select
            options={memberOptions}
            value=""
            onChange={(e) => handleBulkAssigneeChange(e.target.value)}
            disabled={isUpdating}
            aria-label="Bulk assign to"
          />
        </div>
      )}

      <div className="h-5 w-px bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={isUpdating}
      >
        <X className="mr-1 h-3 w-3" />
        Clear
      </Button>
    </div>
  );
}
