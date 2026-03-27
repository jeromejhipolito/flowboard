'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import api from '@/lib/api';
import { isDemoMode } from '@/demo';
import {
  useDemoNotifications,
  useDemoUnreadCount,
  useDemoMarkAsRead,
  useDemoMarkAllAsRead,
} from '@/demo/hooks/use-demo-notifications';

export interface NotificationActor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'MENTION'
  | 'MEMBER_INVITED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  resourceType: string;
  resourceId: string;
  actorId: string;
  actor?: NotificationActor;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

interface NotificationsQuery {
  read?: boolean;
}

// Fetch notifications with cursor pagination
export function useNotifications(query?: NotificationsQuery) {
  if (isDemoMode) return useDemoNotifications(query);
  return useInfiniteQuery<NotificationsResponse>({
    queryKey: ['notifications', query],
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = { limit: 20 };
      if (pageParam) params.cursor = pageParam;
      if (query?.read !== undefined) params.read = query.read;
      const { data } = await api.get('/notifications', { params });
      return data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
}

// Fetch unread notification count (polls every 30 seconds)
export function useUnreadCount() {
  if (isDemoMode) return useDemoUnreadCount();
  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data;
    },
    refetchInterval: 30000,
  });
}

// Mark a single notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoMarkAsRead();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(
        `/notifications/${notificationId}/read`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  if (isDemoMode) return useDemoMarkAllAsRead();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
