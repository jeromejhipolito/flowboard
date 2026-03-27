'use client';

import { useEffect, useRef, useCallback } from 'react';
import FocusTrap from 'focus-trap-react';
import {
  isToday,
  isYesterday,
  isThisWeek,
} from 'date-fns';
import { X, CheckCheck, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications, useMarkAllAsRead } from '@/hooks/use-notifications';
import { NotificationItem } from './notification-item';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

type DateGroup = 'Today' | 'Yesterday' | 'This Week' | 'Older';

function groupNotificationsByDate(
  notifications: Notification[],
): Record<DateGroup, Notification[]> {
  const groups: Record<DateGroup, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: [],
  };

  for (const notification of notifications) {
    const date = new Date(notification.createdAt);
    if (isToday(date)) {
      groups.Today.push(notification);
    } else if (isYesterday(date)) {
      groups.Yesterday.push(notification);
    } else if (isThisWeek(date)) {
      groups['This Week'].push(notification);
    } else {
      groups.Older.push(notification);
    }
  }

  return groups;
}

const DATE_GROUP_ORDER: DateGroup[] = [
  'Today',
  'Yesterday',
  'This Week',
  'Older',
];

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const markAllAsRead = useMarkAllAsRead();

  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useNotifications();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) {
      // Delay attaching to avoid the toggle-click from immediately closing
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open, onClose]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allNotifications =
    data?.pages.flatMap((page) => page.data ?? []) ?? [];
  const grouped = groupNotificationsByDate(allNotifications);
  const isEmpty = allNotifications.length === 0 && !isLoading;

  return (
    <FocusTrap
      active={open}
      focusTrapOptions={{
        allowOutsideClick: true,
        escapeDeactivates: true,
        returnFocusOnDeactivate: true,
      }}
    >
      <div>
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0 z-40 bg-black/20 transition-opacity duration-200',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
          className={cn(
            'fixed right-0 top-0 z-50 flex h-full w-[320px] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300 ease-in-out',
            open ? 'translate-x-0' : 'translate-x-full',
          )}
        >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-foreground">
            Notifications
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="text-xs"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all as read
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton variant="circle" className="h-8 w-8" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton variant="text" className="h-4 w-full" />
                    <Skeleton variant="text" className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <Bell className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                You&apos;re all caught up
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                No new notifications
              </p>
            </div>
          ) : (
            <>
              {DATE_GROUP_ORDER.map((group) => {
                const items = grouped[group];
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-1.5 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group}
                      </p>
                    </div>
                    {items.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                );
              })}

              {isFetchingNextPage && (
                <div className="flex justify-center py-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </FocusTrap>
  );
}
