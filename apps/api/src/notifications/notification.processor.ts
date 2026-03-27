import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationParams } from './notifications.service';

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process()
  async handleNotification(job: Job<CreateNotificationParams>): Promise<void> {
    const { recipientId, actorId, type, resourceType, resourceId } = job.data;

    try {
      const notification = await this.prisma.notification.create({
        data: {
          recipientId,
          actorId,
          type,
          resourceType,
          resourceId,
        },
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Emit event so EventsGateway can push via WebSocket
      this.eventEmitter.emit('notification.created', {
        recipientId,
        notification,
      });

      this.logger.debug(
        `Notification created: ${type} for user ${recipientId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${error.message}`,
        error.stack,
      );
      throw error;  // Let Bull handle retry
    }
  }
}
