import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findAllForUser(userId, {
      read: query.read,
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(id, userId);
  }
}
