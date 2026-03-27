import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(taskId: string, authorId: string, dto: CreateCommentDto) {
    // Validate task exists
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assigneeId: true, reporterId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Validate parent comment if provided
    if (dto.parentCommentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentCommentId },
      });

      if (!parentComment || parentComment.taskId !== taskId) {
        throw new NotFoundException(
          'Parent comment not found or does not belong to this task',
        );
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        taskId,
        authorId,
        body: dto.body,
        parentCommentId: dto.parentCommentId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            timezone: true,
          },
        },
      },
    });

    // Emit comment.created event for notifications
    this.eventEmitter.emit('comment.created', {
      commentId: comment.id,
      taskId,
      authorId,
      assigneeId: task.assigneeId,
      reporterId: task.reporterId,
    });

    // Parse @mentions from body and emit mention events
    const mentionRegex = /@(\w+)/g;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(dto.body)) !== null) {
      const username = match[1];

      // Look up user by first name (simple approach — could be enhanced)
      const mentionedUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { firstName: { equals: username, mode: 'insensitive' } },
            { email: { startsWith: username, mode: 'insensitive' } },
          ],
        },
        select: { id: true },
      });

      if (mentionedUser) {
        this.eventEmitter.emit('mention.created', {
          commentId: comment.id,
          taskId,
          actorId: authorId,
          mentionedUserId: mentionedUser.id,
        });
      }
    }

    return comment;
  }

  async findAllByTask(taskId: string) {
    // Fetch top-level comments with nested replies
    const comments = await this.prisma.comment.findMany({
      where: {
        taskId,
        parentCommentId: null,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            timezone: true,
          },
        },
        replies: {
          where: { deletedAt: null },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  async update(id: string, userId: string, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: {
        body: dto.body,
        editedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            timezone: true,
          },
        },
      },
    });
  }

  async softDelete(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment || comment.deletedAt) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
