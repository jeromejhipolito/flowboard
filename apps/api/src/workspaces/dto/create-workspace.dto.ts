import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ minLength: 2, maxLength: 50 })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
