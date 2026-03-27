'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Plus,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Search,
  FileText,
  Clock,
  Zap,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiParse } from '@/hooks/use-ai-parse';
import { isDemoMode } from '@/demo';
import { toast } from 'sonner';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const aiParse = useAiParse();

  // Extract routing context from the current URL so quick actions can navigate
  // intelligently. Falls back gracefully when context is unavailable.
  const workspaceSlugMatch = pathname.match(/\/workspaces\/([^/]+)/);
  const currentWorkspaceSlug = workspaceSlugMatch?.[1] ?? null;
  const projectIdMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = projectIdMatch?.[1] ?? null;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toggle handler for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setInputValue('');
      aiParse.reset();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    }
  }, [open]);

  // Debounced AI parse trigger
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (inputValue.length > 15) {
      debounceRef.current = setTimeout(() => {
        if (isDemoMode) {
          toast.info('AI parsing disabled in demo mode');
          return;
        }
        aiParse.mutate({ input: inputValue });
      }, 600);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue]);

  const runAction = useCallback(
    (action: () => void) => {
      setOpen(false);
      action();
    },
    [],
  );

  const handleAiTaskCreate = useCallback(() => {
    // Navigate to the board and open the create-task modal. AI-parsed field
    // pre-filling is handled by the board page via the action param.
    runAction(() => {
      if (currentWorkspaceSlug && currentProjectId) {
        router.push(
          `/workspaces/${currentWorkspaceSlug}/projects/${currentProjectId}/board?action=create-task`,
        );
      } else if (currentWorkspaceSlug) {
        router.push(`/workspaces/${currentWorkspaceSlug}`);
      } else {
        router.push('/workspaces');
      }
    });
  }, [currentWorkspaceSlug, currentProjectId, router, runAction]);

  const showAiSection = inputValue.length > 15;
  const aiResult = aiParse.data?.success ? aiParse.data.data : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={() => setOpen(false)}
      />

      {/* Command dialog */}
      <div className="fixed left-1/2 top-[20%] z-[101] w-full max-w-lg -translate-x-1/2 animate-in fade-in-0 slide-in-from-top-4 duration-200">
        <Command
          className="mx-4 overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          shouldFilter={!showAiSection}
        >
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Type a command or describe a task for AI parsing..."
              className="flex h-12 w-full bg-transparent py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              value={inputValue}
              onValueChange={setInputValue}
            />
            <kbd className="ml-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[320px] overflow-y-auto p-2">
            <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
              {inputValue.length > 15
                ? 'Press Enter to create a task from your description'
                : 'No results found.'}
            </Command.Empty>

            {/* AI Parse Result */}
            {showAiSection && (
              <Command.Group
                heading={
                  <span className="flex items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    AI Task Parser
                  </span>
                }
              >
                {aiParse.isPending && (
                  <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Parsing with AI...</span>
                  </div>
                )}

                {aiResult && (
                  <Command.Item
                    value={`ai-create-${aiResult.title}`}
                    onSelect={handleAiTaskCreate}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground',
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      'transition-colors',
                    )}
                  >
                    <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">
                        Create: &quot;{aiResult.title}&quot;
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className={cn(
                          'rounded px-1 py-0.5 text-[10px] font-medium',
                          aiResult.priority === 'URGENT' && 'bg-red-500/10 text-red-500',
                          aiResult.priority === 'HIGH' && 'bg-orange-500/10 text-orange-500',
                          aiResult.priority === 'MEDIUM' && 'bg-yellow-500/10 text-yellow-500',
                          aiResult.priority === 'LOW' && 'bg-blue-500/10 text-blue-500',
                        )}>
                          {aiResult.priority}
                        </span>
                        {aiResult.dueDate && (
                          <span>Due: {new Date(aiResult.dueDate).toLocaleDateString()}</span>
                        )}
                        {aiResult.assigneeId && <span>Assigned</span>}
                      </div>
                    </div>
                    <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Enter
                    </kbd>
                  </Command.Item>
                )}

                {!aiParse.isPending && !aiResult && aiParse.isError && (
                  <Command.Item
                    value="ai-create-manual"
                    onSelect={handleAiTaskCreate}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground',
                      'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      'transition-colors',
                    )}
                  >
                    <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1">Press Enter to create manually</span>
                  </Command.Item>
                )}

                {!aiParse.isPending && !aiResult && !aiParse.isError && aiParse.isIdle && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Type a task description for AI parsing
                  </div>
                )}
              </Command.Group>
            )}

            {/* Quick Actions */}
            <Command.Group
              heading={
                <span className="px-2 text-xs font-medium text-muted-foreground">
                  Quick Actions
                </span>
              }
            >
              <CommandItem
                icon={Plus}
                label="Create Task"
                shortcut="T"
                onSelect={() =>
                  runAction(() => {
                    // Navigate to the board for the current project if available,
                    // with an action param that opens the create-task modal.
                    // Falls back to workspaces if no project context exists.
                    if (currentWorkspaceSlug && currentProjectId) {
                      router.push(
                        `/workspaces/${currentWorkspaceSlug}/projects/${currentProjectId}/board?action=create-task`,
                      );
                    } else if (currentWorkspaceSlug) {
                      router.push(`/workspaces/${currentWorkspaceSlug}`);
                    } else {
                      router.push('/workspaces');
                    }
                  })
                }
              />
              <CommandItem
                icon={FolderKanban}
                label="Create Project"
                shortcut="P"
                onSelect={() =>
                  runAction(() => {
                    // Navigate to the current workspace's projects tab if available,
                    // otherwise land on /workspaces so the user can select one first.
                    if (currentWorkspaceSlug) {
                      router.push(`/workspaces/${currentWorkspaceSlug}?tab=projects&action=create-project`);
                    } else {
                      router.push('/workspaces');
                    }
                  })
                }
              />
              <CommandItem
                icon={Zap}
                label="Create Workspace"
                shortcut="W"
                onSelect={() =>
                  runAction(() => {
                    // Navigate to workspaces list with a trigger param; the page
                    // reads this via nuqs and auto-opens the create modal.
                    router.push('/workspaces?action=create-workspace');
                  })
                }
              />
            </Command.Group>

            {/* Navigation */}
            <Command.Group
              heading={
                <span className="px-2 text-xs font-medium text-muted-foreground">
                  Navigation
                </span>
              }
            >
              <CommandItem
                icon={LayoutDashboard}
                label="Go to Workspaces"
                onSelect={() => runAction(() => router.push('/workspaces'))}
              />
              <CommandItem
                icon={Settings}
                label="Go to Settings"
                onSelect={() =>
                  runAction(() => router.push('/workspaces?tab=settings'))
                }
              />
            </Command.Group>

            {/* Recent */}
            <Command.Group
              heading={
                <span className="px-2 text-xs font-medium text-muted-foreground">
                  Recent
                </span>
              }
            >
              <CommandItem
                icon={Clock}
                label="Dashboard"
                onSelect={() => runAction(() => router.push('/workspaces'))}
              />
              <CommandItem
                icon={FileText}
                label="Recent Task"
                onSelect={() =>
                  runAction(() => {
                    // Placeholder: navigate to most recent task
                  })
                }
              />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

function CommandItem({
  icon: Icon,
  label,
  shortcut,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground',
        'aria-selected:bg-accent aria-selected:text-accent-foreground',
        'transition-colors',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
