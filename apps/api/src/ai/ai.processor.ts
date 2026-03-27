import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Processor('ai')
export class AiProcessor {
  private readonly logger = new Logger(AiProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Process('enrich-task')
  async handleEnrichTask(job: Job) {
    const { taskId, projectId } = job.data;

    try {
      const task = await this.prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { select: { workspaceId: true } } },
      });

      if (!task || !task.description) return;

      const labels = await this.prisma.label.findMany({
        where: { workspaceId: task.project.workspaceId },
        select: { id: true, name: true },
      });

      const suggestions = await this.aiService.enrichTask(
        { id: task.id, title: task.title, description: task.description, priority: task.priority },
        labels,
      );

      if (!suggestions) return;

      const updateData: any = {};

      // Only suggest priority if user left it as default MEDIUM
      if (task.priority === 'MEDIUM' && suggestions.suggestedPriority && suggestions.suggestedPriority !== 'MEDIUM') {
        updateData.priority = suggestions.suggestedPriority;
      }

      // Suggest labels
      if (suggestions.suggestedLabelIds?.length > 0) {
        const validLabelIds = suggestions.suggestedLabelIds.filter((id: string) => labels.some(l => l.id === id));
        if (validLabelIds.length > 0) {
          await this.prisma.taskLabel.createMany({
            data: validLabelIds.map((labelId: string) => ({ taskId, labelId })),
            skipDuplicates: true,
          });
        }
      }

      if (Object.keys(updateData).length > 0) {
        await this.prisma.task.update({ where: { id: taskId }, data: updateData });
      }

      this.eventEmitter.emit('task.updated', { taskId, projectId, userId: 'ai', data: { aiEnriched: true } });
      this.logger.log(`AI enriched task ${taskId}`);
    } catch (error) {
      this.logger.error(`AI enrichment failed for task ${taskId}: ${error.message}`);
      throw error;
    }
  }
}
