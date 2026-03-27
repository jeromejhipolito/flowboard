import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateNotificationParams {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  resourceType: string;
  resourceId: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notification')
    private readonly notificationQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(params: CreateNotificationParams): Promise<void> {
    await this.notificationQueue.add(params, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }

  async findAllForUser(
    userId: string,
    query: { read?: boolean; cursor?: string; limit?: number },
  ) {
    const { read, cursor, limit = 20 } = query;
    const take = Math.min(limit, 100);

    const where: any = {
      recipientId: userId,
      ...(read !== undefined && { read }),
    };

    const notifications = await this.prisma.notification.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            timezone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasMore = notifications.length > take;
    const results = hasMore ? notifications.slice(0, take) : notifications;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      data: results,
      nextCursor,
      hasMore,
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        read: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id,
        recipientId: userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }
}
