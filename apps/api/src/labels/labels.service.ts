import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, dto: CreateLabelDto) {
    return this.prisma.label.create({
      data: {
        workspaceId,
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async findAllByWorkspace(workspaceId: string) {
    return this.prisma.label.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdateLabelDto) {
    const label = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return this.prisma.label.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async delete(id: string) {
    const label = await this.prisma.label.findUnique({
      where: { id },
    });

    if (!label) {
      throw new NotFoundException('Label not found');
    }

    return this.prisma.label.delete({
      where: { id },
    });
  }
}
