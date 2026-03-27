'use client';

import { useParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, LayoutGrid, List, BarChart3, Activity, Layers } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Board', value: 'board', icon: LayoutGrid },
  { label: 'List', value: 'list', icon: List },
  { label: 'Sprints', value: 'sprints', icon: Layers },
  { label: 'Analytics', value: 'analytics', icon: BarChart3 },
  { label: 'Activity', value: 'activity', icon: Activity },
];

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const slug = params.slug as string;

  const { data: project, isLoading } = useProject(projectId);

  // Determine active tab from pathname
  const activeTab = pathname.split('/').pop() || 'board';

  const navigateToTab = (tab: string) => {
    router.push(`/workspaces/${slug}/projects/${projectId}/${tab}`);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Project header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/workspaces/${slug}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isLoading ? (
            <Skeleton variant="text" className="h-7 w-48" />
          ) : (
            <h1 className="text-xl font-bold text-foreground">
              {project?.name ?? 'Project'}
            </h1>
          )}
        </div>

        {/* Nav tabs */}
        <div className="mt-3 flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => navigateToTab(item.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-auto pt-4">{children}</div>
    </div>
  );
}
