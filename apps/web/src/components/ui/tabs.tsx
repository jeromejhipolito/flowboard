'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)} data-active-tab={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab: value,
            onTabChange: onValueChange,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

function TabsList({
  children,
  className,
  activeTab,
  onTabChange,
}: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-start gap-1 rounded-md bg-muted p-1',
        className,
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeTab,
            onTabChange,
          });
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

function TabsTrigger({
  value,
  children,
  className,
  activeTab,
  onTabChange,
}: TabsTriggerProps) {
  const isActive = activeTab === value;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      onClick={() => onTabChange?.(value)}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeTab?: string;
}

function TabsContent({
  value,
  children,
  className,
  activeTab,
}: TabsContentProps) {
  if (activeTab !== value) return null;

  return (
    <div className={cn('mt-4', className)}>
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
