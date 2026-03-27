import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SprintStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class SprintQueryDto {
  @ApiPropertyOptional({ enum: SprintStatus })
  @IsEnum(SprintStatus)
  @IsOptional()
  status?: SprintStatus;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Cursor for pagination (sprint ID)' })
  @IsString()
  @IsOptional()
  cursor?: string;
}
