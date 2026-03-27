'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, LogOut, Settings, User } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';

export function TopBar() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '??';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search placeholder */}
      <div className="hidden w-full max-w-md md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search... (Ctrl+K)"
            className="pl-9 cursor-pointer"
            readOnly
            onClick={() => {
              // Trigger Ctrl+K to open command palette
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
            }}
          />
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="pl-12 lg:hidden" />

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Mobile search icon */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <NotificationBell />

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-accent"
          >
            <Avatar className="h-8 w-8">
              {user?.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.firstName} />
              )}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground md:block">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </span>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-card py-1 shadow-lg">
              <div className="border-b border-border px-4 py-2">
                <p className="text-sm font-medium text-foreground">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => setUserMenuOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setUserMenuOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
              <div className="border-t border-border" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
