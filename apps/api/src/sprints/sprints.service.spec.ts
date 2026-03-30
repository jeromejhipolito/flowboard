import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SprintsService } from './sprints.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SprintsService', () => {
  let service: SprintsService;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      project: { findUnique: jest.fn() },
      sprint: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      task: {
        count: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create sprint with PLANNING status (default)', async () => {
      prisma.project.findUnique.mockResolvedValue({ id: 'proj-1' });
      prisma.sprint.create.mockResolvedValue({
        id: 'sprint-1',
        projectId: 'proj-1',
        name: 'Sprint 1',
        status: 'PLANNING',
      });

      const result = await service.create('proj-1', { name: 'Sprint 1' });

      expect(prisma.sprint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'proj-1',
          name: 'Sprint 1',
        }),
      });
      expect(result.status).toBe('PLANNING');
    });

    it('should throw NotFoundException when project not found', async () => {
      prisma.project.findUnique.mockResolvedValue(null);

      await expect(
        service.create('nonexistent', { name: 'Sprint 1' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── findById ────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should compute totalTasks, doneTasks, totalPoints, donePoints', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        name: 'Sprint 1',
        tasks: [
          { id: 't1', status: 'DONE', storyPoints: 5 },
          { id: 't2', status: 'TODO', storyPoints: 3 },
          { id: 't3', status: 'DONE', storyPoints: 8 },
          { id: 't4', status: 'IN_PROGRESS', storyPoints: null },
        ],
      });

      const result = await service.findById('sprint-1');

      expect(result.stats).toEqual({
        totalTasks: 4,
        doneTasks: 2,
        totalPoints: 16,
        donePoints: 13,
      });
    });

    it('should throw NotFoundException for unknown sprint', async () => {
      prisma.sprint.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should throw BadRequestException when sprint is CLOSED', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'CLOSED',
      });

      await expect(
        service.update('sprint-1', { name: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow updating an ACTIVE sprint', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
      });
      prisma.sprint.update.mockResolvedValue({
        id: 'sprint-1',
        name: 'Updated',
        status: 'ACTIVE',
      });

      const result = await service.update('sprint-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });
  });

  // ── start ───────────────────────────────────────────────────────────────

  describe('start', () => {
    it('should throw BadRequestException when sprint is not PLANNING', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        projectId: 'proj-1',
        _count: { tasks: 5 },
      });

      await expect(service.start('sprint-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException when project already has ACTIVE sprint', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        projectId: 'proj-1',
        _count: { tasks: 3 },
      });
      prisma.sprint.findFirst.mockResolvedValue({
        id: 'sprint-active',
        name: 'Active Sprint',
      });

      await expect(service.start('sprint-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should set startDate to now when none provided', async () => {
      const now = new Date();
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        projectId: 'proj-1',
        startDate: null,
        _count: { tasks: 5 },
      });
      prisma.sprint.findFirst.mockResolvedValue(null);
      prisma.sprint.update.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        startDate: now,
        scopeAtStart: 5,
      });

      const result = await service.start('sprint-1');

      expect(prisma.sprint.update).toHaveBeenCalledWith({
        where: { id: 'sprint-1' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          startDate: expect.any(Date),
          scopeAtStart: 5,
        }),
      });
      expect(result.status).toBe('ACTIVE');
    });

    it('should preserve existing startDate', async () => {
      const existingDate = new Date('2025-06-01');
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        projectId: 'proj-1',
        startDate: existingDate,
        _count: { tasks: 2 },
      });
      prisma.sprint.findFirst.mockResolvedValue(null);
      prisma.sprint.update.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        startDate: existingDate,
      });

      await service.start('sprint-1');

      expect(prisma.sprint.update).toHaveBeenCalledWith({
        where: { id: 'sprint-1' },
        data: expect.objectContaining({
          startDate: existingDate,
        }),
      });
    });

    it('should set scopeAtStart to current task count', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        projectId: 'proj-1',
        startDate: null,
        _count: { tasks: 7 },
      });
      prisma.sprint.findFirst.mockResolvedValue(null);
      prisma.sprint.update.mockResolvedValue({ id: 'sprint-1' });

      await service.start('sprint-1');

      expect(prisma.sprint.update).toHaveBeenCalledWith({
        where: { id: 'sprint-1' },
        data: expect.objectContaining({
          scopeAtStart: 7,
        }),
      });
    });
  });

  // ── complete ────────────────────────────────────────────────────────────

  describe('complete', () => {
    it('should throw BadRequestException when sprint not ACTIVE', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        projectId: 'proj-1',
      });

      await expect(
        service.complete('sprint-1', {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when nextSprintId is invalid', async () => {
      prisma.sprint.findUnique
        .mockResolvedValueOnce({
          id: 'sprint-1',
          status: 'ACTIVE',
          projectId: 'proj-1',
        })
        .mockResolvedValueOnce(null); // nextSprint lookup

      await expect(
        service.complete('sprint-1', { nextSprintId: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when nextSprintId is in different project', async () => {
      prisma.sprint.findUnique
        .mockResolvedValueOnce({
          id: 'sprint-1',
          status: 'ACTIVE',
          projectId: 'proj-1',
        })
        .mockResolvedValueOnce({
          id: 'sprint-other',
          projectId: 'proj-other',
          status: 'PLANNING',
        });

      await expect(
        service.complete('sprint-1', { nextSprintId: 'sprint-other' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should use $transaction for atomicity', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        projectId: 'proj-1',
      });

      const closedSprint = { id: 'sprint-1', status: 'CLOSED' };
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          task: {
            count: jest.fn().mockResolvedValue(2),
            updateMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          sprint: {
            update: jest.fn().mockResolvedValue(closedSprint),
          },
        };
        return fn(tx);
      });

      const result = await service.complete('sprint-1', {});

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual(closedSprint);
    });

    it('should move incomplete tasks to null when no nextSprintId', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        projectId: 'proj-1',
      });

      let capturedUpdateManyData: any;
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          task: {
            count: jest.fn().mockResolvedValue(3),
            updateMany: jest.fn().mockImplementation((args: any) => {
              capturedUpdateManyData = args.data;
              return { count: 3 };
            }),
          },
          sprint: {
            update: jest.fn().mockResolvedValue({ id: 'sprint-1', status: 'CLOSED' }),
          },
        };
        return fn(tx);
      });

      await service.complete('sprint-1', {});

      expect(capturedUpdateManyData.sprintId).toBeNull();
    });

    it('should emit sprint.completed event', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        projectId: 'proj-1',
      });

      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          task: {
            count: jest.fn().mockResolvedValue(0),
            updateMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          sprint: {
            update: jest.fn().mockResolvedValue({ id: 'sprint-1', status: 'CLOSED' }),
          },
        };
        return fn(tx);
      });

      await service.complete('sprint-1', {});

      expect(eventEmitter.emit).toHaveBeenCalledWith('sprint.completed', {
        projectId: 'proj-1',
        sprintId: 'sprint-1',
        nextSprintId: null,
      });
    });
  });

  // ── delete ──────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should throw BadRequestException when sprint not PLANNING', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'ACTIVE',
        _count: { tasks: 0 },
      });

      await expect(service.delete('sprint-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when sprint has tasks', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        _count: { tasks: 3 },
      });

      await expect(service.delete('sprint-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should hard delete PLANNING sprint with 0 tasks', async () => {
      prisma.sprint.findUnique.mockResolvedValue({
        id: 'sprint-1',
        status: 'PLANNING',
        _count: { tasks: 0 },
      });
      prisma.sprint.delete.mockResolvedValue({ id: 'sprint-1' });

      await service.delete('sprint-1');

      expect(prisma.sprint.delete).toHaveBeenCalledWith({
        where: { id: 'sprint-1' },
      });
    });
  });
});
