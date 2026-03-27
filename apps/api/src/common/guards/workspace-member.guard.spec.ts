import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { WorkspaceMemberGuard } from './workspace-member.guard';
import { PrismaService } from '../../prisma/prisma.service';

describe('WorkspaceMemberGuard', () => {
  let guard: WorkspaceMemberGuard;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      workspace: { findUnique: jest.fn() },
      workspaceMembership: { findUnique: jest.fn() },
    };
    guard = new WorkspaceMemberGuard(prisma as unknown as PrismaService);
  });

  function createMockContext(user: any, params: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user, params }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should return false when user is null', async () => {
    const ctx = createMockContext(null, { id: 'ws-1' });
    expect(await guard.canActivate(ctx)).toBe(false);
  });

  it('should throw ForbiddenException when user is not a member', async () => {
    prisma.workspaceMembership.findUnique.mockResolvedValue(null);
    const ctx = createMockContext({ id: 'user-1' }, { id: 'cmn6yr0zw00057k7oib5t7oc3' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should resolve slug to ID before checking membership', async () => {
    prisma.workspace.findUnique.mockResolvedValue({ id: 'real-cuid-id' });
    prisma.workspaceMembership.findUnique.mockResolvedValue({ role: 'MEMBER' });
    const ctx = createMockContext({ id: 'user-1' }, { id: 'my-workspace-slug' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(prisma.workspace.findUnique).toHaveBeenCalledWith({
      where: { slug: 'my-workspace-slug' },
      select: { id: true },
    });
  });

  it('should throw when slug does not exist', async () => {
    prisma.workspace.findUnique.mockResolvedValue(null);
    const ctx = createMockContext({ id: 'user-1' }, { id: 'non-existent-slug' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });
});
