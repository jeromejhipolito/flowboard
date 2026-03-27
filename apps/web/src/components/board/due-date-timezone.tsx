'use client';
import { useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  dueDate: string;
  assignee?: { firstName: string; timezone?: string | null };
  viewerTimezone?: string | null;
  className?: string;
}

export function DueDateTimezoneBreakdown({ dueDate, assignee, viewerTimezone, className }: Props) {
  const breakdown = useMemo(() => {
    if (!dueDate) return null;

    const date = new Date(dueDate);
    const assigneeTz = assignee?.timezone;
    const viewerTz = viewerTimezone;

    if (!assigneeTz && !viewerTz) return null;

    const results: { label: string; time: string; dayOfWeek: string; dayNum: number }[] = [];

    if (assigneeTz) {
      const formatted = formatInTimeZone(date, assigneeTz, 'MMM d, h:mm a zzz');
      const day = formatInTimeZone(date, assigneeTz, 'EEEE');
      const dayNum = parseInt(formatInTimeZone(date, assigneeTz, 'd'));
      results.push({ label: `${assignee?.firstName} (${getUtcOffset(date, assigneeTz)})`, time: formatted, dayOfWeek: day, dayNum });
    }

    if (viewerTz && viewerTz !== assigneeTz) {
      const formatted = formatInTimeZone(date, viewerTz, 'MMM d, h:mm a zzz');
      const day = formatInTimeZone(date, viewerTz, 'EEEE');
      const dayNum = parseInt(formatInTimeZone(date, viewerTz, 'd'));
      results.push({ label: `You (${getUtcOffset(date, viewerTz)})`, time: formatted, dayOfWeek: day, dayNum });
    }

    // Check if dates cross calendar day boundary
    const crossesDayBoundary = results.length >= 2 && results[0].dayNum !== results[1].dayNum;

    return { entries: results, crossesDayBoundary, assigneeName: assignee?.firstName };
  }, [dueDate, assignee, viewerTimezone]);

  if (!breakdown || breakdown.entries.length === 0) return null;

  return (
    <div className={cn('mt-1 space-y-0.5', className)}>
      {breakdown.entries.map((entry, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span className="font-medium">{entry.label}</span>{' '}
          {entry.time}
        </p>
      ))}
      {breakdown.crossesDayBoundary && (
        <p className="flex items-center gap-1 text-xs font-medium text-amber-500">
          <AlertTriangle className="h-3 w-3" />
          {breakdown.assigneeName}&apos;s deadline falls on a different day
        </p>
      )}
    </div>
  );
}

function getUtcOffset(date: Date, timezone: string): string {
  try {
    const offset = formatInTimeZone(date, timezone, 'xxx'); // e.g. "+08:00"
    return `UTC${offset}`;
  } catch {
    return timezone;
  }
}
