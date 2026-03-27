'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemberWorkload } from '@/hooks/use-analytics';

interface MemberWorkloadChartProps {
  projectId: string;
  sprintId?: string;
}

export function MemberWorkloadChart({ projectId, sprintId }: MemberWorkloadChartProps) {
  const { data, isLoading, error } = useMemberWorkload(projectId, sprintId);

  const chartData = (data || []).map((member) => ({
    name: member.firstName,
    total: member.totalTasks,
    completed: member.completedTasks,
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 py-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="text"
                className="flex-1"
                style={{ height: `${40 + i * 20}px` }}
              />
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
          <CardTitle className="text-base">Team Workload</CardTitle>
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
        <CardTitle className="text-base">Team Workload</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No member data available
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
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
                />
                <Legend
                  formatter={(value: string) => (
                    <span style={{ color: 'var(--color-foreground)', fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
