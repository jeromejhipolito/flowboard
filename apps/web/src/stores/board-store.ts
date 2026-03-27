import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TaskStatus } from '@/lib/constants';
import type { Task } from '@/hooks/use-tasks';

export type CardDensity = 'compact' | 'expanded';

interface BoardState {
  columns: Record<TaskStatus, Task[]>;
  activeTaskId: string | null;
  cardDensity: CardDensity;
  collapsedColumns: string[];

  setColumns: (columns: Record<TaskStatus, Task[]>) => void;
  moveTask: (
    taskId: string,
    fromStatus: TaskStatus,
    toStatus: TaskStatus,
    newIndex: number,
  ) => void;
  rollbackMove: (
    taskId: string,
    originalStatus: TaskStatus,
    originalIndex: number,
  ) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  removeTask: (taskId: string) => void;
  setActiveTaskId: (taskId: string | null) => void;
  setCardDensity: (density: CardDensity) => void;
  toggleColumnCollapse: (status: string) => void;
}

const defaultColumns: Record<TaskStatus, Task[]> = {
  BACKLOG: [],
  TODO: [],
  IN_PROGRESS: [],
  IN_REVIEW: [],
  DONE: [],
};

export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
  columns: { ...defaultColumns },
  activeTaskId: null,
  cardDensity: 'expanded' as CardDensity,
  collapsedColumns: [] as string[],

  setColumns: (columns) => {
    set({
      columns: {
        BACKLOG: columns.BACKLOG || [],
        TODO: columns.TODO || [],
        IN_PROGRESS: columns.IN_PROGRESS || [],
        IN_REVIEW: columns.IN_REVIEW || [],
        DONE: columns.DONE || [],
      },
    });
  },

  moveTask: (taskId, fromStatus, toStatus, newIndex) => {
    set((state) => {
      const newColumns = { ...state.columns };

      // Find and remove the task from the source column
      const sourceColumn = [...newColumns[fromStatus]];
      const taskIndex = sourceColumn.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return state;

      const [movedTask] = sourceColumn.splice(taskIndex, 1);
      newColumns[fromStatus] = sourceColumn;

      // Insert the task into the destination column at the specified index
      const destColumn = fromStatus === toStatus
        ? sourceColumn
        : [...newColumns[toStatus]];
      const updatedTask = { ...movedTask, status: toStatus };
      destColumn.splice(newIndex, 0, updatedTask);
      newColumns[toStatus] = destColumn;

      return { columns: newColumns };
    });
  },

  rollbackMove: (taskId, originalStatus, originalIndex) => {
    set((state) => {
      const newColumns = { ...state.columns };

      // Find and remove the task from wherever it currently is
      let movedTask: Task | null = null;
      for (const status of Object.keys(newColumns) as TaskStatus[]) {
        const column = [...newColumns[status]];
        const index = column.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          [movedTask] = column.splice(index, 1);
          newColumns[status] = column;
          break;
        }
      }

      if (!movedTask) return state;

      // Re-insert at original position
      const targetColumn = [...newColumns[originalStatus]];
      const restoredTask = { ...movedTask, status: originalStatus };
      targetColumn.splice(
        Math.min(originalIndex, targetColumn.length),
        0,
        restoredTask,
      );
      newColumns[originalStatus] = targetColumn;

      return { columns: newColumns };
    });
  },

  addTask: (task) => {
    set((state) => {
      const status = task.status as TaskStatus;
      const newColumns = { ...state.columns };
      newColumns[status] = [...(newColumns[status] || []), task];
      return { columns: newColumns };
    });
  },

  updateTask: (taskId, data) => {
    set((state) => {
      const newColumns = { ...state.columns };
      for (const status of Object.keys(newColumns) as TaskStatus[]) {
        const column = newColumns[status];
        const index = column.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          const updatedColumn = [...column];
          updatedColumn[index] = { ...updatedColumn[index], ...data };
          newColumns[status] = updatedColumn;
          break;
        }
      }
      return { columns: newColumns };
    });
  },

  removeTask: (taskId) => {
    set((state) => {
      const newColumns = { ...state.columns };
      for (const status of Object.keys(newColumns) as TaskStatus[]) {
        const column = newColumns[status];
        const index = column.findIndex((t) => t.id === taskId);
        if (index !== -1) {
          newColumns[status] = column.filter((t) => t.id !== taskId);
          break;
        }
      }
      return { columns: newColumns };
    });
  },

  setActiveTaskId: (taskId) => {
    set({ activeTaskId: taskId });
  },

  setCardDensity: (density) => {
    set({ cardDensity: density });
  },

  toggleColumnCollapse: (status) => {
    set((state) => {
      const isCollapsed = state.collapsedColumns.includes(status);
      return {
        collapsedColumns: isCollapsed
          ? state.collapsedColumns.filter((s) => s !== status)
          : [...state.collapsedColumns, status],
      };
    });
  },
    }),
    {
      name: 'flowboard-board-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cardDensity: state.cardDensity,
        collapsedColumns: state.collapsedColumns,
      }),
    },
  ),
);
