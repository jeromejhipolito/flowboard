'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCreateProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  workspaceId,
}: CreateProjectModalProps) {
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (values: CreateProjectFormValues) => {
    try {
      await createProject.mutateAsync({
        workspaceId,
        name: values.name,
        description: values.description || undefined,
      });
      toast.success('Project created successfully');
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to create project',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to organize tasks in this workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="project-name"
              className="text-sm font-medium text-foreground"
            >
              Name
            </label>
            <Input
              id="project-name"
              placeholder="My Project"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="project-description"
              className="text-sm font-medium text-foreground"
            >
              Description
            </label>
            <Input
              id="project-description"
              placeholder="What is this project about?"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
