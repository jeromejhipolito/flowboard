import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSprintDto {
  @ApiProperty({ minLength: 1, maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date string' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'ISO 8601 date string' })
  @IsString()
  @IsOptional()
  endDate?: string;
}
