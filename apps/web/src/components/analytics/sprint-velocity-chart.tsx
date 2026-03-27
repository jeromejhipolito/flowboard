'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSprintVelocity } from '@/hooks/use-analytics';

interface SprintVelocityChartProps {
  projectId: string;
}

export function SprintVelocityChart({ projectId }: SprintVelocityChartProps) {
  const { data, isLoading, error } = useSprintVelocity(projectId);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      name: item.sprintName,
      points: item.completedPoints,
      tasks: item.completedTasks,
      avg: item.avgVelocity,
    }));
  }, [data]);

  // Compute overall average for the reference line
  const overallAvg = useMemo(() => {
    if (!data || data.length === 0) return null;
    const total = data.reduce((sum, item) => sum + item.completedPoints, 0);
    return Math.round(total / data.length);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Velocity</CardTitle>
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
          <CardTitle className="text-base">Sprint Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Failed to load sprint velocity data
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sprint Velocity</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No completed sprints yet. Velocity data appears after closing sprints.
          </p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: 'var(--color-foreground)',
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
                  formatter={(value: number, name: string) => {
                    if (name === 'points') return [value, 'Story Points'];
                    return [value, name];
                  }}
                  labelFormatter={(label: string) => label}
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                />
                <Legend
                  formatter={() => (
                    <span style={{ color: 'var(--color-foreground)', fontSize: '12px' }}>
                      Story Points
                    </span>
                  )}
                />
                <Bar
                  dataKey="points"
                  name="points"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                {/* Rolling average reference line */}
                {overallAvg !== null && (
                  <ReferenceLine
                    y={overallAvg}
                    stroke="#f59e0b"
                    strokeDasharray="6 3"
                    strokeWidth={2}
                    label={{
                      value: `Avg: ${overallAvg}`,
                      position: 'right',
                      fill: '#f59e0b',
                      fontSize: 12,
                    }}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
