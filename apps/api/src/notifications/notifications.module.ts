import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationListener } from './notification.listener';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [BullModule.registerQueue({ name: 'notification' })],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationProcessor, NotificationListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}
