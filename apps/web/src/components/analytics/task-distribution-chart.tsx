'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTaskDistribution } from '@/hooks/use-analytics';
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '@/lib/constants';
import type { TaskStatus } from '@/lib/constants';

interface TaskDistributionChartProps {
  projectId: string;
  sprintId?: string;
}

export function TaskDistributionChart({ projectId, sprintId }: TaskDistributionChartProps) {
  const { data, isLoading, error } = useTaskDistribution(projectId, sprintId);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: TASK_STATUS_LABELS[item.status as TaskStatus] || item.status,
      value: item.count,
      color: TASK_STATUS_COLORS[item.status as TaskStatus] || '#6b7280',
    }));
  }, [data]);

  const total = useMemo(
    () => chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData],
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Skeleton variant="circle" className="h-48 w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Distribution</CardTitle>
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
        <CardTitle className="text-base">Task Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet
          </p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '0.5rem',
                    color: 'var(--color-foreground)',
                  }}
                  formatter={(value: number) => [value, 'Tasks']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string) => (
                    <span style={{ color: 'var(--color-foreground)', fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
                {/* Center text */}
                <text
                  x="50%"
                  y="42%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground"
                  style={{ fontSize: '24px', fontWeight: 700 }}
                >
                  {total}
                </text>
                <text
                  x="50%"
                  y="52%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-muted-foreground"
                  style={{ fontSize: '12px' }}
                >
                  total
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
