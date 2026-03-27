import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ description: 'Sprint ID to assign task to, or null to move to backlog' })
  @ValidateIf((o) => o.sprintId !== null)
  @IsString()
  @IsOptional()
  sprintId?: string | null;
}
