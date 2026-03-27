'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Activity, Filter } from 'lucide-react';
import { useProjectActivity } from '@/hooks/use-activity';
import { useWorkspace, useWorkspaceMembers } from '@/hooks/use-workspaces';
import { ActivityFeed } from '@/components/activity/activity-feed';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const ACTION_TYPE_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'moved', label: 'Moved' },
  { value: 'deleted', label: 'Deleted' },
  { value: 'commented', label: 'Commented' },
  { value: 'assigned', label: 'Assigned' },
];

export default function ProjectActivityPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const slug = params.slug as string;

  const [filterAction, setFilterAction] = useState('');
  const [filterActor, setFilterActor] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: workspace } = useWorkspace(slug);
  const { data: members } = useWorkspaceMembers(workspace?.id ?? '');

  const filters = useMemo(
    () => ({
      action: filterAction || undefined,
      actorId: filterActor || undefined,
    }),
    [filterAction, filterActor],
  );

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useProjectActivity(projectId, filters);

  const allEntries = data?.pages.flatMap((page) => page.data ?? []) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage) fetchNextPage();
  }, [hasNextPage, fetchNextPage]);

  const actorOptions = useMemo(
    () => [
      { value: '', label: 'All Members' },
      ...(members?.map((m) => ({
        value: m.userId,
        label: `${m.firstName} ${m.lastName}`,
      })) ?? []),
    ],
    [members],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Project Activity
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter className="mr-1 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
          <div className="w-40">
            <Select
              label="Action"
              options={ACTION_TYPE_OPTIONS}
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
            />
          </div>
          {actorOptions.length > 1 && (
            <div className="w-48">
              <Select
                label="Actor"
                options={actorOptions}
                value={filterActor}
                onChange={(e) => setFilterActor(e.target.value)}
              />
            </div>
          )}
          {(filterAction || filterActor) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterAction('');
                setFilterActor('');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Activity feed */}
      <div className="flex-1 overflow-y-auto">
        <ActivityFeed
          entries={allEntries}
          isLoading={isLoading}
          hasMore={hasNextPage}
          onLoadMore={handleLoadMore}
          isLoadingMore={isFetchingNextPage}
        />
      </div>
    </div>
  );
}
