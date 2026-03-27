'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { DEMO_CURRENT_USER, DEMO_USERS } from '@/demo/data/users';
import type { ActivityResponse, ActivityEntry } from '@/hooks/use-activity';

// Pre-built activity entries for demo tasks
function buildTaskActivity(taskId: string): ActivityEntry[] {
  return [
    {
      id: `demo-activity-${taskId}-1`,
      action: 'CREATED',
      resourceType: 'TASK',
      resourceId: taskId,
      actorId: DEMO_CURRENT_USER.id,
      actor: {
        id: DEMO_CURRENT_USER.id,
        firstName: DEMO_CURRENT_USER.firstName,
        lastName: DEMO_CURRENT_USER.lastName,
        avatarUrl: DEMO_CURRENT_USER.avatarUrl,
      },
      timestamp: '2026-03-17T09:00:00.000Z',
    },
    {
      id: `demo-activity-${taskId}-2`,
      action: 'STATUS_CHANGED',
      resourceType: 'TASK',
      resourceId: taskId,
      actorId: DEMO_USERS[2].id,
      actor: {
        id: DEMO_USERS[2].id,
        firstName: DEMO_USERS[2].firstName,
        lastName: DEMO_USERS[2].lastName,
        avatarUrl: DEMO_USERS[2].avatarUrl,
      },
      before: { status: 'TODO' },
      after: { status: 'IN_PROGRESS' },
      timestamp: '2026-03-20T10:30:00.000Z',
    },
    {
      id: `demo-activity-${taskId}-3`,
      action: 'COMMENT_ADDED',
      resourceType: 'TASK',
      resourceId: taskId,
      actorId: DEMO_USERS[1].id,
      actor: {
        id: DEMO_USERS[1].id,
        firstName: DEMO_USERS[1].firstName,
        lastName: DEMO_USERS[1].lastName,
        avatarUrl: DEMO_USERS[1].avatarUrl,
      },
      timestamp: '2026-03-22T14:00:00.000Z',
    },
  ];
}

function buildProjectActivity(projectId: string): ActivityEntry[] {
  return [
    {
      id: `demo-proj-activity-${projectId}-1`,
      action: 'CREATED',
      resourceType: 'TASK',
      resourceId: 'demo-task-6',
      actorId: DEMO_CURRENT_USER.id,
      actor: {
        id: DEMO_CURRENT_USER.id,
        firstName: DEMO_CURRENT_USER.firstName,
        lastName: DEMO_CURRENT_USER.lastName,
        avatarUrl: DEMO_CURRENT_USER.avatarUrl,
      },
      timestamp: '2026-03-17T09:00:00.000Z',
    },
    {
      id: `demo-proj-activity-${projectId}-2`,
      action: 'STATUS_CHANGED',
      resourceType: 'TASK',
      resourceId: 'demo-task-13',
      actorId: DEMO_USERS[2].id,
      actor: {
        id: DEMO_USERS[2].id,
        firstName: DEMO_USERS[2].firstName,
        lastName: DEMO_USERS[2].lastName,
        avatarUrl: DEMO_USERS[2].avatarUrl,
      },
      before: { status: 'IN_PROGRESS' },
      after: { status: 'IN_REVIEW' },
      timestamp: '2026-03-24T14:00:00.000Z',
    },
    {
      id: `demo-proj-activity-${projectId}-3`,
      action: 'COMMENT_ADDED',
      resourceType: 'TASK',
      resourceId: 'demo-task-9',
      actorId: DEMO_USERS[4].id,
      actor: {
        id: DEMO_USERS[4].id,
        firstName: DEMO_USERS[4].firstName,
        lastName: DEMO_USERS[4].lastName,
        avatarUrl: DEMO_USERS[4].avatarUrl,
      },
      timestamp: '2026-03-25T08:30:00.000Z',
    },
    {
      id: `demo-proj-activity-${projectId}-4`,
      action: 'STATUS_CHANGED',
      resourceType: 'TASK',
      resourceId: 'demo-task-23',
      actorId: DEMO_USERS[4].id,
      actor: {
        id: DEMO_USERS[4].id,
        firstName: DEMO_USERS[4].firstName,
        lastName: DEMO_USERS[4].lastName,
        avatarUrl: DEMO_USERS[4].avatarUrl,
      },
      before: { status: 'IN_REVIEW' },
      after: { status: 'DONE' },
      timestamp: '2026-03-24T15:00:00.000Z',
    },
  ];
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useDemoTaskActivity(taskId: string) {
  return useInfiniteQuery<ActivityResponse>({
    queryKey: ['activity', 'task', taskId],
    queryFn: () =>
      Promise.resolve({
        data: buildTaskActivity(taskId),
        nextCursor: null,
        hasMore: false,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: () => undefined,
    enabled: !!taskId,
    staleTime: Infinity,
  });
}

export function useDemoProjectActivity(
  projectId: string,
  _filters?: { action?: string; actorId?: string },
) {
  return useInfiniteQuery<ActivityResponse>({
    queryKey: ['activity', 'project', projectId, _filters],
    queryFn: () =>
      Promise.resolve({
        data: buildProjectActivity(projectId),
        nextCursor: null,
        hasMore: false,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: () => undefined,
    enabled: !!projectId,
    staleTime: Infinity,
  });
}
