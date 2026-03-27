import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AiListener {
  private readonly logger = new Logger(AiListener.name);

  constructor(@InjectQueue('ai') private readonly aiQueue: Queue) {}

  @OnEvent('task.created')
  async handleTaskCreated(payload: { taskId: string; projectId: string; userId: string; data: any }) {
    if (!payload.data?.description) return;

    await this.aiQueue.add('enrich-task', payload, {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
    });
    this.logger.debug(`Queued AI enrichment for task ${payload.taskId}`);
  }
}
