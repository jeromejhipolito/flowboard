'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useQueryParam } from '@/hooks/use-query-param';
import { useWorkspaces } from '@/hooks/use-workspaces';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateWorkspaceModal } from '@/components/workspace/create-workspace-modal';
import { Plus, Users, FolderKanban } from 'lucide-react';

export default function WorkspacesPage() {
  return (
    <Suspense>
      <WorkspacesPageContent />
    </Suspense>
  );
}

function WorkspacesPageContent() {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [action, setAction] = useQueryParam('action');

  // Command palette fires ?action=create-workspace — open the modal then clear
  // the param so it doesn't re-trigger on back-navigation.
  useEffect(() => {
    if (action === 'create-workspace') {
      setCreateModalOpen(true);
      setAction(null);
    }
  }, [action, setAction]);

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="text" className="h-10 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" className="h-44" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-destructive">Failed to load workspaces</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspaces</h1>
          <p className="text-sm text-muted-foreground">
            Manage your workspaces and projects
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      {workspaces && workspaces.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace: any) => (
            <Link
              key={workspace.id}
              href={`/workspaces/${workspace.slug}`}
            >
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {workspace.name}
                        </CardTitle>
                      </div>
                    </div>
                    {workspace.role && (
                      <Badge
                        variant={
                          workspace.role === 'OWNER'
                            ? 'default'
                            : workspace.role === 'ADMIN'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {workspace.role}
                      </Badge>
                    )}
                  </div>
                  {workspace.description && (
                    <CardDescription className="mt-2 line-clamp-2">
                      {workspace.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {workspace.memberCount ?? 0}{' '}
                      {workspace.memberCount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16">
          <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            No workspaces yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first workspace to get started.
          </p>
          <Button
            className="mt-4"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </Card>
      )}

      <CreateWorkspaceModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
