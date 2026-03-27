'use client';

import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ChevronDown, Check, Plus, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSprints, useActiveSprint, type Sprint } from '@/hooks/use-sprints';

interface SprintSelectorProps {
  projectId: string;
  value: string | null; // sprintId, 'backlog', or null (all tasks)
  onChange: (sprintId: string | null) => void;
  onCreateSprint: () => void;
  onCompleteSprint: (sprint: Sprint) => void;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10b981',
  PLANNING: '#3b82f6',
  COMPLETED: '#6b7280',
};

export function SprintSelector({
  projectId,
  value,
  onChange,
  onCreateSprint,
  onCompleteSprint,
}: SprintSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: sprints = [] } = useSprints(projectId);
  const { data: activeSprint } = useActiveSprint(projectId);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Determine display label
  const getLabel = () => {
    if (value === 'backlog') return 'Backlog';
    if (!value) return 'All Tasks';
    const sprint = sprints.find((s) => s.id === value);
    return sprint ? sprint.name : 'Sprint';
  };

  const activeSprints = sprints.filter((s) => s.status === 'ACTIVE');
  const planningSprints = sprints.filter((s) => s.status === 'PLANNING');
  const completedSprints = sprints.filter((s) => s.status === 'COMPLETED');

  const isActiveSprintSelected = value && activeSprint?.id === value;

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="gap-1"
      >
        <span className="max-w-[160px] truncate">Sprint: {getLabel()}</span>
        <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0" />
      </Button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-card shadow-lg">
          <div className="max-h-80 overflow-y-auto p-1">
            {/* All Tasks */}
            <button
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                !value && 'bg-accent',
              )}
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              {!value && <Check className="h-4 w-4 text-primary" />}
              {value && <span className="w-4" />}
              <span className="font-medium">All Tasks</span>
            </button>

            {/* Backlog (unassigned) */}
            <button
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                value === 'backlog' && 'bg-accent',
              )}
              onClick={() => {
                onChange('backlog');
                setOpen(false);
              }}
            >
              {value === 'backlog' && <Check className="h-4 w-4 text-primary" />}
              {value !== 'backlog' && <span className="w-4" />}
              <span className="font-medium">Backlog (unassigned)</span>
            </button>

            {/* Divider */}
            {(activeSprints.length > 0 || planningSprints.length > 0) && (
              <div className="my-1 h-px bg-border" />
            )}

            {/* Active sprints */}
            {activeSprints.map((sprint) => (
              <button
                key={sprint.id}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  value === sprint.id && 'bg-accent',
                )}
                onClick={() => {
                  onChange(sprint.id);
                  setOpen(false);
                }}
              >
                {value === sprint.id && <Check className="h-4 w-4 text-primary" />}
                {value !== sprint.id && <span className="w-4" />}
                <div className="flex flex-1 items-center gap-2 overflow-hidden">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS.ACTIVE }}
                  />
                  <span className="truncate font-medium">{sprint.name}</span>
                  <Badge
                    variant="secondary"
                    className="ml-auto shrink-0 text-[10px]"
                  >
                    Active
                  </Badge>
                </div>
              </button>
            ))}

            {/* Planning sprints */}
            {planningSprints.map((sprint) => (
              <button
                key={sprint.id}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  value === sprint.id && 'bg-accent',
                )}
                onClick={() => {
                  onChange(sprint.id);
                  setOpen(false);
                }}
              >
                {value === sprint.id && <Check className="h-4 w-4 text-primary" />}
                {value !== sprint.id && <span className="w-4" />}
                <div className="flex flex-1 items-center gap-2 overflow-hidden">
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS.PLANNING }}
                  />
                  <span className="truncate font-medium">{sprint.name}</span>
                  <Badge
                    variant="outline"
                    className="ml-auto shrink-0 text-[10px]"
                  >
                    Planning
                  </Badge>
                </div>
              </button>
            ))}

            {/* Completed sprints (grayed) */}
            {completedSprints.length > 0 && (
              <>
                <div className="my-1 h-px bg-border" />
                {completedSprints.slice(0, 5).map((sprint) => (
                  <button
                    key={sprint.id}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent',
                      value === sprint.id && 'bg-accent',
                    )}
                    onClick={() => {
                      onChange(sprint.id);
                      setOpen(false);
                    }}
                  >
                    {value === sprint.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    {value !== sprint.id && <span className="w-4" />}
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS.COMPLETED }}
                      />
                      <span className="truncate">{sprint.name}</span>
                      {sprint.completedAt && (
                        <span className="ml-auto shrink-0 text-[10px]">
                          {format(new Date(sprint.completedAt), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* Divider */}
            <div className="my-1 h-px bg-border" />

            {/* Create new sprint */}
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-accent"
              onClick={() => {
                onCreateSprint();
                setOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              Create new sprint
            </button>

            {/* Complete Sprint */}
            {isActiveSprintSelected && activeSprint && (
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                onClick={() => {
                  onCompleteSprint(activeSprint);
                  setOpen(false);
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                Complete Sprint...
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
