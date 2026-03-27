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
import { useCreateSprint } from '@/hooks/use-sprints';

const createSprintSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(100, 'Name is too long'),
    goal: z.string().max(500).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

type CreateSprintFormValues = z.infer<typeof createSprintSchema>;

interface CreateSprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function CreateSprintModal({
  open,
  onOpenChange,
  projectId,
}: CreateSprintModalProps) {
  const createSprint = useCreateSprint();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSprintFormValues>({
    resolver: zodResolver(createSprintSchema),
    defaultValues: {
      name: '',
      goal: '',
      startDate: '',
      endDate: '',
    },
  });

  const onSubmit = async (values: CreateSprintFormValues) => {
    try {
      await createSprint.mutateAsync({
        projectId,
        name: values.name,
        goal: values.goal || undefined,
        startDate: values.startDate
          ? new Date(values.startDate).toISOString()
          : undefined,
        endDate: values.endDate
          ? new Date(values.endDate).toISOString()
          : undefined,
      });
      toast.success('Sprint created successfully');
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to create sprint',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Create Sprint</DialogTitle>
          <DialogDescription>
            Plan a new sprint for your project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="sprint-name"
              className="text-sm font-medium text-foreground"
            >
              Sprint Name
            </label>
            <Input
              id="sprint-name"
              placeholder="e.g. Sprint 1"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Goal */}
          <div className="space-y-1">
            <label
              htmlFor="sprint-goal"
              className="text-sm font-medium text-foreground"
            >
              Goal{' '}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="sprint-goal"
              rows={2}
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What do you want to achieve in this sprint?"
              {...register('goal')}
            />
            {errors.goal && (
              <p className="text-sm text-destructive">
                {errors.goal.message}
              </p>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="sprint-start"
                className="text-sm font-medium text-foreground"
              >
                Start Date
              </label>
              <Input
                id="sprint-start"
                type="date"
                {...register('startDate')}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="sprint-end"
                className="text-sm font-medium text-foreground"
              >
                End Date
              </label>
              <Input
                id="sprint-end"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
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
              Create Sprint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
