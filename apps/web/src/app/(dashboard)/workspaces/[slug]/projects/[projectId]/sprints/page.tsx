'use client';


import { Suspense, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Layers, Plus } from 'lucide-react';
import { useQueryParam } from '@/hooks/use-query-param';
import { useSprints } from '@/hooks/use-sprints';
import { useWorkspace, useWorkspaceMembers } from '@/hooks/use-workspaces';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDetailPanel } from '@/components/board/task-detail-panel';
import { CreateSprintModal } from '@/components/sprint/create-sprint-modal';
import {
  ActiveSprintItem,
  CompletedSprintItem,
} from '@/components/sprint/sprint-list-item';

export default function SprintsPage() {
  return (
    <Suspense>
      <SprintsPageContent />
    </Suspense>
  );
}

function SprintsPageContent() {
  const params = useParams();
  const projectId = params.projectId as string;
  const slug = params.slug as string;

  const { data: sprints, isLoading } = useSprints(projectId);
  const { data: workspace } = useWorkspace(slug);
  const { data: members } = useWorkspaceMembers(workspace?.id ?? '');
  const [selectedTaskId, setSelectedTaskId] = useQueryParam('task');
  const [createSprintOpen, setCreateSprintOpen] = useState(false);

  const memberList = useMemo(
    () =>
      members?.map((m: any) => ({
        id: m.userId,
        firstName: m.firstName,
        lastName: m.lastName,
        avatarUrl: m.avatarUrl,
      })) ?? [],
    [members],
  );

  const activeSprint = useMemo(
    () => sprints?.find((s) => s.status === 'ACTIVE') ?? null,
    [sprints],
  );

  const completedSprints = useMemo(
    () =>
      (sprints ?? [])
        .filter((s) => s.status === 'COMPLETED')
        .sort((a, b) => {
          // Most recently completed first
          const aDate = a.completedAt
            ? new Date(a.completedAt).getTime()
            : new Date(a.updatedAt).getTime();
          const bDate = b.completedAt
            ? new Date(b.completedAt).getTime()
            : new Date(b.updatedAt).getTime();
          return bDate - aDate;
        }),
    [sprints],
  );

  const handleTaskClick = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
    },
    [setSelectedTaskId],
  );

  const handleClosePanel = useCallback(() => {
    setSelectedTaskId(null);
  }, [setSelectedTaskId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" className="h-20 w-full" />
        <Skeleton variant="card" className="h-16 w-full" />
        <Skeleton variant="card" className="h-16 w-full" />
        <Skeleton variant="card" className="h-16 w-full" />
      </div>
    );
  }

  if (!sprints || sprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Layers className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          No sprints yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first sprint to start time-boxing work.
        </p>
        <Button className="mt-4" onClick={() => setCreateSprintOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create Sprint
        </Button>
        <CreateSprintModal
          open={createSprintOpen}
          onOpenChange={setCreateSprintOpen}
          projectId={projectId}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header with create button */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Sprint History</h2>
        <Button onClick={() => setCreateSprintOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Create Sprint
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-auto">
        {/* Active sprint at top */}
        {activeSprint && (
          <ActiveSprintItem
            sprint={activeSprint}
            slug={slug}
            projectId={projectId}
          />
        )}

        {/* Completed sprints */}
        {completedSprints.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Completed Sprints ({completedSprints.length})
            </h3>
            {completedSprints.map((sprint) => (
              <CompletedSprintItem
                key={sprint.id}
                sprint={sprint}
                projectId={projectId}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task detail panel for viewing tasks from completed sprints */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        projectId={projectId}
        onClose={handleClosePanel}
        members={memberList}
      />

      <CreateSprintModal
        open={createSprintOpen}
        onOpenChange={setCreateSprintOpen}
        projectId={projectId}
      />
    </div>
  );
}
