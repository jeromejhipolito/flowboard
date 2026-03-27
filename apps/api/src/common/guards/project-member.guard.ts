import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard that checks workspace membership via project context.
 *
 * Resolution order for finding the projectId:
 *  1. `req.params.projectId`        — project-scoped routes (e.g. POST projects/:projectId/tasks)
 *  2. `req.params.taskId`           — task-scoped routes    (e.g. POST tasks/:taskId/comments)
 *  3. `req.params.id` as task id    — task-level routes     (e.g. PATCH tasks/:id)
 *  4. `req.params.id` as comment id — comment-level routes  (e.g. PATCH comments/:id)
 *
 * For cases 2-4, the guard looks up the task (and optionally the comment) to
 * obtain the projectId, then verifies the project exists and the current user
 * is a member of its workspace.
 *
 * On success, `request.workspaceMembership` is populated for downstream use.
 */
@Injectable()
export class ProjectMemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    const projectId = await this.resolveProjectId(request);

    // Look up the project to get its workspaceId
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check workspace membership
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: project.workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this workspace');
    }

    request.workspaceMembership = membership;
    return true;
  }

  /**
   * Resolves the projectId from request params by checking multiple strategies.
   */
  private async resolveProjectId(request: any): Promise<string> {
    const { projectId, taskId, sprintId, id } = request.params;

    // Strategy 1: projectId is directly available
    if (projectId) {
      return projectId;
    }

    // Strategy 2: sprintId param — look up the sprint to get projectId
    if (sprintId) {
      return this.getProjectIdFromSprint(sprintId);
    }

    // Strategy 3: taskId param — look up the task to get projectId
    if (taskId) {
      return this.getProjectIdFromTask(taskId);
    }

    // Strategy 4: Only `id` is present — could be a task or a comment
    if (id) {
      return this.getProjectIdFromTaskOrComment(id);
    }

    throw new NotFoundException('Project not found');
  }

  /**
   * Given a sprint ID, returns its projectId.
   */
  private async getProjectIdFromSprint(sprintId: string): Promise<string> {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      select: { projectId: true },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return sprint.projectId;
  }

  /**
   * Given a task ID, returns its projectId.
   */
  private async getProjectIdFromTask(taskId: string): Promise<string> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task.projectId;
  }

  /**
   * Given an `id` param that could be either a task or a comment,
   * tries task first, then falls back to comment.
   */
  private async getProjectIdFromTaskOrComment(id: string): Promise<string> {
    // Try as a task first
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (task) {
      return task.projectId;
    }

    // Try as a comment
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { task: { select: { projectId: true } } },
    });

    if (comment) {
      return comment.task.projectId;
    }

    throw new NotFoundException('Resource not found');
  }
}
