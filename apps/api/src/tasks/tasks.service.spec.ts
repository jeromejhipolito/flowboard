import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;
  let prisma: any;
  let eventEmitter: any;

  beforeEach(async () => {
    prisma = {
      task: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      label: {
        findUnique: jest.fn(),
      },
      taskLabel: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    eventEmitter = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: prisma },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should set position to lastTask.position + 1.0 when tasks exist', async () => {
      prisma.task.findFirst.mockResolvedValue({ position: 5.0 });
      prisma.task.create.mockResolvedValue({
        id: 'task-1',
        position: 6.0,
        status: 'TODO',
      });

      await service.create('proj-1', 'user-1', { title: 'New Task' } as any);

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 6.0 }),
        }),
      );
    });

    it('should set position to 1.0 when column is empty', async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      prisma.task.create.mockResolvedValue({
        id: 'task-1',
        position: 1.0,
        status: 'TODO',
      });

      await service.create('proj-1', 'user-1', { title: 'First Task' } as any);

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 1.0 }),
        }),
      );
    });

    it('should default status to TODO', async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      prisma.task.create.mockResolvedValue({
        id: 'task-1',
        status: 'TODO',
        position: 1.0,
      });

      await service.create('proj-1', 'user-1', { title: 'Task' } as any);

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'TODO' }),
        }),
      );
    });

    it('should emit task.created event', async () => {
      prisma.task.findFirst.mockResolvedValue(null);
      const createdTask = { id: 'task-1', status: 'TODO', position: 1.0 };
      prisma.task.create.mockResolvedValue(createdTask);

      await service.create('proj-1', 'user-1', { title: 'Task' } as any);

      expect(eventEmitter.emit).toHaveBeenCalledWith('task.created', {
        taskId: 'task-1',
        projectId: 'proj-1',
        userId: 'user-1',
        data: createdTask,
      });
    });

    it('should throw NotFoundException when parentTaskId not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.create('proj-1', 'user-1', {
          title: 'Sub Task',
          parentTaskId: 'nonexistent',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when parent in different project', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'parent-1',
        projectId: 'proj-other',
      });

      await expect(
        service.create('proj-1', 'user-1', {
          title: 'Sub Task',
          parentTaskId: 'parent-1',
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── findAllByProject ───────────────────────────────────────────────────

  describe('findAllByProject', () => {
    it('should translate sprintId "backlog" to null', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await service.findAllByProject('proj-1', { sprintId: 'backlog' } as any);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            sprintId: null,
          }),
        }),
      );
    });

    it('should apply OR on title and description when search provided', async () => {
      prisma.task.findMany.mockResolvedValue([]);

      await service.findAllByProject('proj-1', { search: 'bug' } as any);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'bug', mode: 'insensitive' } },
              { description: { contains: 'bug', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should set hasMore when tasks.length > limit', async () => {
      // Return 4 items when limit is 3 (service fetches limit+1)
      const tasks = [
        { id: 't1', status: 'TODO' },
        { id: 't2', status: 'TODO' },
        { id: 't3', status: 'TODO' },
        { id: 't4', status: 'TODO' },
      ];
      prisma.task.findMany.mockResolvedValue(tasks);

      const result = await service.findAllByProject('proj-1', { limit: 3 } as any);

      expect(result.hasMore).toBe(true);
      expect(result.tasks).toHaveLength(3);
    });
  });

  // ── findById ───────────────────────────────────────────────────────────

  describe('findById', () => {
    it('should throw NotFoundException for unknown task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update ─────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should set completedAt when status changes TO DONE', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'IN_PROGRESS',
        projectId: 'proj-1',
        reporterId: 'user-1',
      });
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: 'DONE',
        completedAt: new Date(),
      });

      await service.update('task-1', { status: 'DONE' } as any);

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should clear completedAt when status changes FROM DONE', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'DONE',
        projectId: 'proj-1',
        reporterId: 'user-1',
      });
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: 'TODO',
        completedAt: null,
      });

      await service.update('task-1', { status: 'TODO' } as any);

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: null,
          }),
        }),
      );
    });

    it('should NOT change completedAt when status unchanged', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'IN_PROGRESS',
        projectId: 'proj-1',
        reporterId: 'user-1',
      });
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: 'IN_PROGRESS',
        title: 'Updated',
      });

      await service.update('task-1', { title: 'Updated' } as any);

      const updateCall = prisma.task.update.mock.calls[0][0];
      expect(updateCall.data).not.toHaveProperty('completedAt');
    });

    it('should emit task.updated event', async () => {
      const before = {
        id: 'task-1',
        status: 'TODO',
        projectId: 'proj-1',
        reporterId: 'user-1',
      };
      const after = { id: 'task-1', status: 'TODO', title: 'Updated' };
      prisma.task.findUnique.mockResolvedValue(before);
      prisma.task.update.mockResolvedValue(after);

      await service.update('task-1', { title: 'Updated' } as any);

      expect(eventEmitter.emit).toHaveBeenCalledWith('task.updated', {
        taskId: 'task-1',
        projectId: 'proj-1',
        userId: 'user-1',
        data: { before, after },
      });
    });
  });

  // ── moveTask ───────────────────────────────────────────────────────────

  describe('moveTask', () => {
    it('should throw NotFoundException for unknown task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.moveTask('nonexistent', { status: 'TODO', position: 1.0 } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set completedAt when moved TO DONE', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'TODO',
        projectId: 'proj-1',
        reporterId: 'user-1',
        position: 1.0,
      });
      prisma.task.findMany.mockResolvedValue([]); // empty column
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: 'DONE',
        completedAt: new Date(),
      });

      await service.moveTask('task-1', { status: 'DONE', position: 1.0 } as any);

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: expect.any(Date),
          }),
        }),
      );
    });

    it('should clear completedAt when moved FROM DONE', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'DONE',
        projectId: 'proj-1',
        reporterId: 'user-1',
        position: 1.0,
      });
      prisma.task.findMany.mockResolvedValue([]);
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: 'TODO',
        completedAt: null,
      });

      await service.moveTask('task-1', { status: 'TODO', position: 1.0 } as any);

      expect(prisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            completedAt: null,
          }),
        }),
      );
    });

    it('should trigger rebalance via $transaction when gap < 0.001', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-move',
        status: 'TODO',
        projectId: 'proj-1',
        reporterId: 'user-1',
        position: 1.0,
      });
      // Two tasks with positions too close together (gap < 0.001)
      prisma.task.findMany.mockResolvedValue([
        { id: 'task-a', position: 1.0 },
        { id: 'task-b', position: 1.0005 },
      ]);
      const updatedTask = { id: 'task-move', status: 'IN_PROGRESS' };
      prisma.$transaction.mockResolvedValue([
        { id: 'task-a' },
        { id: 'task-b' },
        updatedTask,
      ]);

      await service.moveTask('task-move', {
        status: 'IN_PROGRESS',
        position: 1.5,
      } as any);

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should NOT use $transaction for normal move (no rebalance)', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'TODO',
        projectId: 'proj-1',
        reporterId: 'user-1',
        position: 1.0,
      });
      // Well-spaced tasks (gap > 0.001)
      prisma.task.findMany.mockResolvedValue([
        { id: 'task-a', position: 1.0 },
        { id: 'task-b', position: 2.0 },
      ]);
      prisma.task.update.mockResolvedValue({ id: 'task-1', status: 'IN_PROGRESS' });

      await service.moveTask('task-1', {
        status: 'IN_PROGRESS',
        position: 1.5,
      } as any);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should emit task.moved event', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: 'TODO',
        projectId: 'proj-1',
        reporterId: 'user-1',
        position: 1.0,
      });
      prisma.task.findMany.mockResolvedValue([]);
      prisma.task.update.mockResolvedValue({ id: 'task-1', status: 'IN_PROGRESS' });

      await service.moveTask('task-1', {
        status: 'IN_PROGRESS',
        position: 2.0,
      } as any);

      expect(eventEmitter.emit).toHaveBeenCalledWith('task.moved', {
        taskId: 'task-1',
        projectId: 'proj-1',
        userId: 'user-1',
        data: {
          previousStatus: 'TODO',
          previousPosition: 1.0,
          newStatus: 'IN_PROGRESS',
          newPosition: 2.0,
        },
      });
    });
  });

  // ── softDelete ─────────────────────────────────────────────────────────

  describe('softDelete', () => {
    it('should set deletedAt, not hard delete', async () => {
      prisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        projectId: 'proj-1',
        reporterId: 'user-1',
      });
      prisma.task.update.mockResolvedValue({
        id: 'task-1',
        deletedAt: new Date(),
      });

      await service.softDelete('task-1');

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException for unknown task', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── addLabel / removeLabel ─────────────────────────────────────────────

  describe('addLabel', () => {
    it('should create TaskLabel junction record', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: 'task-1' });
      prisma.label.findUnique.mockResolvedValue({ id: 'label-1' });
      prisma.taskLabel.create.mockResolvedValue({
        taskId: 'task-1',
        labelId: 'label-1',
      });

      await service.addLabel('task-1', 'label-1');

      expect(prisma.taskLabel.create).toHaveBeenCalledWith({
        data: { taskId: 'task-1', labelId: 'label-1' },
        include: { label: true },
      });
    });
  });

  describe('removeLabel', () => {
    it('should delete TaskLabel junction record', async () => {
      prisma.taskLabel.findUnique.mockResolvedValue({
        taskId: 'task-1',
        labelId: 'label-1',
      });
      prisma.taskLabel.delete.mockResolvedValue({
        taskId: 'task-1',
        labelId: 'label-1',
      });

      await service.removeLabel('task-1', 'label-1');

      expect(prisma.taskLabel.delete).toHaveBeenCalledWith({
        where: { taskId_labelId: { taskId: 'task-1', labelId: 'label-1' } },
      });
    });
  });
});
