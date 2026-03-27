import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller()
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('tasks/:id/activity')
  @ApiOperation({ summary: 'Get paginated activity feed for a task' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTaskActivity(
    @Param('id') taskId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Number(limit) || 20, 100);

    const logs = await this.prisma.auditLog.findMany({
      where: { taskId },
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
      orderBy: { occurredAt: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasMore = logs.length > take;
    const results = hasMore ? logs.slice(0, take) : logs;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      data: results.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        actor: log.actor,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        before: log.before,
        after: log.after,
        timestamp: log.occurredAt,
      })),
      nextCursor,
      hasMore,
    };
  }

  @Get('projects/:id/activity')
  @ApiOperation({ summary: 'Get project-wide activity feed for all tasks' })
  @ApiQuery({ name: 'cursor', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getProjectActivity(
    @Param('id') projectId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const take = Math.min(Number(limit) || 20, 100);

    // Find all task IDs in this project
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      select: { id: true },
    });
    const taskIds = tasks.map((t) => t.id);

    const logs = await this.prisma.auditLog.findMany({
      where: { taskId: { in: taskIds } },
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
      orderBy: { occurredAt: 'desc' },
      take: take + 1,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const hasMore = logs.length > take;
    const results = hasMore ? logs.slice(0, take) : logs;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    return {
      data: results.map((log) => ({
        id: log.id,
        actorId: log.actorId,
        actor: log.actor,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        before: log.before,
        after: log.after,
        timestamp: log.occurredAt,
      })),
      nextCursor,
      hasMore,
    };
  }
}
