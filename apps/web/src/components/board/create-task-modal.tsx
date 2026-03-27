'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useCreateTask } from '@/hooks/use-tasks';
import {
  TASK_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  type TaskStatus,
} from '@/lib/constants';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(5000).optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultStatus?: TaskStatus;
  members?: { id: string; firstName: string; lastName: string }[];
}

export function CreateTaskModal({
  open,
  onOpenChange,
  projectId,
  defaultStatus = 'TODO',
  members = [],
}: CreateTaskModalProps) {
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: defaultStatus,
      priority: 'MEDIUM',
    },
  });

  const onSubmit = async (values: CreateTaskFormValues) => {
    try {
      await createTask.mutateAsync({
        projectId,
        title: values.title,
        description: values.description || undefined,
        status: (values.status as TaskStatus) || undefined,
        priority: (values.priority as any) || undefined,
        assigneeId: values.assigneeId || undefined,
        dueDate: values.dueDate || undefined,
      });
      toast.success('Task created successfully');
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.id,
      label: `${m.firstName} ${m.lastName}`,
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to the board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label
              htmlFor="task-title"
              className="text-sm font-medium text-foreground"
            >
              Title
            </label>
            <Input
              id="task-title"
              placeholder="Enter task title..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label
              htmlFor="task-desc"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <textarea
              id="task-desc"
              rows={3}
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Describe the task..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Status"
              options={TASK_STATUS_OPTIONS}
              {...register('status')}
            />
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              {...register('priority')}
            />
          </div>

          {/* Assignee */}
          {members.length > 0 && (
            <Select
              label="Assignee"
              options={memberOptions}
              {...register('assigneeId')}
            />
          )}

          {/* Due Date */}
          <div className="space-y-1">
            <label
              htmlFor="task-due"
              className="text-sm font-medium text-foreground"
            >
              Due Date
            </label>
            <Input
              id="task-due"
              type="date"
              {...register('dueDate')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
