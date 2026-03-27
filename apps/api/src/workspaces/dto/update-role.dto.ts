import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from '@prisma/client';

export class UpdateRoleDto {
  @ApiProperty({ enum: WorkspaceRole, example: WorkspaceRole.ADMIN })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
