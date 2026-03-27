'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { useBoardStore } from '@/stores/board-store';
import { useMoveTask } from '@/hooks/use-tasks';
import { TASK_STATUS_ORDER, type TaskStatus } from '@/lib/constants';
import { KanbanColumn } from './kanban-column';
import { TaskCard } from './task-card';
import type { Task } from '@/hooks/use-tasks';

interface KanbanBoardProps {
  onTaskClick: (taskId: string) => void;
  onAddTask: (status: TaskStatus) => void;
  searchQuery?: string | null;
}

export function KanbanBoard({ onTaskClick, onAddTask, searchQuery }: KanbanBoardProps) {
  const { columns, moveTask, rollbackMove, cardDensity, collapsedColumns, toggleColumnCollapse } = useBoardStore();
  const moveTaskMutation = useMoveTask();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Find which column a task is in
  const findColumn = useCallback(
    (taskId: string): TaskStatus | null => {
      for (const status of TASK_STATUS_ORDER) {
        if (columns[status]?.some((t) => t.id === taskId)) {
          return status;
        }
      }
      return null;
    },
    [columns],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const taskId = active.id as string;
      const column = findColumn(taskId);
      if (column) {
        const task = columns[column].find((t) => t.id === taskId);
        if (task) setActiveTask(task);
      }
    },
    [columns, findColumn],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) {
        setOverColumnId(null);
        return;
      }

      const activeId = active.id as string;
      const overId = over.id as string;

      // Determine the target column
      let targetStatus: TaskStatus | null = null;

      if (overId.startsWith('column-')) {
        targetStatus = overId.replace('column-', '') as TaskStatus;
      } else {
        targetStatus = findColumn(overId);
      }

      if (targetStatus) {
        setOverColumnId(targetStatus);
      }

      // Find source and target columns
      const activeColumn = findColumn(activeId);
      if (!activeColumn || !targetStatus) return;

      // If the task is moving between columns, update optimistically
      if (activeColumn !== targetStatus) {
        const activeIndex = columns[activeColumn].findIndex(
          (t) => t.id === activeId,
        );
        if (activeIndex === -1) return;

        let newIndex: number;
        if (overId.startsWith('column-')) {
          newIndex = columns[targetStatus].length;
        } else {
          const overIndex = columns[targetStatus].findIndex(
            (t) => t.id === overId,
          );
          newIndex = overIndex >= 0 ? overIndex : columns[targetStatus].length;
        }

        moveTask(activeId, activeColumn, targetStatus, newIndex);
      }
    },
    [columns, findColumn, moveTask],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);
      setOverColumnId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeColumn = findColumn(activeId);
      if (!activeColumn) return;

      let targetStatus: TaskStatus;
      let newIndex: number;

      if (overId.startsWith('column-')) {
        targetStatus = overId.replace('column-', '') as TaskStatus;
        newIndex = columns[targetStatus].findIndex((t) => t.id === activeId);
        if (newIndex === -1) {
          newIndex = columns[targetStatus].length;
        }
      } else {
        const overColumn = findColumn(overId);
        if (!overColumn) return;
        targetStatus = overColumn;
        newIndex = columns[targetStatus].findIndex((t) => t.id === activeId);
        if (newIndex === -1) {
          newIndex = columns[targetStatus].findIndex((t) => t.id === overId);
        }
      }

      // Calculate position for the API based on surrounding tasks
      const tasksInColumn = columns[targetStatus];
      let position: number;

      if (tasksInColumn.length <= 1) {
        position = 1.0;
      } else if (newIndex === 0) {
        const nextTask = tasksInColumn.find((t) => t.id !== activeId);
        position = nextTask ? nextTask.position / 2 : 1.0;
      } else if (newIndex >= tasksInColumn.length - 1) {
        const lastTask = tasksInColumn.filter((t) => t.id !== activeId).pop();
        position = lastTask ? lastTask.position + 1.0 : tasksInColumn.length;
      } else {
        const others = tasksInColumn.filter((t) => t.id !== activeId);
        const before = others[Math.max(0, newIndex - 1)];
        const after = others[Math.min(newIndex, others.length - 1)];
        if (before && after && before.id !== after.id) {
          position = (before.position + after.position) / 2;
        } else {
          position = newIndex + 1;
        }
      }

      // Find original column and index BEFORE optimistic update
      const currentColumns = useBoardStore.getState().columns;
      let originalStatus: TaskStatus | undefined;
      let originalIndex = 0;
      for (const [status, tasks] of Object.entries(currentColumns)) {
        const idx = tasks.findIndex((t) => t.id === activeId);
        if (idx !== -1) {
          originalStatus = status as TaskStatus;
          originalIndex = idx;
          break;
        }
      }

      // Call server mutation
      moveTaskMutation.mutate(
        {
          taskId: activeId,
          status: targetStatus,
          position,
        },
        {
          onError: () => {
            if (originalStatus) {
              rollbackMove(activeId, originalStatus, originalIndex);
            }
            toast.error('Failed to move task. Reverted.');
          },
        },
      );
    },
    [columns, findColumn, moveTaskMutation, rollbackMove],
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
    setOverColumnId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div id="dnd-instructions" className="sr-only">
        Press Space to pick up a task. Use arrow keys to move it. Press Space again to drop, or Escape to cancel.
      </div>
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {TASK_STATUS_ORDER.map((status, index) => (
          <div
            key={status}
            className={`animate-enter animate-enter-delay-${index + 1}`}
          >
            <KanbanColumn
              status={status}
              tasks={columns[status] || []}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              isOverColumn={overColumnId === status}
              density={cardDensity}
              isCollapsed={collapsedColumns.includes(status)}
              onToggleCollapse={() => toggleColumnCollapse(status)}
              searchQuery={searchQuery}
            />
          </div>
        ))}
      </div>

      {/* Drag overlay — follows cursor */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onClick={() => {}}
            isDragOverlay
            density={cardDensity}
            searchQuery={searchQuery}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
