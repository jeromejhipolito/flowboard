import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteSprintDto {
  @ApiPropertyOptional({ description: 'ID of the next sprint to carry over incomplete tasks' })
  @IsString()
  @IsOptional()
  nextSprintId?: string;
}
