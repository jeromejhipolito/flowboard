import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLabelDto {
  @ApiProperty({ minLength: 1, maxLength: 50 })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Hex color string (e.g. #FF5733)',
    example: '#FF5733',
  })
  @IsString()
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'color must be a valid hex color string (e.g. #FF5733)',
  })
  color: string;
}
