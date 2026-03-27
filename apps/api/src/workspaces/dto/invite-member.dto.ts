import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: WorkspaceRole, example: WorkspaceRole.MEMBER })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}
