'use client';

import { useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSprints } from '@/hooks/use-sprints';

export interface AnalyticsScope {
  type: 'all' | 'sprint';
  sprintId?: string;
}

interface ScopeSelectorProps {
  projectId: string;
  value: AnalyticsScope;
  onChange: (scope: AnalyticsScope) => void;
}

export function ScopeSelector({ projectId, value, onChange }: ScopeSelectorProps) {
  const { data: sprints } = useSprints(projectId);

  // Filter to ACTIVE + CLOSED sprints only
  const availableSprints = useMemo(() => {
    if (!sprints) return [];
    const list = Array.isArray(sprints) ? sprints : [];
    return list.filter((s) => s.status === 'ACTIVE' || s.status === 'COMPLETED');
  }, [sprints]);

  const selectedSprint = useMemo(() => {
    if (value.type !== 'sprint' || !value.sprintId) return null;
    return availableSprints.find((s) => s.id === value.sprintId) ?? null;
  }, [value, availableSprints]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={value.type === 'all' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange({ type: 'all' })}
      >
        <Calendar className="mr-1.5 h-3.5 w-3.5" />
        All Time
      </Button>

      <div className="relative">
        <Button
          variant={value.type === 'sprint' ? 'default' : 'outline'}
          size="sm"
          className="pr-2"
          onClick={() => {
            // If no sprint selected yet, select the first available
            if (value.type !== 'sprint' && availableSprints.length > 0) {
              onChange({ type: 'sprint', sprintId: availableSprints[0].id });
            }
          }}
        >
          {selectedSprint ? `Sprint: ${selectedSprint.name}` : 'Sprint'}
          <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
        </Button>

        {/* Sprint dropdown — only show when sprint scope is active */}
        {value.type === 'sprint' && availableSprints.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-md border border-border bg-card py-1 shadow-lg">
            {availableSprints.map((sprint) => (
              <button
                key={sprint.id}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                  sprint.id === value.sprintId
                    ? 'bg-accent/50 font-medium text-foreground'
                    : 'text-muted-foreground'
                }`}
                onClick={() => onChange({ type: 'sprint', sprintId: sprint.id })}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    sprint.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                {sprint.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {sprint.status === 'ACTIVE' ? 'Active' : 'Closed'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {availableSprints.length === 0 && (
        <span className="text-xs text-muted-foreground">
          No sprints available
        </span>
      )}
    </div>
  );
}
