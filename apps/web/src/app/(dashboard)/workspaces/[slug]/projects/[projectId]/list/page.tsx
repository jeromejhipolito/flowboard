'use client';


import { Suspense, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Filter, List, Search } from 'lucide-react';
import { BoardSearch } from '@/components/board/board-search';
import { useQueryParam } from '@/hooks/use-query-param';
import { useProject } from '@/hooks/use-projects';
import { useTasks } from '@/hooks/use-tasks';
import { useWorkspace, useWorkspaceMembers } from '@/hooks/use-workspaces';
import { useSprints } from '@/hooks/use-sprints';
import {
  TASK_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskDetailPanel } from '@/components/board/task-detail-panel';
import {
  TaskList,
  type SortColumn,
  type SortDirection,
} from '@/components/list/task-list';
import { BulkActionBar } from '@/components/list/bulk-action-bar';

export default function ListPage() {
  return (
    <Suspense>
      <ListPageContent />
    </Suspense>
  );
}

function ListPageContent() {
  const params = useParams();
  const projectId = params.projectId as string;
  const slug = params.slug as string;

  const { data: project } = useProject(projectId);
  const { data: workspace } = useWorkspace(slug);
  const { data: members } = useWorkspaceMembers(workspace?.id ?? '');
  const { data: sprints = [] } = useSprints(projectId);
  const [sprintFilter, setSprintFilter] = useQueryParam('sprint');

  const taskSprintFilter = useMemo(() => {
    if (sprintFilter === 'backlog' || !sprintFilter) return undefined;
    return sprintFilter;
  }, [sprintFilter]);

  const { data: tasksData, isLoading: tasksLoading } = useTasks(projectId, {
    sprintId: taskSprintFilter,
  });

  // URL state
  const [searchQuery, setSearchQuery] = useQueryParam('q');
  const [filterStatus, setFilterStatus] = useQueryParam('status');
  const [filterPriority, setFilterPriority] = useQueryParam('priority');
  const [filterAssignee, setFilterAssignee] = useQueryParam('assignee');
  const [selectedTaskId, setSelectedTaskId] = useQueryParam('task');
  const [sortParam, setSortParam] = useQueryParam('sort');
  const [dirParam, setDirParam] = useQueryParam('dir');

  // Local state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(['DONE']), // DONE collapsed by default
  );

  const sortBy: SortColumn = (sortParam as SortColumn) || 'status';
  const sortDir: SortDirection = (dirParam as SortDirection) || 'asc';

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!tasksData) return [];

    let tasks = tasksData.tasks;

    // Backlog filter: show only tasks with no sprint
    if (sprintFilter === 'backlog') {
      tasks = tasks.filter((t) => !t.sprintId);
    }

    if (filterStatus) {
      tasks = tasks.filter((t) => t.status === filterStatus);
    }
    if (filterPriority) {
      tasks = tasks.filter((t) => t.priority === filterPriority);
    }
    if (filterAssignee) {
      tasks = tasks.filter((t) => t.assigneeId === filterAssignee);
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(lower) ||
          t.description?.toLowerCase().includes(lower) ||
          (t.assignee &&
            `${t.assignee.firstName} ${t.assignee.lastName}`
              .toLowerCase()
              .includes(lower)),
      );
    }

    return tasks;
  }, [tasksData, sprintFilter, filterStatus, filterPriority, filterAssignee, searchQuery]);

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

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (sortBy === column) {
        setDirParam(sortDir === 'asc' ? 'desc' : 'asc');
      } else {
        setSortParam(column);
        setDirParam('asc');
      }
    },
    [sortBy, sortDir, setSortParam, setDirParam],
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

  const handleSelect = useCallback(
    (taskId: string, checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (checked) {
          next.add(taskId);
        } else {
          next.delete(taskId);
        }
        return next;
      });
    },
    [],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleToggleGroup = useCallback((status: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }, []);

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

  const sprintFilterOptions = [
    { value: '', label: 'All Sprints' },
    { value: 'backlog', label: 'Backlog (unassigned)' },
    ...sprints
      .filter((s) => s.status === 'ACTIVE' || s.status === 'PLANNING')
      .map((s) => ({
        value: s.id,
        label: `${s.name}${s.status === 'ACTIVE' ? ' (Active)' : ''}`,
      })),
  ];

  if (tasksLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton variant="text" className="h-10 w-full" />
        <Skeleton variant="card" className="h-12 w-full" />
        <Skeleton variant="card" className="h-12 w-full" />
        <Skeleton variant="card" className="h-12 w-full" />
        <Skeleton variant="card" className="h-12 w-full" />
        <Skeleton variant="card" className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-3">
          <div className="w-44">
            <Select
              label="Sprint"
              options={sprintFilterOptions}
              value={sprintFilter ?? ''}
              onChange={(e) => setSprintFilter(e.target.value || null)}
            />
          </div>
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
          {(filterStatus || filterPriority || filterAssignee || sprintFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStatus(null);
                setFilterPriority(null);
                setFilterAssignee(null);
                setSprintFilter(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            {searchQuery ? (
              <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            ) : (
              <List className="mb-4 h-12 w-12 text-muted-foreground" />
            )}
            <h2 className="text-lg font-semibold text-foreground">No tasks found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? 'No tasks match your search.'
                : 'No tasks match your filters.'}
            </p>
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onTaskClick={handleTaskClick}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            collapsedGroups={collapsedGroups}
            sprints={sprints}
            onToggleGroup={handleToggleGroup}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Bulk action bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        members={memberList}
      />

      {/* Task detail panel (same as board) */}
      <TaskDetailPanel
        taskId={selectedTaskId}
        projectId={projectId}
        onClose={handleClosePanel}
        members={memberList}
      />
    </div>
  );
}
