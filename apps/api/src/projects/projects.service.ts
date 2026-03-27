import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveWorkspaceId(idOrSlug: string): Promise<string> {
    const isCuid = idOrSlug.startsWith('c') && idOrSlug.length > 20;
    if (isCuid) return idOrSlug;
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug: idOrSlug },
      select: { id: true },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace.id;
  }

  async create(workspaceIdOrSlug: string, dto: CreateProjectDto) {
    const workspaceId = await this.resolveWorkspaceId(workspaceIdOrSlug);
    return this.prisma.project.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAllByWorkspace(workspaceIdOrSlug: string) {
    const workspaceId = await this.resolveWorkspaceId(workspaceIdOrSlug);
    const projects = await this.prisma.project.findMany({
      where: {
        workspaceId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          where: { deletedAt: null },
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => {
      const taskCountByStatus = project.tasks.reduce(
        (acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const { tasks, ...rest } = project;

      return {
        ...rest,
        taskCountByStatus,
      };
    });
  }

  async findById(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { status: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const taskCountByStatus = project.tasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const { tasks, ...rest } = project;

    return {
      ...rest,
      taskCountByStatus,
    };
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async softDelete(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
