import { IsBoolean, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class NotificationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  read?: boolean;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
