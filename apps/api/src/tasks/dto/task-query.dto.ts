import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { Type } from 'class-transformer';

export class TaskQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Filter by sprint ID. Use "backlog" for unassigned tasks.' })
  @IsString()
  @IsOptional()
  sprintId?: string;

  @ApiPropertyOptional({ description: 'Search by task title or description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Cursor for pagination (task ID)' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @ApiPropertyOptional({ default: 'position', description: 'Sort field' })
  @IsString()
  @IsOptional()
  sort?: string = 'position';
}
