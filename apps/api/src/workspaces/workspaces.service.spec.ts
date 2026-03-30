import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      workspace: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      workspaceMembership: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create workspace with creator as OWNER', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null); // slug not taken
      prisma.workspace.create.mockResolvedValue({
        id: 'ws-1',
        name: 'My Workspace',
        slug: 'my-workspace',
        memberships: [{ userId: 'user-1', role: WorkspaceRole.OWNER }],
      });

      const result = await service.create('user-1', {
        name: 'My Workspace',
      });

      expect(prisma.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'My Workspace',
            memberships: expect.objectContaining({
              create: expect.objectContaining({
                userId: 'user-1',
                role: WorkspaceRole.OWNER,
              }),
            }),
          }),
        }),
      );
      expect(result.memberships[0].role).toBe(WorkspaceRole.OWNER);
    });

    it('should generate slug from name', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null); // slug not taken
      prisma.workspace.create.mockResolvedValue({
        id: 'ws-1',
        name: 'My Awesome Workspace',
        slug: 'my-awesome-workspace',
      });

      await service.create('user-1', { name: 'My Awesome Workspace' });

      expect(prisma.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'my-awesome-workspace',
          }),
        }),
      );
    });

    it('should append random suffix when slug is taken', async () => {
      // First call: check if base slug exists => found (taken)
      prisma.workspace.findUnique.mockResolvedValueOnce({ id: 'existing' });
      prisma.workspace.create.mockResolvedValue({
        id: 'ws-2',
        name: 'My Workspace',
        slug: 'my-workspace-a1b2',
      });

      await service.create('user-1', { name: 'My Workspace' });

      const createCall = prisma.workspace.create.mock.calls[0][0];
      // Slug should have random suffix appended (base-XXXX pattern)
      expect(createCall.data.slug).toMatch(/^my-workspace-[a-f0-9]{4}$/);
    });

    it('should strip special characters from slug', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);
      prisma.workspace.create.mockResolvedValue({
        id: 'ws-1',
        name: 'Hello World!!!',
        slug: 'hello-world',
      });

      await service.create('user-1', { name: 'Hello World!!!' });

      expect(prisma.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'hello-world',
          }),
        }),
      );
    });

    it('should include memberships with user select in the result', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);
      prisma.workspace.create.mockResolvedValue({
        id: 'ws-1',
        name: 'Test',
        slug: 'test',
        memberships: [{ user: { id: 'user-1', email: 'a@b.com' } }],
      });

      await service.create('user-1', { name: 'Test' });

      expect(prisma.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            memberships: expect.objectContaining({
              include: expect.objectContaining({
                user: expect.objectContaining({
                  select: expect.objectContaining({
                    id: true,
                    email: true,
                  }),
                }),
              }),
            }),
          }),
        }),
      );
    });
  });

  // ── findById ────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should use id lookup for CUIDs (starts with c, length > 20)', async () => {
      const cuid = 'clxyz1234567890abcdefg';
      prisma.workspace.findUnique.mockResolvedValue({
        id: cuid,
        name: 'WS',
        slug: 'ws',
      });

      await service.findById(cuid);

      expect(prisma.workspace.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: cuid },
        }),
      );
    });

    it('should use slug lookup for short strings', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        name: 'My WS',
        slug: 'my-ws',
      });

      await service.findById('my-ws');

      expect(prisma.workspace.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'my-ws' },
        }),
      );
    });

    it('should use slug lookup for strings not starting with c', async () => {
      const longNonCuid = 'aaaaaaaaaaaaaaaaaaaaaaaaa';
      prisma.workspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        slug: longNonCuid,
      });

      await service.findById(longNonCuid);

      expect(prisma.workspace.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: longNonCuid },
        }),
      );
    });

    it('should throw NotFoundException for unknown workspace', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include memberships with user details', async () => {
      prisma.workspace.findUnique.mockResolvedValue({
        id: 'ws-1',
        memberships: [{ user: { id: 'u1' } }],
      });

      await service.findById('my-ws');

      expect(prisma.workspace.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            memberships: expect.objectContaining({
              include: expect.objectContaining({
                user: expect.objectContaining({
                  select: expect.objectContaining({
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                  }),
                }),
              }),
            }),
          }),
        }),
      );
    });
  });

  // ── findAllForUser ──────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    it('should return only workspaces where user is a member', async () => {
      prisma.workspace.findMany.mockResolvedValue([
        { id: 'ws-1', name: 'Team A' },
      ]);

      await service.findAllForUser('user-1');

      expect(prisma.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberships: { some: { userId: 'user-1' } },
          }),
        }),
      );
    });

    it('should exclude soft-deleted workspaces', async () => {
      prisma.workspace.findMany.mockResolvedValue([]);

      await service.findAllForUser('user-1');

      expect(prisma.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
          }),
        }),
      );
    });

    it('should order by createdAt desc', async () => {
      prisma.workspace.findMany.mockResolvedValue([]);

      await service.findAllForUser('user-1');

      expect(prisma.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update name and description', async () => {
      prisma.workspace.findUnique.mockResolvedValue({ id: 'ws-1' });
      prisma.workspace.update.mockResolvedValue({
        id: 'ws-1',
        name: 'New Name',
        description: 'New Desc',
      });

      const result = await service.update('ws-1', {
        name: 'New Name',
        description: 'New Desc',
      });

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
        data: { name: 'New Name', description: 'New Desc' },
      });
      expect(result.name).toBe('New Name');
    });

    it('should throw NotFoundException for unknown workspace', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── softDelete ──────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should set deletedAt timestamp', async () => {
      prisma.workspace.findUnique.mockResolvedValue({ id: 'ws-1' });
      prisma.workspace.update.mockResolvedValue({
        id: 'ws-1',
        deletedAt: new Date(),
      });

      await service.softDelete('ws-1');

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException for unknown workspace', async () => {
      prisma.workspace.findUnique.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── inviteMember ────────────────────────────────────────────────────────

  describe('inviteMember', () => {
    it('should create membership for found user', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      prisma.workspaceMembership.findUnique.mockResolvedValue(null);
      prisma.workspaceMembership.create.mockResolvedValue({
        userId: 'user-2',
        workspaceId: 'ws-1',
        role: WorkspaceRole.MEMBER,
      });

      await service.inviteMember(
        'ws-1',
        { email: 'user2@test.com', role: WorkspaceRole.MEMBER },
        'inviter-1',
      );

      expect(prisma.workspaceMembership.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-2',
            workspaceId: 'ws-1',
            role: WorkspaceRole.MEMBER,
            invitedById: 'inviter-1',
          }),
        }),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.inviteMember(
          'ws-1',
          { email: 'ghost@test.com', role: WorkspaceRole.MEMBER },
          'inviter-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already a member', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'user-2' });
      prisma.workspaceMembership.findUnique.mockResolvedValue({
        userId: 'user-2',
        workspaceId: 'ws-1',
      });

      await expect(
        service.inviteMember(
          'ws-1',
          { email: 'user2@test.com', role: WorkspaceRole.MEMBER },
          'inviter-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── updateMemberRole ────────────────────────────────────────────────────

  describe('updateMemberRole', () => {
    it('should throw ForbiddenException when OWNER changes own role', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue({
        userId: 'owner-1',
        workspaceId: 'ws-1',
        role: WorkspaceRole.OWNER,
      });

      await expect(
        service.updateMemberRole(
          'ws-1',
          'owner-1',
          WorkspaceRole.MEMBER,
          'owner-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when non-OWNER assigns OWNER role', async () => {
      // Target membership lookup
      prisma.workspaceMembership.findUnique
        .mockResolvedValueOnce({
          userId: 'user-2',
          workspaceId: 'ws-1',
          role: WorkspaceRole.MEMBER,
        })
        // Current user membership lookup (ADMIN, not OWNER)
        .mockResolvedValueOnce({
          userId: 'admin-1',
          workspaceId: 'ws-1',
          role: WorkspaceRole.ADMIN,
        });

      await expect(
        service.updateMemberRole(
          'ws-1',
          'user-2',
          WorkspaceRole.OWNER,
          'admin-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow OWNER to assign OWNER role to another member', async () => {
      // Target membership
      prisma.workspaceMembership.findUnique
        .mockResolvedValueOnce({
          userId: 'user-2',
          workspaceId: 'ws-1',
          role: WorkspaceRole.MEMBER,
        })
        // Current user is OWNER
        .mockResolvedValueOnce({
          userId: 'owner-1',
          workspaceId: 'ws-1',
          role: WorkspaceRole.OWNER,
        });

      prisma.workspaceMembership.update.mockResolvedValue({
        userId: 'user-2',
        workspaceId: 'ws-1',
        role: WorkspaceRole.OWNER,
        user: { id: 'user-2', email: 'u2@test.com' },
      });

      const result = await service.updateMemberRole(
        'ws-1',
        'user-2',
        WorkspaceRole.OWNER,
        'owner-1',
      );

      expect(result.role).toBe(WorkspaceRole.OWNER);
    });

    it('should throw NotFoundException when membership not found', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberRole(
          'ws-1',
          'nonexistent',
          WorkspaceRole.ADMIN,
          'owner-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update role for valid non-OWNER role change by OWNER', async () => {
      prisma.workspaceMembership.findUnique
        .mockResolvedValueOnce({
          userId: 'user-2',
          workspaceId: 'ws-1',
          role: WorkspaceRole.MEMBER,
        })
        .mockResolvedValueOnce({
          userId: 'owner-1',
          workspaceId: 'ws-1',
          role: WorkspaceRole.OWNER,
        });

      prisma.workspaceMembership.update.mockResolvedValue({
        userId: 'user-2',
        role: WorkspaceRole.ADMIN,
        user: { id: 'user-2' },
      });

      const result = await service.updateMemberRole(
        'ws-1',
        'user-2',
        WorkspaceRole.ADMIN,
        'owner-1',
      );

      expect(result.role).toBe(WorkspaceRole.ADMIN);
    });
  });

  // ── removeMember ────────────────────────────────────────────────────────

  describe('removeMember', () => {
    it('should throw BadRequestException when removing OWNER', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue({
        userId: 'owner-1',
        workspaceId: 'ws-1',
        role: WorkspaceRole.OWNER,
      });

      await expect(
        service.removeMember('ws-1', 'owner-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when membership not found', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue(null);

      await expect(
        service.removeMember('ws-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete membership for non-OWNER member', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue({
        userId: 'user-2',
        workspaceId: 'ws-1',
        role: WorkspaceRole.MEMBER,
      });
      prisma.workspaceMembership.delete.mockResolvedValue({
        userId: 'user-2',
        workspaceId: 'ws-1',
      });

      await service.removeMember('ws-1', 'user-2');

      expect(prisma.workspaceMembership.delete).toHaveBeenCalledWith({
        where: {
          userId_workspaceId: {
            userId: 'user-2',
            workspaceId: 'ws-1',
          },
        },
      });
    });
  });

  // ── getUserRole ─────────────────────────────────────────────────────────

  describe('getUserRole', () => {
    it('should return role for existing member', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue({
        userId: 'user-1',
        workspaceId: 'ws-1',
        role: WorkspaceRole.ADMIN,
      });

      const role = await service.getUserRole('ws-1', 'user-1');

      expect(role).toBe(WorkspaceRole.ADMIN);
    });

    it('should return null for non-member', async () => {
      prisma.workspaceMembership.findUnique.mockResolvedValue(null);

      const role = await service.getUserRole('ws-1', 'nonexistent');

      expect(role).toBeNull();
    });
  });
});
