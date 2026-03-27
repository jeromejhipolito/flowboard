import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated comment body text', minLength: 1 })
  @IsString()
  @MinLength(1)
  body: string;
}
