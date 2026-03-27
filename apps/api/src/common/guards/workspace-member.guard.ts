import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const idOrSlug = request.params.id || request.params.workspaceId;

    if (!idOrSlug) {
      return false;
    }

    // Resolve slug to workspace ID if needed
    const isCuid = idOrSlug.startsWith('c') && idOrSlug.length > 20;
    let workspaceId = idOrSlug;

    if (!isCuid) {
      const workspace = await this.prisma.workspace.findUnique({
        where: { slug: idOrSlug },
        select: { id: true },
      });
      if (!workspace) {
        throw new ForbiddenException('Workspace not found');
      }
      workspaceId = workspace.id;
    }

    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this workspace',
      );
    }

    request.workspaceMembership = membership;
    return true;
  }
}
