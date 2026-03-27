import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditAction } from '@prisma/client';
import { AuditService } from './audit.service';
import { TaskEvent } from '../gateway/types';

@Injectable()
export class AuditListener {
  constructor(private readonly auditService: AuditService) {}

  @OnEvent('task.created')
  async handleTaskCreated(payload: TaskEvent): Promise<void> {
    await this.auditService.log({
      actorId: payload.userId,
      taskId: payload.taskId,
      resourceType: 'Task',
      resourceId: payload.taskId,
      action: AuditAction.CREATED,
      after: payload.data,
    });
  }

  @OnEvent('task.updated')
  async handleTaskUpdated(payload: TaskEvent): Promise<void> {
    await this.auditService.log({
      actorId: payload.userId,
      taskId: payload.taskId,
      resourceType: 'Task',
      resourceId: payload.taskId,
      action: AuditAction.UPDATED,
      before: payload.data?.before,
      after: payload.data?.after,
    });
  }

  @OnEvent('task.moved')
  async handleTaskMoved(payload: TaskEvent): Promise<void> {
    await this.auditService.log({
      actorId: payload.userId,
      taskId: payload.taskId,
      resourceType: 'Task',
      resourceId: payload.taskId,
      action: AuditAction.STATUS_CHANGED,
      before: {
        status: payload.data?.previousStatus,
        position: payload.data?.previousPosition,
      },
      after: {
        status: payload.data?.newStatus,
        position: payload.data?.newPosition,
      },
    });
  }

  @OnEvent('task.deleted')
  async handleTaskDeleted(payload: TaskEvent): Promise<void> {
    await this.auditService.log({
      actorId: payload.userId,
      taskId: payload.taskId,
      resourceType: 'Task',
      resourceId: payload.taskId,
      action: AuditAction.DELETED,
      before: payload.data?.task,
    });
  }
}
