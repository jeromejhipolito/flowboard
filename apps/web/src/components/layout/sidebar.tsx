'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useWorkspaces } from '@/hooks/use-workspaces';
import {
  FolderKanban,
  LayoutDashboard,
  LayoutGrid,
  List,
  BarChart3,
  Activity,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { ThemeToggle } from '@/components/theme-toggle';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { data: workspaces } = useWorkspaces();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspacesExpanded, setWorkspacesExpanded] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  // Extract current workspace slug and project ID from the pathname
  const workspaceSlugMatch = pathname.match(/\/workspaces\/([^/]+)/);
  const currentWorkspaceSlug = workspaceSlugMatch
    ? workspaceSlugMatch[1]
    : null;
  const currentWorkspace = workspaces?.find(
    (w: any) => w.slug === currentWorkspaceSlug,
  );

  const projectIdMatch = pathname.match(/\/projects\/([^/]+)/);
  const currentProjectId = projectIdMatch ? projectIdMatch[1] : null;
  const activeProjectTab = pathname.split('/').pop() || 'board';

  // Fetch projects for the current workspace
  const { data: projects } = useProjects(currentWorkspace?.id ?? '');

  const navLinks = [
    {
      href: '/workspaces',
      label: 'Workspaces',
      icon: LayoutDashboard,
      active: pathname === '/workspaces',
    },
  ];

  const workspaceLinks = currentWorkspaceSlug
    ? [
        {
          href: `/workspaces/${currentWorkspaceSlug}`,
          label: 'Projects',
          icon: FolderKanban,
          active:
            pathname === `/workspaces/${currentWorkspaceSlug}` ||
            pathname.startsWith(`/workspaces/${currentWorkspaceSlug}/projects`),
        },
        {
          href: `/workspaces/${currentWorkspaceSlug}?tab=members`,
          label: 'Members',
          icon: Users,
          active: pathname.includes('tab=members'),
        },
        {
          href: `/workspaces/${currentWorkspaceSlug}?tab=settings`,
          label: 'Settings',
          icon: Settings,
          active: pathname.includes('tab=settings'),
        },
      ]
    : [];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Branding */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <FolderKanban className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground">
          <span className="bg-gradient-to-br from-[#5b4ff5] via-[#8b5cf6] to-[#c4b5fd] bg-clip-text text-transparent">Flow</span>Board
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150',
              link.active
                ? 'bg-primary/12 text-primary font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}

        {/* Workspace Selector */}
        {workspaces && workspaces.length > 0 && (
          <>
            <div className="my-4 border-t border-border" />
            <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Workspaces</p>
            <button
              onClick={() => setWorkspacesExpanded(!workspacesExpanded)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground"
            >
              <span className="truncate">
                {currentWorkspace
                  ? currentWorkspace.name
                  : 'Select Workspace'}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  workspacesExpanded && 'rotate-180',
                )}
              />
            </button>

            {workspacesExpanded && (
              <div className="ml-2 space-y-1">
                {/* Workspace list */}
                {workspaces.map((ws: any) => (
                  <Link
                    key={ws.id}
                    href={`/workspaces/${ws.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-150',
                      ws.slug === currentWorkspaceSlug
                        ? 'bg-primary/12 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <div
                      className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Workspace-specific links */}
            {currentWorkspaceSlug && workspaceLinks.length > 0 && (
              <>
                <div className="my-2 border-t border-border" />
                <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Workspace</p>
                {workspaceLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150',
                      link.active
                        ? 'bg-primary/12 text-primary font-semibold before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            {/* Projects list with collapsible nav */}
            {currentWorkspaceSlug && projects && projects.length > 0 && (
              <>
                <div className="my-2 border-t border-border" />
                <button
                  onClick={() => setProjectsExpanded(!projectsExpanded)}
                  className="flex w-full items-center justify-between px-3 py-1"
                >
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Projects</p>
                  <ChevronDown
                    className={cn(
                      'h-3 w-3 text-muted-foreground/60 transition-transform',
                      projectsExpanded && 'rotate-180',
                    )}
                  />
                </button>
                {projectsExpanded && (
                  <div className="space-y-0.5">
                    {projects.map((project: any) => {
                      const isActiveProject = currentProjectId === project.id;
                      const projectBasePath = `/workspaces/${currentWorkspaceSlug}/projects/${project.id}`;
                      const projectTabs = [
                        { label: 'Board', value: 'board', icon: LayoutGrid },
                        { label: 'Analytics', value: 'analytics', icon: BarChart3 },
                        { label: 'Activity', value: 'activity', icon: Activity },
                      ];

                      return (
                        <div key={project.id}>
                          {/* Project name - collapsible */}
                          <Link
                            href={`${projectBasePath}/board`}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-150',
                              isActiveProject
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                            )}
                          >
                            <ChevronRight
                              className={cn(
                                'h-3 w-3 shrink-0 transition-transform',
                                isActiveProject && 'rotate-90',
                              )}
                            />
                            <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{project.name}</span>
                          </Link>

                          {/* Project sub-navigation - only visible when project is active */}
                          {isActiveProject && (
                            <div className="ml-5 space-y-0.5 border-l border-border pl-3">
                              {projectTabs.map((tab) => {
                                const tabPath = `${projectBasePath}/${tab.value}`;
                                const isActiveTab = activeProjectTab === tab.value;
                                const Icon = tab.icon;
                                return (
                                  <Link
                                    key={tab.value}
                                    href={tabPath}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                      'relative flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-all duration-150',
                                      isActiveTab
                                        ? 'bg-primary/12 text-primary font-semibold'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                    )}
                                  >
                                    <Icon className="h-3 w-3" />
                                    {tab.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </nav>

      {/* Spacer */}
      <div className="border-t border-border p-2" />
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        className="fixed left-4 top-4 z-50 rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-card transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden w-64 shrink-0 border-r border-border bg-card lg:block',
          className,
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
