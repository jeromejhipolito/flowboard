import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment body text', minLength: 1 })
  @IsString()
  @MinLength(1)
  body: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for threaded replies' })
  @IsString()
  @IsOptional()
  parentCommentId?: string;
}
