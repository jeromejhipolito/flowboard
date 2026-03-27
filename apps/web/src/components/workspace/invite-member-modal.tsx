'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useInviteMember } from '@/hooks/use-workspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

export function InviteMemberModal({
  open,
  onOpenChange,
  workspaceId,
}: InviteMemberModalProps) {
  const inviteMember = useInviteMember();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'MEMBER',
    },
  });

  const onSubmit = async (values: InviteMemberFormValues) => {
    try {
      await inviteMember.mutateAsync({
        workspaceId,
        email: values.email,
        role: values.role,
      });
      toast.success('Invitation sent successfully');
      reset();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to send invitation',
      );
    }
  };

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'VIEWER', label: 'Viewer' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite a team member to this workspace by their email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="invite-email"
              className="text-sm font-medium text-foreground"
            >
              Email Address
            </label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Select
              label="Role"
              options={roleOptions}
              {...register('role')}
              error={errors.role?.message}
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
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
