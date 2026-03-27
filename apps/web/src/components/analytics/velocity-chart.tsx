'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useVelocity } from '@/hooks/use-analytics';

interface VelocityChartProps {
  projectId: string;
  sprintId?: string;
}

export function VelocityChart({ projectId, sprintId }: VelocityChartProps) {
  const { data, isLoading, error } = useVelocity(projectId, sprintId);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      let label: string;
      try {
        label = format(parseISO(item.week), 'MMM d');
      } catch {
        label = item.week;
      }
      return {
        week: label,
        completed: item.completedCount,
      };
    });
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Velocity (Last 8 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton variant="card" className="h-[240px]" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Velocity (Last 8 Weeks)</CardTitle>
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
        <CardTitle className="text-base">Velocity (Last 8 Weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No velocity data yet
          </p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{
                    fill: 'var(--color-muted-foreground)',
                    fontSize: 12,
                  }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: 'var(--color-muted-foreground)',
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
                  formatter={(value: number) => [value, 'Completed']}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#velocityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
