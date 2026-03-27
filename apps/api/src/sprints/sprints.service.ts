import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SprintStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { CompleteSprintDto } from './dto/complete-sprint.dto';
import { SprintQueryDto } from './dto/sprint-query.dto';

@Injectable()
export class SprintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(projectId: string, dto: CreateSprintDto) {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        goal: dto.goal,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async findAllByProject(projectId: string, query: SprintQueryDto) {
    const { status, limit = 20, cursor } = query;

    const where: any = {
      projectId,
      ...(status && { status }),
    };

    const sprints = await this.prisma.sprint.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasMore = sprints.length > limit;
    const results = hasMore ? sprints.slice(0, limit) : sprints;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      sprints: results,
      nextCursor,
      hasMore,
    };
  }

  async findActive(projectId: string) {
    const sprint = await this.prisma.sprint.findFirst({
      where: {
        projectId,
        status: SprintStatus.ACTIVE,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return sprint;
  }

  async findById(sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: {
            id: true,
            status: true,
            storyPoints: true,
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    // Compute summary stats
    const totalTasks = sprint.tasks.length;
    const doneTasks = sprint.tasks.filter(
      (t) => t.status === TaskStatus.DONE,
    ).length;
    const totalPoints = sprint.tasks.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0,
    );
    const donePoints = sprint.tasks
      .filter((t) => t.status === TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const { tasks, ...sprintData } = sprint;

    return {
      ...sprintData,
      stats: {
        totalTasks,
        doneTasks,
        totalPoints,
        donePoints,
      },
    };
  }

  async update(sprintId: string, dto: UpdateSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status === SprintStatus.CLOSED) {
      throw new BadRequestException('Cannot update a closed sprint');
    }

    return this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.goal !== undefined && { goal: dto.goal }),
        ...(dto.startDate !== undefined && {
          startDate: dto.startDate ? new Date(dto.startDate) : null,
        }),
        ...(dto.endDate !== undefined && {
          endDate: dto.endDate ? new Date(dto.endDate) : null,
        }),
      },
    });
  }

  async start(sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status !== SprintStatus.PLANNING) {
      throw new BadRequestException('Only PLANNING sprints can be started');
    }

    // Check no other active sprint in this project
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: SprintStatus.ACTIVE,
      },
    });

    if (activeSprint) {
      throw new ConflictException(
        `Project already has an active sprint: "${activeSprint.name}"`,
      );
    }

    return this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.ACTIVE,
        startDate: sprint.startDate || new Date(),
        scopeAtStart: sprint._count.tasks,
      },
    });
  }

  async complete(sprintId: string, dto: CompleteSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status !== SprintStatus.ACTIVE) {
      throw new BadRequestException('Only ACTIVE sprints can be completed');
    }

    // Validate nextSprintId if provided
    if (dto.nextSprintId) {
      const nextSprint = await this.prisma.sprint.findUnique({
        where: { id: dto.nextSprintId },
      });

      if (!nextSprint) {
        throw new NotFoundException('Next sprint not found');
      }

      if (nextSprint.projectId !== sprint.projectId) {
        throw new BadRequestException(
          'Next sprint must belong to the same project',
        );
      }

      if (nextSprint.status === SprintStatus.CLOSED) {
        throw new BadRequestException('Cannot move tasks to a closed sprint');
      }
    }

    // Use $transaction for atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Count incomplete tasks (status != DONE)
      const carriedOver = await tx.task.count({
        where: {
          sprintId,
          status: { not: TaskStatus.DONE },
          deletedAt: null,
        },
      });

      // 2. Close the sprint
      const closedSprint = await tx.sprint.update({
        where: { id: sprintId },
        data: {
          status: SprintStatus.CLOSED,
          completedAt: new Date(),
          carriedOver,
        },
      });

      // 3. Move incomplete tasks to next sprint or backlog (null)
      await tx.task.updateMany({
        where: {
          sprintId,
          status: { not: TaskStatus.DONE },
          deletedAt: null,
        },
        data: {
          sprintId: dto.nextSprintId || null,
        },
      });

      return closedSprint;
    });

    // 4. Emit sprint.completed event
    this.eventEmitter.emit('sprint.completed', {
      projectId: sprint.projectId,
      sprintId,
      nextSprintId: dto.nextSprintId || null,
    });

    return result;
  }

  async delete(sprintId: string) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status !== SprintStatus.PLANNING) {
      throw new BadRequestException('Only PLANNING sprints can be deleted');
    }

    if (sprint._count.tasks > 0) {
      throw new BadRequestException(
        'Cannot delete a sprint with assigned tasks. Remove all tasks first.',
      );
    }

    return this.prisma.sprint.delete({
      where: { id: sprintId },
    });
  }
}
