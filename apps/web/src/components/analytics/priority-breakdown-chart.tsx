'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriorityBreakdown } from '@/hooks/use-analytics';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';
import type { TaskPriority } from '@/lib/constants';

const PRIORITY_ORDER: TaskPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

interface PriorityBreakdownChartProps {
  projectId: string;
  sprintId?: string;
}

export function PriorityBreakdownChart({ projectId, sprintId }: PriorityBreakdownChartProps) {
  const { data, isLoading, error } = usePriorityBreakdown(projectId, sprintId);

  const chartData = useMemo(() => {
    if (!data) return [];
    const dataMap = new Map(data.map((item) => [item.priority, item.count]));
    return PRIORITY_ORDER.map((priority) => ({
      name: PRIORITY_LABELS[priority],
      count: dataMap.get(priority) || 0,
      color: PRIORITY_COLORS[priority],
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="text" className="h-8" />
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
          <CardTitle className="text-base">Priority Breakdown</CardTitle>
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
        <CardTitle className="text-base">Priority Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.every((d) => d.count === 0) ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet
          </p>
        ) : (
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={70}
                  tick={{
                    fill: 'var(--color-foreground)',
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '0.5rem',
                    color: 'var(--color-foreground)',
                  }}
                  formatter={(value: number) => [value, 'Tasks']}
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{
                      fill: 'var(--color-foreground)',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
