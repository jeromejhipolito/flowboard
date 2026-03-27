'use client';


import { Suspense, useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQueryParam } from '@/hooks/use-query-param';
import { Plus, Filter, Wifi, WifiOff, Maximize2, Minimize2, Search, Inbox, Radio } from 'lucide-react';
import { BoardSearch } from '@/components/board/board-search';
import { useProject } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { useSocket } from '@/hooks/use-socket';
import { useWorkspace, useWorkspaceMembers } from '@/hooks/use-workspaces';
import { isDemoMode } from '@/demo';
import { useBoardStore } from '@/stores/board-store';
import { useActiveSprint } from '@/hooks/use-sprints';
import type { Sprint } from '@/hooks/use-sprints';
import {
  TASK_STATUS_ORDER,
  TASK_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  type TaskStatus,
  type TaskPriority,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { KanbanBoard } from '@/components/board/kanban-board';
import { CreateTaskModal } from '@/components/board/create-task-modal';
import { TaskDetailPanel } from '@/components/board/task-detail-panel';
import { SprintSelector } from '@/components/sprint/sprint-selector';
import { CreateSprintModal } from '@/components/sprint/create-sprint-modal';
import { CompleteSprintDialog } from '@/components/sprint/complete-sprint-dialog';
import type { Task } from '@/hooks/use-tasks';

export default function BoardPage() {
  return (
    <Suspense>
      <BoardPageContent />
    </Suspense>
  );
}

function BoardPageContent() {
  const params = useParams();
  const projectId = params.projectId as string;
  const slug = params.slug as string;

  const { data: project } = useProject(projectId);
  const { data: workspace } = useWorkspace(slug);
  const { data: members } = useWorkspaceMembers(workspace?.id ?? '');
  const { isConnected, joinBoard, leaveBoard } = useSocket();
  const { setColumns, cardDensity, setCardDensity } = useBoardStore();
  const { data: activeSprint } = useActiveSprint(projectId);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSprintOpen, setCreateSprintOpen] = useState(false);
  const [completeSprintOpen, setCompleteSprintOpen] = useState(false);
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<TaskStatus>('TODO');
  const [showFilters, setShowFilters] = useState(false);
  const [sprintFilter, setSprintFilter] = useQueryParam('sprint');
  const [filterStatus, setFilterStatus] = useQueryParam('status');
  const [filterPriority, setFilterPriority] = useQueryParam('priority');
  const [filterAssignee, setFilterAssignee] = useQueryParam('assignee');
  const [searchQuery, setSearchQuery] = useQueryParam('q');
  const [selectedTaskId, setSelectedTaskId] = useQueryParam('task');
  const [action, setAction] = useQueryParam('action');

  // Determine sprintId to pass to useTasks
  const taskSprintFilter = useMemo(() => {
    if (sprintFilter === 'backlog' || !sprintFilter) return undefined;
    return sprintFilter;
  }, [sprintFilter]);

  const { data: tasksData, isLoading: tasksLoading } = useTasks(projectId, {
    sprintId: taskSprintFilter,
  });

  // Initialize board from server data
  useEffect(() => {
    if (!tasksData) return;

    const columns: Record<TaskStatus, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };

    // Apply filters and group
    let filteredTasks = tasksData.tasks;

    // Sprint backlog filter: only show tasks with no sprint assigned
    if (sprintFilter === 'backlog') {
      filteredTasks = filteredTasks.filter((t) => !t.sprintId);
    }

    if (filterStatus) {
      filteredTasks = filteredTasks.filter((t) => t.status === filterStatus);
    }
    if (filterPriority) {
      filteredTasks = filteredTasks.filter((t) => t.priority === filterPriority);
    }
    if (filterAssignee) {
      filteredTasks = filteredTasks.filter(
        (t) => t.assigneeId === filterAssignee,
      );
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description?.toLowerCase().includes(lower) ||
          (t.assignee &&
            `${t.assignee.firstName} ${t.assignee.lastName}`
              .toLowerCase()
              .includes(lower)),
      );
    }

    for (const task of filteredTasks) {
      const status = task.status as TaskStatus;
      if (columns[status]) {
        columns[status].push(task);
      }
    }

    // Sort by position within each column
    for (const status of TASK_STATUS_ORDER) {
      columns[status].sort((a, b) => a.position - b.position);
    }

    setColumns(columns);
  }, [tasksData, sprintFilter, filterStatus, filterPriority, filterAssignee, searchQuery, setColumns]);

  // Command palette fires ?action=create-task — open the modal then clear the param.
  useEffect(() => {
    if (action === 'create-task') {
      setCreateDefaultStatus('TODO');
      setCreateModalOpen(true);
      setAction(null);
    }
  }, [action, setAction]);

  // Join WebSocket board room
  useEffect(() => {
    if (projectId && isConnected) {
      joinBoard(projectId);
    }
    return () => {
      if (projectId) {
        leaveBoard(projectId);
      }
    };
  }, [projectId, isConnected, joinBoard, leaveBoard]);

  const handleTaskClick = useCallback(
    (taskId: string) => {
      setSelectedTaskId(taskId);
    },
    [setSelectedTaskId],
  );

  const handleAddTask = useCallback((status: TaskStatus) => {
    setCreateDefaultStatus(status);
    setCreateModalOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedTaskId(null);
  }, [setSelectedTaskId]);

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

  const filterStatusOptions = [
    { value: '', label: 'All Statuses' },
    ...TASK_STATUS_OPTIONS,
  ];

  const filterPriorityOptions = [
    { value: '', label: 'All Priorities' },
    ...PRIORITY_OPTIONS,
  ];

  const filterAssigneeOptions = [
    { value: '', label: 'All Members' },
    ...memberList.map((m: any) => ({
      value: m.id,
      label: `${m.firstName} ${m.lastName}`,
    })),
  ];

  if (tasksLoading) {
    return (
      <div className="flex h-full gap-4 overflow-x-auto">
        {TASK_STATUS_ORDER.map((status) => (
          <div
            key={status}
            className="flex w-[280px] min-w-[280px] flex-col gap-3 rounded-lg bg-muted/50 p-3"
          >
            <Skeleton variant="text" className="h-6 w-24" />
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Board toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SprintSelector
            projectId={projectId}
            value={sprintFilter}
            onChange={setSprintFilter}
            onCreateSprint={() => setCreateSprintOpen(true)}
            onCompleteSprint={(sprint) => {
              setSprintToComplete(sprint);
              setCompleteSprintOpen(true);
            }}
          />
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Create Task
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="mr-1 h-4 w-4" />
            Filters
          </Button>
          <BoardSearch
            value={searchQuery ?? ''}
            onChange={(v) => setSearchQuery(v || null)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCardDensity(cardDensity === 'compact' ? 'expanded' : 'compact')
            }
            title={cardDensity === 'compact' ? 'Switch to expanded cards' : 'Switch to compact cards'}
          >
            {cardDensity === 'compact' ? (
              <Maximize2 className="mr-1 h-4 w-4" />
            ) : (
              <Minimize2 className="mr-1 h-4 w-4" />
            )}
            {cardDensity === 'compact' ? 'Expanded' : 'Compact'}
          </Button>
          {isDemoMode ? (
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
              <Radio className="h-3 w-3" />
              Demo
            </Badge>
          ) : isConnected ? (
            <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
              <Wifi className="h-3 w-3" />
              Live
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground border-border">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
          <div className="w-40">
            <Select
              label="Status"
              options={filterStatusOptions}
              value={filterStatus ?? ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
            />
          </div>
          <div className="w-40">
            <Select
              label="Priority"
              options={filterPriorityOptions}
              value={filterPriority ?? ''}
              onChange={(e) => setFilterPriority(e.target.value || null)}
            />
          </div>
          {memberList.length > 0 && (
            <div className="w-48">
              <Select
                label="Assignee"
                options={filterAssigneeOptions}
                value={filterAssignee ?? ''}
                onChange={(e) => setFilterAssignee(e.target.value || null)}
              />
            </div>
          )}
          {(filterStatus || filterPriority || filterAssignee) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus(null);
                setFilterPriority(null);
                setFilterAssignee(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Backlog banner */}
      {sprintFilter === 'backlog' && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
          <Inbox className="h-4 w-4 text-amber-600" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Showing tasks not assigned to any sprint.
          </p>
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard onTaskClick={handleTaskClick} onAddTask={handleAddTask} searchQuery={searchQuery} />
      </div>

      {/* Create task modal */}
      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        projectId={projectId}
        defaultStatus={createDefaultStatus}
        members={memberList}
      />

      {/* Task detail panel */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        projectId={projectId}
        onClose={handleClosePanel}
        members={memberList}
      />

      {/* Create sprint modal */}
      <CreateSprintModal
        open={createSprintOpen}
        onOpenChange={setCreateSprintOpen}
        projectId={projectId}
      />

      {/* Complete sprint dialog */}
      <CompleteSprintDialog
        sprint={sprintToComplete}
        projectId={projectId}
        open={completeSprintOpen}
        onOpenChange={setCompleteSprintOpen}
      />
    </div>
  );
}
