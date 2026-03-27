'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import type { TasksResponse, Task } from '@/hooks/use-tasks';
import { isDemoMode } from '@/demo';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface TaskEvent {
  taskId: string;
  projectId: string;
  userId: string;
  data: any;
}

// Module-level singleton
let socketInstance: Socket | null = null;
let refCount = 0;

// NOTE: reconnection backoff is handled by socket.io client defaults (exponential
// up to 5s). If we add collaborative cursors later this will need revisiting.
function getSocket(token: string): Socket {
  if (!socketInstance) {
    socketInstance = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });
  }
  return socketInstance;
}

function releaseSocket() {
  refCount--;
  if (refCount <= 0 && socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    refCount = 0;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const _noop = (_projectId: string) => {};

export function useSocket() {
  // isDemoMode is a build-time constant — hook call order is stable across renders
  if (isDemoMode) return { socket: null, isConnected: false, joinBoard: _noop, leaveBoard: _noop };

  /* eslint-disable react-hooks/rules-of-hooks */
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;
    refCount++;

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = () => {
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // If already connected, sync state
    if (socket.connected) {
      setIsConnected(true);
    }

    // ------------------------------------------------------------------
    // Real-time event handlers — update TanStack Query cache directly
    // ------------------------------------------------------------------

    const onTaskCreated = (payload: TaskEvent) => {
      const { projectId, data: newTask } = payload;
      queryClient.setQueryData<TasksResponse>(
        ['tasks', { projectId }],
        (old) => {
          if (!old) return old;
          const status = newTask.status as string;
          const newGrouped = { ...old.grouped };
          newGrouped[status] = [...(newGrouped[status] || []), newTask];
          return {
            ...old,
            tasks: [...old.tasks, newTask],
            grouped: newGrouped,
          };
        },
      );
    };

    const onTaskUpdated = (payload: TaskEvent) => {
      const { projectId, data } = payload;
      const updatedTask: Task = data.after || data;
      queryClient.setQueryData<TasksResponse>(
        ['tasks', { projectId }],
        (old) => {
          if (!old) return old;
          const newTasks = old.tasks.map((t) =>
            t.id === updatedTask.id ? { ...t, ...updatedTask } : t,
          );
          const newGrouped: Record<string, Task[]> = {};
          for (const task of newTasks) {
            if (!newGrouped[task.status]) {
              newGrouped[task.status] = [];
            }
            newGrouped[task.status].push(task);
          }
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );
      // Also invalidate individual task detail if cached
      queryClient.invalidateQueries({
        queryKey: ['tasks', updatedTask.id],
      });
    };

    const onTaskMoved = (payload: TaskEvent) => {
      const { projectId, taskId, data: moveData } = payload;
      queryClient.setQueryData<TasksResponse>(
        ['tasks', { projectId }],
        (old) => {
          if (!old) return old;
          const newTasks = old.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: moveData.newStatus,
                  position: moveData.newPosition,
                }
              : t,
          );
          const newGrouped: Record<string, Task[]> = {};
          for (const task of newTasks) {
            if (!newGrouped[task.status]) {
              newGrouped[task.status] = [];
            }
            newGrouped[task.status].push(task);
          }
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );
    };

    const onTaskDeleted = (payload: TaskEvent) => {
      const { projectId, taskId } = payload;
      queryClient.setQueryData<TasksResponse>(
        ['tasks', { projectId }],
        (old) => {
          if (!old) return old;
          const newTasks = old.tasks.filter((t) => t.id !== taskId);
          const newGrouped: Record<string, Task[]> = {};
          for (const task of newTasks) {
            if (!newGrouped[task.status]) {
              newGrouped[task.status] = [];
            }
            newGrouped[task.status].push(task);
          }
          return { ...old, tasks: newTasks, grouped: newGrouped };
        },
      );
    };

    // Sprint completed — invalidate tasks + sprints queries so board refreshes
    const onSprintCompleted = (payload: { projectId: string; sprintId: string }) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', { projectId: payload.projectId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: payload.projectId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', { projectId: payload.projectId, active: true }],
      });
      queryClient.invalidateQueries({
        queryKey: ['sprints', payload.sprintId],
      });
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:moved', onTaskMoved);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('sprint:completed', onSprintCompleted);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:moved', onTaskMoved);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('sprint:completed', onSprintCompleted);
      socketRef.current = null;
      setIsConnected(false);
      releaseSocket();
    };
  }, [queryClient]);

  const joinBoard = useCallback((projectId: string) => {
    socketRef.current?.emit('joinBoard', { projectId });
  }, []);

  const leaveBoard = useCallback((projectId: string) => {
    socketRef.current?.emit('leaveBoard', { projectId });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinBoard,
    leaveBoard,
  };
}
