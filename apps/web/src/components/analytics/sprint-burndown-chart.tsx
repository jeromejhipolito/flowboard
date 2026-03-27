'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSprintBurndown } from '@/hooks/use-analytics';

interface SprintBurndownChartProps {
  projectId: string;
  sprintId: string;
  isActive?: boolean;
}

export function SprintBurndownChart({
  projectId,
  sprintId,
  isActive,
}: SprintBurndownChartProps) {
  const { data, isLoading, error } = useSprintBurndown(projectId, sprintId);

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => {
      let label: string;
      try {
        label = format(parseISO(item.day), 'MMM d');
      } catch {
        label = item.day;
      }
      return {
        day: item.day,
        label,
        ideal: item.ideal,
        // -1 means future (no actual data yet)
        actual: item.actual >= 0 ? item.actual : undefined,
      };
    });
  }, [data]);

  // Find today's label for the reference line
  const todayLabel = useMemo(() => {
    const todayItem = chartData.find((d) => d.day === todayStr);
    return todayItem?.label ?? null;
  }, [chartData, todayStr]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Burndown</CardTitle>
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
          <CardTitle className="text-base">Sprint Burndown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load burndown data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sprint Burndown</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No burndown data available. Sprint needs start and end dates.
          </p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{
                    fill: 'var(--color-muted-foreground)',
                    fontSize: 12,
                  }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                  tickLine={false}
                  interval="preserveStartEnd"
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
                  formatter={(value: number, name: string) => {
                    if (value === undefined) return ['-', name];
                    return [value, name === 'ideal' ? 'Ideal' : 'Remaining'];
                  }}
                  labelFormatter={(label: string) => label}
                />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: 'var(--color-foreground)', fontSize: '12px' }}>
                      {value === 'ideal' ? 'Ideal' : 'Remaining'}
                    </span>
                  )}
                />
                {/* Ideal line: dashed gray */}
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  connectNulls
                />
                {/* Actual line: solid primary */}
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                {/* Today marker for active sprints */}
                {isActive && todayLabel && (
                  <ReferenceLine
                    x={todayLabel}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: 'Today',
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 12,
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
