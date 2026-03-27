'use client';

import { useMemo } from 'react';
import { CheckCircle2, ArrowRightLeft, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSprint } from '@/hooks/use-sprints';

interface SprintCompletionCardProps {
  sprintId: string;
}

export function SprintCompletionCard({ sprintId }: SprintCompletionCardProps) {
  const { data: sprint, isLoading, error } = useSprint(sprintId);

  const stats = useMemo(() => {
    if (!sprint) return null;

    const sprintData = sprint as any;
    const totalTasks = sprintData.stats?.totalTasks ?? 0;
    const doneTasks = sprintData.stats?.doneTasks ?? 0;
    const scopeAtStart = sprintData.scopeAtStart ?? totalTasks;
    const carriedOver = sprintData.carriedOver ?? 0;
    const scopeChange = totalTasks - scopeAtStart;

    const completionRate = totalTasks > 0
      ? Math.round((doneTasks / totalTasks) * 100)
      : 0;

    // Sprint health score: simple heuristic
    // 100% completion + no scope creep = Excellent
    // 80%+ completion = Good
    // 60%+ completion = Fair
    // Below 60% = Needs Improvement
    let healthLabel: string;
    let healthVariant: 'default' | 'secondary' | 'destructive';
    if (completionRate >= 90 && scopeChange <= 0) {
      healthLabel = 'Excellent';
      healthVariant = 'default';
    } else if (completionRate >= 75) {
      healthLabel = 'Good';
      healthVariant = 'default';
    } else if (completionRate >= 50) {
      healthLabel = 'Fair';
      healthVariant = 'secondary';
    } else {
      healthLabel = 'Needs Improvement';
      healthVariant = 'destructive';
    }

    return {
      completionRate,
      doneTasks,
      totalTasks,
      carriedOver,
      scopeChange,
      healthLabel,
      healthVariant,
    };
  }, [sprint]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton variant="card" className="h-[180px]" />
        </CardContent>
      </Card>
    );
  }

  if (error || !sprint || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load sprint data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Sprint Completion</CardTitle>
        <Badge variant={stats.healthVariant}>{stats.healthLabel}</Badge>
      </CardHeader>
      <CardContent>
        {/* Large completion rate */}
        <div className="mb-4">
          <p className="text-4xl font-bold text-foreground">
            {stats.completionRate}%
          </p>
          <p className="text-xs text-muted-foreground">completion rate</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(stats.completionRate, 100)}%` }}
          />
        </div>

        {/* Sub-stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stats.doneTasks}/{stats.totalTasks}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stats.carriedOver}
              </p>
              <p className="text-xs text-muted-foreground">Carried Over</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {stats.scopeChange > 0 ? '+' : ''}
                {stats.scopeChange}
              </p>
              <p className="text-xs text-muted-foreground">Scope Change</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
