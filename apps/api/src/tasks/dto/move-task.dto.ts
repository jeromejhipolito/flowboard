import { IsEnum, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class MoveTaskDto {
  @ApiProperty({ enum: TaskStatus })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({ description: 'Target position in the column' })
  @IsNumber()
  @IsPositive()
  position: number;
}
