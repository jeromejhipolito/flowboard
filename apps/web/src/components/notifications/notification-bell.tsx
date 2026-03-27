'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUnreadCount } from '@/hooks/use-notifications';
import { useSocket } from '@/hooks/use-socket';
import { NotificationPanel } from './notification-panel';

export function NotificationBell() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const { data: unreadData } = useUnreadCount();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const count = unreadData?.count ?? 0;

  // Listen for real-time notification events
  const handleNewNotification = useCallback(
    (payload: { message?: string }) => {
      // Optimistically increment unread count
      queryClient.setQueryData(
        ['notifications', 'unread-count'],
        (old: { count: number } | undefined) => ({
          count: (old?.count ?? 0) + 1,
        }),
      );

      // Invalidate notification list so it refetches
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      // Show toast
      toast.info(payload?.message ?? 'You have a new notification', {
        action: {
          label: 'View',
          onClick: () => setPanelOpen(true),
        },
      });

      // Trigger pulse animation
      setPulse(true);
    },
    [queryClient],
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  // Reset pulse after animation
  useEffect(() => {
    if (pulse) {
      const timer = setTimeout(() => setPulse(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [pulse]);

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={togglePanel}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            className={cn(
              'absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold text-white',
              pulse && 'animate-pulse',
            )}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>

      <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
