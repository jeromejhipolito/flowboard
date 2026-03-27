'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  PlusCircle,
  Edit3,
  ArrowRightCircle,
  Trash2,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { ActivityEntry } from '@/hooks/use-activity';

interface ActivityFeedProps {
  entries: ActivityEntry[];
  isLoading: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

const ACTION_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; verb: string }
> = {
  CREATED: {
    icon: PlusCircle,
    color: 'text-green-500',
    verb: 'created this task',
  },
  UPDATED: {
    icon: Edit3,
    color: 'text-blue-500',
    verb: 'updated',
  },
  STATUS_CHANGED: {
    icon: ArrowRightCircle,
    color: 'text-amber-500',
    verb: 'moved',
  },
  DELETED: {
    icon: Trash2,
    color: 'text-red-500',
    verb: 'deleted this task',
  },
};

function getActionConfig(action: string) {
  return (
    ACTION_CONFIG[action] ?? {
      icon: Clock,
      color: 'text-muted-foreground',
      verb: action,
    }
  );
}

function formatActivityDescription(entry: ActivityEntry): string {
  const actorName = entry.actor
    ? `${entry.actor.firstName} ${entry.actor.lastName}`
    : 'Someone';
  const action = entry.action;
  const before = entry.before as Record<string, any> | null;
  const after = entry.after as Record<string, any> | null;

  switch (action) {
    case 'CREATED':
      return `${actorName} created this task`;
    case 'UPDATED':
      return `${actorName} updated this task`;
    case 'STATUS_CHANGED': {
      const fromStatus = before?.status ?? '';
      const toStatus = after?.status ?? '';
      return `${actorName} moved from ${fromStatus.replace(/_/g, ' ')} to ${toStatus.replace(/_/g, ' ')}`;
    }
    case 'DELETED':
      return `${actorName} deleted this task`;
    default:
      return `${actorName} performed ${action.toLowerCase().replace(/_/g, ' ')}`;
  }
}

export function ActivityFeed({
  entries,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton variant="circle" className="h-7 w-7" />
            <div className="flex-1 space-y-1">
              <Skeleton variant="text" className="h-4 w-3/4" />
              <Skeleton variant="text" className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <Clock className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => {
        const config = getActionConfig(entry.action);
        const Icon = config.icon;
        const description = formatActivityDescription(entry);
        const timeAgo = formatDistanceToNow(new Date(entry.timestamp), {
          addSuffix: true,
        });
        const isLast = index === entries.length - 1;

        return (
          <div key={entry.id} className="relative flex gap-3 pb-4">
            {/* Vertical connector line */}
            {!isLast && (
              <div className="absolute left-[13px] top-7 h-full w-px bg-border" />
            )}

            {/* Action icon */}
            <div
              className={cn(
                'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card ring-2 ring-border',
              )}
            >
              <Icon className={cn('h-3.5 w-3.5', config.color)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm text-foreground">{description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
        );
      })}

      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load more'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
