import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectMemberGuard } from './project-member.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProjectMemberGuard', () => {
  let guard: ProjectMemberGuard;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      project: { findUnique: jest.fn() },
      sprint: { findUnique: jest.fn() },
      task: { findUnique: jest.fn() },
      comment: { findUnique: jest.fn() },
      workspaceMembership: { findUnique: jest.fn() },
    };
    guard = new ProjectMemberGuard(prisma as unknown as PrismaService);
  });

  function createMockContext(user: any, params: any): ExecutionContext {
    const request = { user, params };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should return false when user is null', async () => {
    const ctx = createMockContext(null, { projectId: 'proj-1' });
    expect(await guard.canActivate(ctx)).toBe(false);
  });

  it('should resolve projectId from params.projectId (Strategy 1)', async () => {
    prisma.project.findUnique.mockResolvedValue({ workspaceId: 'ws-1' });
    prisma.workspaceMembership.findUnique.mockResolvedValue({ role: 'MEMBER' });

    const ctx = createMockContext({ id: 'user-1' }, { projectId: 'proj-1' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.project.findUnique).toHaveBeenCalledWith({
      where: { id: 'proj-1' },
      select: { workspaceId: true },
    });
  });

  it('should resolve via params.sprintId -> sprint -> projectId (Strategy 2)', async () => {
    prisma.sprint.findUnique.mockResolvedValue({ projectId: 'proj-1' });
    prisma.project.findUnique.mockResolvedValue({ workspaceId: 'ws-1' });
    prisma.workspaceMembership.findUnique.mockResolvedValue({ role: 'MEMBER' });

    const ctx = createMockContext({ id: 'user-1' }, { sprintId: 'sprint-1' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.sprint.findUnique).toHaveBeenCalledWith({
      where: { id: 'sprint-1' },
      select: { projectId: true },
    });
  });

  it('should throw NotFoundException when sprint not found (Strategy 2)', async () => {
    prisma.sprint.findUnique.mockResolvedValue(null);

    const ctx = createMockContext({ id: 'user-1' }, { sprintId: 'nonexistent' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  it('should resolve via params.taskId -> task -> projectId (Strategy 3)', async () => {
    prisma.task.findUnique.mockResolvedValue({ projectId: 'proj-1' });
    prisma.project.findUnique.mockResolvedValue({ workspaceId: 'ws-1' });
    prisma.workspaceMembership.findUnique.mockResolvedValue({ role: 'ADMIN' });

    const ctx = createMockContext({ id: 'user-1' }, { taskId: 'task-1' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.task.findUnique).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      select: { projectId: true },
    });
  });

  it('should resolve via params.id as task first, then fall back to comment (Strategy 4)', async () => {
    // Task lookup returns null, comment lookup succeeds
    prisma.task.findUnique.mockResolvedValue(null);
    prisma.comment.findUnique.mockResolvedValue({
      task: { projectId: 'proj-1' },
    });
    prisma.project.findUnique.mockResolvedValue({ workspaceId: 'ws-1' });
    prisma.workspaceMembership.findUnique.mockResolvedValue({ role: 'MEMBER' });

    const ctx = createMockContext({ id: 'user-1' }, { id: 'comment-1' });
    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(prisma.comment.findUnique).toHaveBeenCalledWith({
      where: { id: 'comment-1' },
      select: { task: { select: { projectId: true } } },
    });
  });

  it('should throw NotFoundException when neither task nor comment found (Strategy 4)', async () => {
    prisma.task.findUnique.mockResolvedValue(null);
    prisma.comment.findUnique.mockResolvedValue(null);

    const ctx = createMockContext({ id: 'user-1' }, { id: 'unknown-id' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when user is not a workspace member', async () => {
    prisma.project.findUnique.mockResolvedValue({ workspaceId: 'ws-1' });
    prisma.workspaceMembership.findUnique.mockResolvedValue(null);

    const ctx = createMockContext({ id: 'user-outsider' }, { projectId: 'proj-1' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
