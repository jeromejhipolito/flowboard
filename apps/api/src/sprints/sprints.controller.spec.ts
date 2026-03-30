import { Test, TestingModule } from '@nestjs/testing';
import { SprintsController } from './sprints.controller';
import { SprintsService } from './sprints.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SprintsController', () => {
  let controller: SprintsController;
  let sprintsService: any;

  beforeEach(async () => {
    sprintsService = {
      create: jest.fn(),
      findAllByProject: jest.fn(),
      findActive: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      start: jest.fn(),
      complete: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SprintsController],
      providers: [
        { provide: SprintsService, useValue: sprintsService },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<SprintsController>(SprintsController);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call sprintsService.create with projectId and dto', () => {
      const dto = { name: 'Sprint 1', goal: 'Deliver MVP' };
      sprintsService.create.mockResolvedValue({ id: 'sprint-1', name: 'Sprint 1' });

      controller.create('proj-1', dto as any);

      expect(sprintsService.create).toHaveBeenCalledWith('proj-1', dto);
    });

    it('should return the created sprint', async () => {
      const expected = { id: 'sprint-1', name: 'Sprint 1', status: 'PLANNING' };
      sprintsService.create.mockResolvedValue(expected);

      const result = await controller.create('proj-1', { name: 'Sprint 1' } as any);

      expect(result).toEqual(expected);
    });
  });

  // ── findAll ─────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call sprintsService.findAllByProject with projectId and query', () => {
      const query = { status: 'PLANNING', limit: 10 };
      sprintsService.findAllByProject.mockResolvedValue({ sprints: [], hasMore: false });

      controller.findAll('proj-1', query as any);

      expect(sprintsService.findAllByProject).toHaveBeenCalledWith('proj-1', query);
    });
  });

  // ── findActive ──────────────────────────────────────────────────────────

  describe('findActive', () => {
    it('should call sprintsService.findActive with projectId', () => {
      sprintsService.findActive.mockResolvedValue({ id: 'sprint-1', status: 'ACTIVE' });

      controller.findActive('proj-1');

      expect(sprintsService.findActive).toHaveBeenCalledWith('proj-1');
    });

    it('should return null when no active sprint', async () => {
      sprintsService.findActive.mockResolvedValue(null);

      const result = await controller.findActive('proj-1');

      expect(result).toBeNull();
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call sprintsService.findById with sprintId', () => {
      sprintsService.findById.mockResolvedValue({ id: 'sprint-1' });

      controller.findOne('sprint-1');

      expect(sprintsService.findById).toHaveBeenCalledWith('sprint-1');
    });
  });

  // ── update ──────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call sprintsService.update with sprintId and dto', () => {
      const dto = { name: 'Updated Sprint' };
      sprintsService.update.mockResolvedValue({ id: 'sprint-1', name: 'Updated Sprint' });

      controller.update('sprint-1', dto as any);

      expect(sprintsService.update).toHaveBeenCalledWith('sprint-1', dto);
    });
  });

  // ── start ───────────────────────────────────────────────────────────────

  describe('start', () => {
    it('should call sprintsService.start with sprintId', () => {
      sprintsService.start.mockResolvedValue({ id: 'sprint-1', status: 'ACTIVE' });

      controller.start('sprint-1');

      expect(sprintsService.start).toHaveBeenCalledWith('sprint-1');
    });
  });

  // ── complete ────────────────────────────────────────────────────────────

  describe('complete', () => {
    it('should call sprintsService.complete with sprintId and dto', () => {
      const dto = { nextSprintId: 'sprint-2' };
      sprintsService.complete.mockResolvedValue({ id: 'sprint-1', status: 'CLOSED' });

      controller.complete('sprint-1', dto as any);

      expect(sprintsService.complete).toHaveBeenCalledWith('sprint-1', dto);
    });

    it('should return the completed sprint', async () => {
      const expected = { id: 'sprint-1', status: 'CLOSED', completedAt: new Date() };
      sprintsService.complete.mockResolvedValue(expected);

      const result = await controller.complete('sprint-1', {} as any);

      expect(result).toEqual(expected);
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should call sprintsService.delete with sprintId', () => {
      sprintsService.delete.mockResolvedValue({ id: 'sprint-1' });

      controller.remove('sprint-1');

      expect(sprintsService.delete).toHaveBeenCalledWith('sprint-1');
    });
  });
});
