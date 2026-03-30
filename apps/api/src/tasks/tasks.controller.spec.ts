import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: any;

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
      findAllByProject: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      moveTask: jest.fn(),
      softDelete: jest.fn(),
      addLabel: jest.fn(),
      removeLabel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call tasksService.create with projectId, userId, and dto', () => {
      const dto = { title: 'New Task', description: 'Details' };
      tasksService.create.mockResolvedValue({ id: 'task-1' });

      controller.create('proj-1', 'user-1', dto as any);

      expect(tasksService.create).toHaveBeenCalledWith('proj-1', 'user-1', dto);
    });

    it('should return the service result', async () => {
      const expected = { id: 'task-1', title: 'New Task' };
      tasksService.create.mockResolvedValue(expected);

      const result = await controller.create('proj-1', 'user-1', { title: 'New Task' } as any);

      expect(result).toEqual(expected);
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call tasksService.findAllByProject with projectId and query', () => {
      const query = { status: 'TODO', limit: 20 };
      tasksService.findAllByProject.mockResolvedValue({ tasks: [], hasMore: false });

      controller.findAll('proj-1', query as any);

      expect(tasksService.findAllByProject).toHaveBeenCalledWith('proj-1', query);
    });

    it('should return the paginated result', async () => {
      const expected = { tasks: [{ id: 't1' }], hasMore: false, nextCursor: null };
      tasksService.findAllByProject.mockResolvedValue(expected);

      const result = await controller.findAll('proj-1', {} as any);

      expect(result).toEqual(expected);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call tasksService.findById with id', () => {
      tasksService.findById.mockResolvedValue({ id: 'task-1' });

      controller.findOne('task-1');

      expect(tasksService.findById).toHaveBeenCalledWith('task-1');
    });

    it('should return the task', async () => {
      const expected = { id: 'task-1', title: 'My Task' };
      tasksService.findById.mockResolvedValue(expected);

      const result = await controller.findOne('task-1');

      expect(result).toEqual(expected);
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call tasksService.update with id and dto', () => {
      const dto = { title: 'Updated' };
      tasksService.update.mockResolvedValue({ id: 'task-1', title: 'Updated' });

      controller.update('task-1', dto as any);

      expect(tasksService.update).toHaveBeenCalledWith('task-1', dto);
    });

    it('should return the updated task', async () => {
      const expected = { id: 'task-1', title: 'Updated' };
      tasksService.update.mockResolvedValue(expected);

      const result = await controller.update('task-1', { title: 'Updated' } as any);

      expect(result).toEqual(expected);
    });
  });

  // ── move ────────────────────────────────────────────────────────────────

  describe('move', () => {
    it('should call tasksService.moveTask with id and dto', () => {
      const dto = { status: 'IN_PROGRESS', position: 2.5 };
      tasksService.moveTask.mockResolvedValue({ id: 'task-1', status: 'IN_PROGRESS' });

      controller.move('task-1', dto as any);

      expect(tasksService.moveTask).toHaveBeenCalledWith('task-1', dto);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call tasksService.softDelete with id', () => {
      tasksService.softDelete.mockResolvedValue({ id: 'task-1', deletedAt: new Date() });

      controller.remove('task-1');

      expect(tasksService.softDelete).toHaveBeenCalledWith('task-1');
    });
  });

  // ── addLabel ────────────────────────────────────────────────────────────

  describe('addLabel', () => {
    it('should call tasksService.addLabel with taskId and labelId', () => {
      tasksService.addLabel.mockResolvedValue({ taskId: 'task-1', labelId: 'label-1' });

      controller.addLabel('task-1', 'label-1');

      expect(tasksService.addLabel).toHaveBeenCalledWith('task-1', 'label-1');
    });

    it('should return the created task-label junction', async () => {
      const expected = { taskId: 'task-1', labelId: 'label-1', label: { id: 'label-1', name: 'Bug' } };
      tasksService.addLabel.mockResolvedValue(expected);

      const result = await controller.addLabel('task-1', 'label-1');

      expect(result).toEqual(expected);
    });
  });

  // ── removeLabel ─────────────────────────────────────────────────────────

  describe('removeLabel', () => {
    it('should call tasksService.removeLabel with taskId and labelId', () => {
      tasksService.removeLabel.mockResolvedValue({ taskId: 'task-1', labelId: 'label-1' });

      controller.removeLabel('task-1', 'label-1');

      expect(tasksService.removeLabel).toHaveBeenCalledWith('task-1', 'label-1');
    });

    it('should return the result from the service', async () => {
      const expected = { taskId: 'task-1', labelId: 'label-1' };
      tasksService.removeLabel.mockResolvedValue(expected);

      const result = await controller.removeLabel('task-1', 'label-1');

      expect(result).toEqual(expected);
    });
  });
});
