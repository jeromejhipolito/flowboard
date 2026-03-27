'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import nextDynamic from 'next/dynamic';
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryParam } from '@/hooks/use-query-param';
import { ScopeSelector, type AnalyticsScope } from '@/components/analytics/scope-selector';

function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton variant="text" className="mb-4 h-5 w-40" />
      <Skeleton variant="card" className="h-[240px]" />
    </div>
  );
}

const TaskDistributionChart = nextDynamic(
  () => import('@/components/analytics/task-distribution-chart').then(m => ({ default: m.TaskDistributionChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const PriorityBreakdownChart = nextDynamic(
  () => import('@/components/analytics/priority-breakdown-chart').then(m => ({ default: m.PriorityBreakdownChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const MemberWorkloadChart = nextDynamic(
  () => import('@/components/analytics/member-workload-chart').then(m => ({ default: m.MemberWorkloadChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const VelocityChart = nextDynamic(
  () => import('@/components/analytics/velocity-chart').then(m => ({ default: m.VelocityChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const OverdueSummary = nextDynamic(
  () => import('@/components/analytics/overdue-summary').then(m => ({ default: m.OverdueSummary })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const SprintBurndownChart = nextDynamic(
  () => import('@/components/analytics/sprint-burndown-chart').then(m => ({ default: m.SprintBurndownChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const SprintVelocityChart = nextDynamic(
  () => import('@/components/analytics/sprint-velocity-chart').then(m => ({ default: m.SprintVelocityChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
const SprintCompletionCard = nextDynamic(
  () => import('@/components/analytics/sprint-completion-card').then(m => ({ default: m.SprintCompletionCard })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

interface AnimatedWidgetProps {
  children: React.ReactNode;
  delay: number;
}

function AnimatedWidget({ children, delay }: AnimatedWidgetProps) {
  const style = useMemo(
    () => ({
      animationDelay: `${delay}ms`,
      animationFillMode: 'both' as const,
    }),
    [delay],
  );

  return (
    <div
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
      style={style}
    >
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [scopeParam, setScopeParam] = useQueryParam('scope', { defaultValue: 'all' });
  const [sprintIdParam, setSprintIdParam] = useQueryParam('sprintId');

  const scope: AnalyticsScope = useMemo(() => {
    if (scopeParam === 'sprint' && sprintIdParam) {
      return { type: 'sprint', sprintId: sprintIdParam };
    }
    return { type: 'all' };
  }, [scopeParam, sprintIdParam]);

  const handleScopeChange = useCallback(
    (newScope: AnalyticsScope) => {
      if (newScope.type === 'all') {
        setScopeParam('all');
        setSprintIdParam(null);
      } else {
        setScopeParam('sprint');
        setSprintIdParam(newScope.sprintId ?? null);
      }
    },
    [setScopeParam, setSprintIdParam],
  );

  const isSprint = scope.type === 'sprint' && !!scope.sprintId;
  const sprintId = isSprint ? scope.sprintId : undefined;

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No project selected.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your project progress and team performance
        </p>
      </div>

      {/* Scope selector */}
      <div className="mb-6">
        <ScopeSelector
          projectId={projectId}
          value={scope}
          onChange={handleScopeChange}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AnimatedWidget delay={0}>
          <Suspense fallback={<ChartSkeleton />}>
            <TaskDistributionChart projectId={projectId} sprintId={sprintId} />
          </Suspense>
        </AnimatedWidget>

        <AnimatedWidget delay={100}>
          <Suspense fallback={<ChartSkeleton />}>
            <PriorityBreakdownChart projectId={projectId} sprintId={sprintId} />
          </Suspense>
        </AnimatedWidget>

        <AnimatedWidget delay={200}>
          <Suspense fallback={<ChartSkeleton />}>
            <MemberWorkloadChart projectId={projectId} sprintId={sprintId} />
          </Suspense>
        </AnimatedWidget>

        {/* Sprint scope: show burndown instead of velocity */}
        {isSprint ? (
          <AnimatedWidget delay={300}>
            <Suspense fallback={<ChartSkeleton />}>
              <SprintBurndownChart
                projectId={projectId}
                sprintId={scope.sprintId!}
                isActive
              />
            </Suspense>
          </AnimatedWidget>
        ) : (
          <AnimatedWidget delay={300}>
            <Suspense fallback={<ChartSkeleton />}>
              <VelocityChart projectId={projectId} sprintId={sprintId} />
            </Suspense>
          </AnimatedWidget>
        )}

        <AnimatedWidget delay={400}>
          <Suspense fallback={<ChartSkeleton />}>
            <OverdueSummary projectId={projectId} sprintId={sprintId} />
          </Suspense>
        </AnimatedWidget>

        {/* Sprint completion card: only shown when a sprint is selected */}
        {isSprint && (
          <AnimatedWidget delay={500}>
            <Suspense fallback={<ChartSkeleton />}>
              <SprintCompletionCard sprintId={scope.sprintId!} />
            </Suspense>
          </AnimatedWidget>
        )}
      </div>

      {/* Sprint Velocity — always visible (cross-sprint trend) */}
      <div className="mt-6">
        <AnimatedWidget delay={600}>
          <Suspense fallback={<ChartSkeleton />}>
            <SprintVelocityChart projectId={projectId} />
          </Suspense>
        </AnimatedWidget>
      </div>
    </div>
  );
}
