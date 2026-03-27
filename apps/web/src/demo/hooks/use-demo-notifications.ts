'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  DEMO_NOTIFICATIONS,
  DEMO_UNREAD_COUNT,
} from '@/demo/data/notifications';
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from '@/hooks/use-notifications';

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useDemoNotifications(query?: { read?: boolean }) {
  return useInfiniteQuery<NotificationsResponse>({
    queryKey: ['notifications', query],
    queryFn: () => {
      let filtered = DEMO_NOTIFICATIONS;
      if (query?.read !== undefined) {
        filtered = filtered.filter((n) => n.read === query.read);
      }
      return Promise.resolve({
        data: filtered,
        nextCursor: null,
        hasMore: false,
      });
    },
    initialPageParam: null as string | null,
    getNextPageParam: () => undefined,
    staleTime: Infinity,
  });
}

export function useDemoUnreadCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => Promise.resolve({ count: DEMO_UNREAD_COUNT }),
    staleTime: Infinity,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useDemoMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      // Update the notifications infinite query cache
      queryClient.setQueriesData<{
        pages: NotificationsResponse[];
        pageParams: (string | null)[];
      }>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((n: Notification) =>
              n.id === notificationId ? { ...n, read: true } : n,
            ),
          })),
        };
      });

      // Decrement unread count
      queryClient.setQueryData<UnreadCountResponse>(
        ['notifications', 'unread-count'],
        (old) => ({ count: Math.max(0, (old?.count ?? DEMO_UNREAD_COUNT) - 1) }),
      );

      toast.info('Demo mode — changes are not saved');
      return {};
    },
  });
}

export function useDemoMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      queryClient.setQueriesData<{
        pages: NotificationsResponse[];
        pageParams: (string | null)[];
      }>({ queryKey: ['notifications'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((n: Notification) => ({ ...n, read: true })),
          })),
        };
      });

      queryClient.setQueryData<UnreadCountResponse>(
        ['notifications', 'unread-count'],
        { count: 0 },
      );

      toast.info('Demo mode — changes are not saved');
      return {};
    },
  });
}
