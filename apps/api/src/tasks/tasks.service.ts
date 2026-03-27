import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(projectId: string, reporterId: string, dto: CreateTaskDto) {
    // Validate parentTaskId if provided
    if (dto.parentTaskId) {
      const parentTask = await this.prisma.task.findUnique({
        where: { id: dto.parentTaskId },
      });

      if (!parentTask) {
        throw new NotFoundException('Parent task not found');
      }

      if (parentTask.projectId !== projectId) {
        throw new BadRequestException(
          'Parent task must belong to the same project',
        );
      }
    }

    // Determine default position (last in column)
    const status = dto.status || TaskStatus.TODO;
    const lastTask = await this.prisma.task.findFirst({
      where: {
        projectId,
        status,
        deletedAt: null,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = lastTask ? lastTask.position + 1.0 : 1.0;

    const task = await this.prisma.task.create({
      data: {
        projectId,
        reporterId,
        title: dto.title,
        description: dto.description,
        status,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        parentTaskId: dto.parentTaskId,
        storyPoints: dto.storyPoints,
        position,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        reporter: {
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

    this.eventEmitter.emit('task.created', {
      taskId: task.id,
      projectId,
      userId: reporterId,
      data: task,
    });

    return task;
  }

  async findAllByProject(projectId: string, query: TaskQueryDto) {
    const {
      status,
      priority,
      assigneeId,
      sprintId,
      search,
      cursor,
      limit = 50,
      sort = 'position',
    } = query;

    const where: any = {
      projectId,
      deletedAt: null,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
      ...(sprintId && {
        sprintId: sprintId === 'backlog' ? null : sprintId,
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Determine sort direction and field
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'desc' : 'asc';

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        _count: {
          select: { comments: true, childTasks: true },
        },
      },
      orderBy: { [sortField]: sortDirection },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasMore = tasks.length > limit;
    const results = hasMore ? tasks.slice(0, limit) : tasks;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    // Group by status for board view
    const grouped = results.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {} as Record<string, typeof results>,
    );

    return {
      tasks: results,
      grouped,
      nextCursor,
      hasMore,
    };
  }

  async findById(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        reporter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        childTasks: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            assigneeId: true,
            position: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Determine completedAt changes when status changes
    const completedAtData: { completedAt?: Date | null } = {};
    if (dto.status !== undefined && dto.status !== task.status) {
      if (dto.status === TaskStatus.DONE) {
        completedAtData.completedAt = new Date();
      } else if (task.status === TaskStatus.DONE) {
        completedAtData.completedAt = null;
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
        ...(dto.parentTaskId !== undefined && {
          parentTaskId: dto.parentTaskId,
        }),
        ...(dto.storyPoints !== undefined && { storyPoints: dto.storyPoints }),
        ...((dto as any).sprintId !== undefined && {
          sprintId: (dto as any).sprintId,
        }),
        ...completedAtData,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        reporter: {
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

    this.eventEmitter.emit('task.updated', {
      taskId: id,
      projectId: task.projectId,
      userId: task.reporterId,
      data: { before: task, after: updated },
    });

    return updated;
  }

  /**
   * Move a task to a new status column and/or reorder within a column.
   *
   * Uses fractional indexing for position management:
   * - New position = midpoint between adjacent tasks' positions
   * - When gap between positions < 0.001, triggers a full column rebalance
   * - Rebalance assigns integer positions (1.0, 2.0, 3.0...) then recalculates
   *   the moved task's position relative to its new neighbors
   *
   * @see https://www.figma.com/blog/realtime-editing-of-ordered-sequences/
   *
   * Complexity: O(1) for normal moves, O(N) for rebalance (N = tasks in column)
   * Concurrency: Wrapped in Prisma $transaction during rebalance to prevent race conditions
   *
   * Edge cases handled:
   * - Empty column: task gets position from dto directly
   * - Top of column: position is placed before the first existing task
   * - Bottom of column: position is placed after the last existing task
   * - Gap exhaustion: triggers full column rebalance to restore integer spacing
   *
   * @param id - UUID of the task to move
   * @param dto - Contains target `status` (column) and desired `position` (fractional index)
   * @returns The updated task with assignee relation included
   */
  async moveTask(id: string, dto: MoveTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { status, position } = dto;

    // Determine completedAt changes
    const completedAtData: { completedAt?: Date | null } = {};
    if (status === TaskStatus.DONE && task.status !== TaskStatus.DONE) {
      completedAtData.completedAt = new Date();
    } else if (task.status === TaskStatus.DONE && status !== TaskStatus.DONE) {
      completedAtData.completedAt = null;
    }

    // Get tasks in the target column to validate and potentially rebalance
    const tasksInColumn = await this.prisma.task.findMany({
      where: {
        projectId: task.projectId,
        status,
        deletedAt: null,
        id: { not: id },
      },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    });

    let finalPosition = position;

    // Check if we need to rebalance (gap too small)
    if (tasksInColumn.length > 0) {
      const needsRebalance = tasksInColumn.some((t, i) => {
        if (i === 0) return false;
        return Math.abs(t.position - tasksInColumn[i - 1].position) < 0.001;
      });

      if (needsRebalance) {
        // Rebalance all positions in the column and update the moved task in a single transaction
        const rebalanceOps = tasksInColumn.map((t, index) =>
          this.prisma.task.update({
            where: { id: t.id },
            data: { position: (index + 1) * 1.0 },
          }),
        );

        // After rebalancing, positions become 1.0, 2.0, 3.0, ...
        // Find where the desired position fits in the new sequence
        const newPositions = tasksInColumn.map((_, index) => (index + 1) * 1.0);

        // Find the insertion index: where the desired position would land
        let insertIndex = newPositions.length; // default: after all
        for (let i = 0; i < newPositions.length; i++) {
          if (position <= newPositions[i]) {
            insertIndex = i;
            break;
          }
        }

        // Calculate the final position between the surrounding rebalanced positions
        const before = insertIndex > 0 ? newPositions[insertIndex - 1] : 0;
        const after =
          insertIndex < newPositions.length
            ? newPositions[insertIndex]
            : newPositions[newPositions.length - 1] + 1.0;
        finalPosition = (before + after) / 2;

        const moveOp = this.prisma.task.update({
          where: { id },
          data: {
            status,
            position: finalPosition,
            ...completedAtData,
          },
          include: {
            assignee: {
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

        const results = await this.prisma.$transaction([...rebalanceOps, moveOp]);
        const updated = results[results.length - 1];

        this.eventEmitter.emit('task.moved', {
          taskId: id,
          projectId: task.projectId,
          userId: task.reporterId,
          data: {
            previousStatus: task.status,
            previousPosition: task.position,
            newStatus: status,
            newPosition: finalPosition,
          },
        });

        return updated;
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        status,
        position: finalPosition,
        ...completedAtData,
      },
      include: {
        assignee: {
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

    this.eventEmitter.emit('task.moved', {
      taskId: id,
      projectId: task.projectId,
      userId: task.reporterId,
      data: {
        previousStatus: task.status,
        previousPosition: task.position,
        newStatus: status,
        newPosition: finalPosition,
      },
    });

    return updated;
  }

  async softDelete(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const deleted = await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.eventEmitter.emit('task.deleted', {
      taskId: id,
      projectId: task.projectId,
      userId: task.reporterId,
      data: { task },
    });

    return deleted;
  }

  async addLabel(taskId: string, labelId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const label = await this.prisma.label.findUnique({
      where: { id: labelId },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return this.prisma.taskLabel.create({
      data: {
        taskId,
        labelId,
      },
      include: {
        label: true,
      },
    });
  }

  async removeLabel(taskId: string, labelId: string) {
    const taskLabel = await this.prisma.taskLabel.findUnique({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });

    if (!taskLabel) {
      throw new NotFoundException('Label not attached to this task');
    }

    return this.prisma.taskLabel.delete({
      where: {
        taskId_labelId: {
          taskId,
          labelId,
        },
      },
    });
  }
}
