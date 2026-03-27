import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { AuditAction } from '@prisma/client';

export interface AuditLogParams {
  actorId: string;
  taskId?: string;
  resourceType: string;
  resourceId: string;
  action: AuditAction;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(@InjectQueue('audit') private readonly auditQueue: Queue) {}

  async log(params: AuditLogParams): Promise<void> {
    await this.auditQueue.add(params, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
