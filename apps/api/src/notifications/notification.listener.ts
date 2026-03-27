import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType } from '@prisma/client';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { TaskEvent } from '../gateway/types';

interface CommentCreatedEvent {
  commentId: string;
  taskId: string;
  authorId: string;
  assigneeId?: string;
  reporterId?: string;
}

interface MentionCreatedEvent {
  commentId: string;
  taskId: string;
  actorId: string;
  mentionedUserId: string;
}

@Injectable()
export class NotificationListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('task.created')
  async handleTaskCreated(payload: TaskEvent): Promise<void> {
    const assigneeId = payload.data?.assigneeId;

    // Notify assignee if the task is assigned and the assignee is not the creator
    if (assigneeId && assigneeId !== payload.userId) {
      await this.notificationsService.create({
        recipientId: assigneeId,
        actorId: payload.userId,
        type: NotificationType.TASK_ASSIGNED,
        resourceType: 'Task',
        resourceId: payload.taskId,
      });
    }
  }

  @OnEvent('task.updated')
  async handleTaskUpdated(payload: TaskEvent): Promise<void> {
    const before = payload.data?.before;
    const after = payload.data?.after;

    // If assignee changed, notify the new assignee
    if (
      after?.assigneeId &&
      after.assigneeId !== before?.assigneeId &&
      after.assigneeId !== payload.userId
    ) {
      await this.notificationsService.create({
        recipientId: after.assigneeId,
        actorId: payload.userId,
        type: NotificationType.TASK_ASSIGNED,
        resourceType: 'Task',
        resourceId: payload.taskId,
      });
    }
  }

  @OnEvent('task.moved')
  async handleTaskMoved(payload: TaskEvent): Promise<void> {
    // The move event payload doesn't include assigneeId, so look it up
    const task = await this.prisma.task.findUnique({
      where: { id: payload.taskId },
      select: { assigneeId: true },
    });

    const assigneeId = task?.assigneeId;

    if (assigneeId && assigneeId !== payload.userId) {
      await this.notificationsService.create({
        recipientId: assigneeId,
        actorId: payload.userId,
        type: NotificationType.TASK_STATUS_CHANGED,
        resourceType: 'Task',
        resourceId: payload.taskId,
      });
    }
  }

  @OnEvent('comment.created')
  async handleCommentCreated(payload: CommentCreatedEvent): Promise<void> {
    const { commentId, taskId, authorId, assigneeId, reporterId } = payload;
    const notifiedIds = new Set<string>();

    // Notify assignee
    if (assigneeId && assigneeId !== authorId) {
      notifiedIds.add(assigneeId);
      await this.notificationsService.create({
        recipientId: assigneeId,
        actorId: authorId,
        type: NotificationType.COMMENT_ADDED,
        resourceType: 'Comment',
        resourceId: commentId,
      });
    }

    // Notify reporter (if different from assignee and author)
    if (reporterId && reporterId !== authorId && !notifiedIds.has(reporterId)) {
      await this.notificationsService.create({
        recipientId: reporterId,
        actorId: authorId,
        type: NotificationType.COMMENT_ADDED,
        resourceType: 'Comment',
        resourceId: commentId,
      });
    }
  }

  @OnEvent('mention.created')
  async handleMentionCreated(payload: MentionCreatedEvent): Promise<void> {
    const { commentId, actorId, mentionedUserId } = payload;

    // Don't notify the actor
    if (mentionedUserId === actorId) return;

    await this.notificationsService.create({
      recipientId: mentionedUserId,
      actorId,
      type: NotificationType.MENTION,
      resourceType: 'Comment',
      resourceId: commentId,
    });
  }
}
