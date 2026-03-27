'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMarkAsRead } from '@/hooks/use-notifications';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
}

function formatNotificationMessage(notification: Notification): string {
  const actorName = notification.actor
    ? `${notification.actor.firstName} ${notification.actor.lastName}`
    : 'Someone';
  const meta = notification.metadata ?? {};

  switch (notification.type) {
    case 'TASK_ASSIGNED':
      return `${actorName} assigned you to ${meta.taskTitle ?? 'a task'}`;
    case 'TASK_STATUS_CHANGED':
      return `${actorName} moved ${meta.taskTitle ?? 'a task'} to ${meta.status ?? 'a new status'}`;
    case 'COMMENT_ADDED':
      return `${actorName} commented on ${meta.taskTitle ?? 'a task'}`;
    case 'MENTION':
      return `${actorName} mentioned you in ${meta.taskTitle ?? 'a task'}`;
    case 'MEMBER_INVITED':
      return `${actorName} invited you to ${meta.workspaceName ?? 'a workspace'}`;
    default:
      return notification.message || `${actorName} performed an action`;
  }
}

function getNotificationUrl(notification: Notification): string | null {
  const meta = notification.metadata ?? {};

  switch (notification.resourceType) {
    case 'task':
      if (meta.workspaceSlug && meta.projectId) {
        return `/workspaces/${meta.workspaceSlug}/projects/${meta.projectId}/board?task=${notification.resourceId}`;
      }
      return null;
    case 'workspace':
      if (meta.workspaceSlug) {
        return `/workspaces/${meta.workspaceSlug}`;
      }
      return null;
    case 'project':
      if (meta.workspaceSlug) {
        return `/workspaces/${meta.workspaceSlug}/projects/${notification.resourceId}/board`;
      }
      return null;
    default:
      return null;
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const markAsRead = useMarkAsRead();

  const actorInitials = notification.actor
    ? `${notification.actor.firstName.charAt(0)}${notification.actor.lastName.charAt(0)}`.toUpperCase()
    : '??';

  const message = formatNotificationMessage(notification);
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }

    const url = getNotificationUrl(notification);
    if (url) {
      router.push(url);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent',
        !notification.read && 'bg-primary/5',
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        {notification.actor?.avatarUrl && (
          <AvatarImage
            src={notification.actor.avatarUrl}
            alt={`${notification.actor.firstName} ${notification.actor.lastName}`}
          />
        )}
        <AvatarFallback className="text-xs">{actorInitials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{message}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
      </div>

      {!notification.read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}
