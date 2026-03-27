import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ minLength: 1, maxLength: 200 })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date string' })
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentTaskId?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  storyPoints?: number;
}
