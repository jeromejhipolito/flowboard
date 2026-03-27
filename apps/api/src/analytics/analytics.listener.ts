import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AnalyticsService } from './analytics.service';
import { TaskEvent } from '../gateway/types';

@Injectable()
export class AnalyticsListener {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @OnEvent('task.created')
  async handleTaskCreated(payload: TaskEvent): Promise<void> {
    await this.analyticsService.invalidateCache(payload.projectId);
  }

  @OnEvent('task.updated')
  async handleTaskUpdated(payload: TaskEvent): Promise<void> {
    await this.analyticsService.invalidateCache(payload.projectId);
  }

  @OnEvent('task.moved')
  async handleTaskMoved(payload: TaskEvent): Promise<void> {
    await this.analyticsService.invalidateCache(payload.projectId);
  }

  @OnEvent('task.deleted')
  async handleTaskDeleted(payload: TaskEvent): Promise<void> {
    await this.analyticsService.invalidateCache(payload.projectId);
  }
}
