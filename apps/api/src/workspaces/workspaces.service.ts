import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = await this.generateUniqueSlug(dto.name);

    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        memberships: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
            joinedAt: new Date(),
          },
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                timezone: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        deletedAt: null,
        memberships: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(idOrSlug: string) {
    // Support both CUID and slug lookups
    const isCuid = idOrSlug.startsWith('c') && idOrSlug.length > 20;
    const workspace = await this.prisma.workspace.findUnique({
      where: isCuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                timezone: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.prisma.workspace.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async softDelete(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return this.prisma.workspace.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async inviteMember(
    workspaceId: string,
    dto: InviteMemberDto,
    invitedById: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const existingMembership =
      await this.prisma.workspaceMembership.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
      });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this workspace');
    }

    return this.prisma.workspaceMembership.create({
      data: {
        userId: user.id,
        workspaceId,
        role: dto.role,
        invitedById,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async getMembers(workspaceId: string) {
    return this.prisma.workspaceMembership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { invitedAt: 'asc' },
    });
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    currentUserId: string,
  ) {
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this workspace');
    }

    // Prevent OWNER from changing their own role
    if (membership.role === WorkspaceRole.OWNER && userId === currentUserId) {
      throw new ForbiddenException('Owner cannot change their own role');
    }

    // Prevent role escalation: ADMIN cannot assign OWNER role
    const currentUserMembership =
      await this.prisma.workspaceMembership.findUnique({
        where: {
          userId_workspaceId: {
            userId: currentUserId,
            workspaceId,
          },
        },
      });

    if (
      role === WorkspaceRole.OWNER &&
      currentUserMembership?.role !== WorkspaceRole.OWNER
    ) {
      throw new ForbiddenException('Only an OWNER can assign the OWNER role');
    }

    return this.prisma.workspaceMembership.update({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found in this workspace');
    }

    if (membership.role === WorkspaceRole.OWNER) {
      throw new BadRequestException('Cannot remove the workspace owner');
    }

    return this.prisma.workspaceMembership.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });
  }

  async getUserRole(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceRole | null> {
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return membership?.role ?? null;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await this.prisma.workspace.findUnique({
      where: { slug: baseSlug },
    });

    if (!existing) {
      return baseSlug;
    }

    const suffix = randomBytes(2).toString('hex'); // 4 random hex chars
    return `${baseSlug}-${suffix}`;
  }
}
