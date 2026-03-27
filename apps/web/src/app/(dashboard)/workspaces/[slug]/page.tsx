'use client';


import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryParam } from '@/hooks/use-query-param';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateMemberRole,
  useRemoveMember,
} from '@/hooks/use-workspaces';
import { useProjects } from '@/hooks/use-projects';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { InviteMemberModal } from '@/components/workspace/invite-member-modal';
import { CreateProjectModal } from '@/components/workspace/create-project-modal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Plus,
  FolderKanban,
  Users,
  Settings,
  Trash2,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const workspaceSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
});

type WorkspaceSettingsFormValues = z.infer<typeof workspaceSettingsSchema>;

export default function WorkspaceDetailPage() {
  return (
    <Suspense>
      <WorkspaceDetailPageContent />
    </Suspense>
  );
}

function WorkspaceDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(slug);
  const { data: members, isLoading: membersLoading } = useWorkspaceMembers(
    workspace?.id ?? '',
  );
  const { data: projects, isLoading: projectsLoading } = useProjects(
    workspace?.id ?? '',
  );

  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();

  const [activeTab, setActiveTab] = useQueryParam('tab', { defaultValue: 'projects' });
  const [action, setAction] = useQueryParam('action');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false);
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null);

  // Determine current user's role in this workspace
  const currentMember = members?.find((m: any) => m.userId === user?.id);
  const isOwner = currentMember?.role === 'OWNER';
  const isAdmin = currentMember?.role === 'ADMIN' || isOwner;

  // Command palette fires ?action=create-project — switch to the projects tab
  // and open the modal, then clear the param so back-navigation is clean.
  useEffect(() => {
    if (action === 'create-project' && isAdmin) {
      setActiveTab('projects');
      setCreateProjectModalOpen(true);
      setAction(null);
    }
  }, [action, isAdmin, setAction, setActiveTab]);

  // Settings form
  const {
    register: registerSettings,
    handleSubmit: handleSettingsSubmit,
    formState: { errors: settingsErrors, isSubmitting: isSettingsSubmitting },
  } = useForm<WorkspaceSettingsFormValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    values: {
      name: workspace?.name ?? '',
      description: workspace?.description ?? '',
    },
  });

  const onSettingsSubmit = async (values: WorkspaceSettingsFormValues) => {
    try {
      await api.patch(`/workspaces/${workspace?.id}`, values);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', slug] });
      toast.success('Workspace updated successfully');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to update workspace',
      );
    }
  };

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/workspaces/${workspace?.id}`);
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted');
      setDeleteWorkspaceOpen(false);
      router.push('/workspaces');
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to delete workspace',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!workspace?.id) return;
    try {
      await updateMemberRole.mutateAsync({
        workspaceId: workspace.id,
        userId,
        role: newRole,
      });
      toast.success('Role updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveMemberConfirm = async () => {
    if (!workspace?.id || !memberToRemove) return;
    try {
      await removeMember.mutateAsync({
        workspaceId: workspace.id,
        userId: memberToRemove.userId,
      });
      toast.success('Member removed');
      setRemoveMemberOpen(false);
      setMemberToRemove(null);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Failed to remove member',
      );
    }
  };

  if (workspaceLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="h-8 w-64" />
        <Skeleton variant="text" className="h-5 w-96" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-destructive">Workspace not found</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/workspaces')}
        >
          Back to Workspaces
        </Button>
      </div>
    );
  }

  const roleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'VIEWER', label: 'Viewer' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {workspace.name}
        </h1>
        {workspace.description && (
          <p className="mt-1 text-muted-foreground">
            {workspace.description}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab ?? 'projects'} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="projects">
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            {isAdmin && (
              <Button onClick={() => setCreateProjectModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>

          {projectsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <a
                  key={project.id}
                  href={`/workspaces/${slug}/projects/${project.id}/board`}
                  className="block"
                >
                  <Card className="cursor-pointer p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16">
              <FolderKanban className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                No projects yet
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first project to start organizing tasks.
              </p>
              {isAdmin && (
                <Button
                  className="mt-4"
                  onClick={() => setCreateProjectModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Members</h2>
            {isAdmin && (
              <Button onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>

          {membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="text" className="h-14" />
              ))}
            </div>
          ) : members && members.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Role
                      </th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.map((member: any) => {
                      const memberInitials = `${member.firstName?.charAt(0) ?? ''}${member.lastName?.charAt(0) ?? ''}`.toUpperCase();
                      const memberName = `${member.firstName} ${member.lastName}`;
                      const isSelf = member.userId === user?.id;
                      const isMemberOwner = member.role === 'OWNER';

                      return (
                        <tr key={member.id}>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                {member.avatarUrl && (
                                  <AvatarImage
                                    src={member.avatarUrl}
                                    alt={memberName}
                                  />
                                )}
                                <AvatarFallback className="text-xs">
                                  {memberInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-foreground">
                                {memberName}
                                {isSelf && (
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    (you)
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                            {member.email}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <Badge
                              variant={
                                member.role === 'OWNER'
                                  ? 'default'
                                  : member.role === 'ADMIN'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {member.role}
                            </Badge>
                          </td>
                          {isAdmin && (
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              {!isMemberOwner && !isSelf && (
                                <div className="flex items-center justify-end gap-2">
                                  <Select
                                    options={roleOptions}
                                    value={member.role}
                                    onChange={(e) =>
                                      handleRoleChange(
                                        member.userId,
                                        e.target.value,
                                      )
                                    }
                                    className="w-28"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setMemberToRemove({ userId: member.userId, name: memberName });
                                      setRemoveMemberOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                No members
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Invite team members to start collaborating.
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          {isAdmin ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                  <CardDescription>
                    Update your workspace name and description.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSettingsSubmit(onSettingsSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="ws-name"
                        className="text-sm font-medium text-foreground"
                      >
                        Name
                      </label>
                      <Input
                        id="ws-name"
                        {...registerSettings('name')}
                      />
                      {settingsErrors.name && (
                        <p className="text-sm text-destructive">
                          {settingsErrors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="ws-desc"
                        className="text-sm font-medium text-foreground"
                      >
                        Description
                      </label>
                      <Input
                        id="ws-desc"
                        {...registerSettings('description')}
                      />
                      {settingsErrors.description && (
                        <p className="text-sm text-destructive">
                          {settingsErrors.description.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSettingsSubmitting}
                    >
                      {isSettingsSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {isOwner && (
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Permanently delete this workspace and all its data. This
                      action cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteWorkspaceOpen(true)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Workspace
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-16">
              <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                Access Restricted
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Only workspace owners and admins can manage settings.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {workspace?.id && (
        <>
          <InviteMemberModal
            open={inviteModalOpen}
            onOpenChange={setInviteModalOpen}
            workspaceId={workspace.id}
          />
          <CreateProjectModal
            open={createProjectModalOpen}
            onOpenChange={setCreateProjectModalOpen}
            workspaceId={workspace.id}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteWorkspaceOpen}
        onOpenChange={setDeleteWorkspaceOpen}
        title="Delete Workspace"
        description="Are you sure you want to delete this workspace? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteWorkspace}
        isLoading={isDeleting}
      />

      <ConfirmDialog
        open={removeMemberOpen}
        onOpenChange={(open) => {
          setRemoveMemberOpen(open);
          if (!open) setMemberToRemove(null);
        }}
        title="Remove Member"
        description={`Remove ${memberToRemove?.name ?? 'this member'} from this workspace?`}
        confirmLabel="Remove"
        onConfirm={handleRemoveMemberConfirm}
        isLoading={removeMember.isPending}
      />
    </div>
  );
}
