'use client';

import { format, parseISO } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useOverdueTasks } from '@/hooks/use-analytics';

interface OverdueSummaryProps {
  projectId: string;
  sprintId?: string;
}

export function OverdueSummary({ projectId, sprintId }: OverdueSummaryProps) {
  const { data, isLoading, error } = useOverdueTasks(projectId, sprintId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overdue Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton variant="text" className="mb-4 h-12 w-20" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="text" className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overdue Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overdue Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <p className="text-3xl font-bold text-destructive">{data.count}</p>
            <p className="text-xs text-muted-foreground">overdue tasks</p>
          </div>
        </div>

        {data.tasks.length > 0 ? (
          <ul className="space-y-3">
            {data.tasks.slice(0, 5).map((task) => {
              const initials = task.assignee
                ? `${task.assignee.firstName.charAt(0)}${task.assignee.lastName.charAt(0)}`
                : '??';
              let dueDateLabel: string;
              try {
                dueDateLabel = format(parseISO(task.dueDate), 'MMM d');
              } catch {
                dueDateLabel = task.dueDate;
              }

              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-md border border-border p-2"
                >
                  <Avatar className="h-7 w-7">
                    {task.assignee?.avatarUrl && (
                      <AvatarImage
                        src={task.assignee.avatarUrl}
                        alt={task.assignee.firstName}
                      />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {task.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-destructive font-medium">
                    {dueDateLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No overdue tasks
          </p>
        )}
      </CardContent>
    </Card>
  );
}
