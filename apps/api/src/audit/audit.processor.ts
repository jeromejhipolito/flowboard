import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogParams } from './audit.service';

@Processor('audit')
export class AuditProcessor {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process()
  async handleAuditLog(job: Job<AuditLogParams>): Promise<void> {
    const { actorId, taskId, resourceType, resourceId, action, before, after } =
      job.data;

    try {
      await this.prisma.auditLog.create({
        data: {
          actorId,
          taskId,
          resourceType,
          resourceId,
          action,
          before: before ?? undefined,
          after: after ?? undefined,
        },
      });

      this.logger.debug(
        `Audit log created: ${action} on ${resourceType}/${resourceId} by ${actorId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
      throw error;  // Let Bull handle retry
    }
  }
}
