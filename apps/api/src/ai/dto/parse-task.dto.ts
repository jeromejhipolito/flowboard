import { IsString, MaxLength, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class MemberInfo {
  @IsString() id: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
}

class LabelInfo {
  @IsString() id: string;
  @IsString() name: string;
}

export class ParseTaskDto {
  @ApiProperty({ description: 'Natural language task description' })
  @IsString()
  @MaxLength(500)
  input: string;

  @ApiProperty({ description: 'Workspace members for name resolution' })
  @IsArray()
  @IsOptional()
  workspaceMembers?: MemberInfo[];

  @ApiProperty({ description: 'Workspace labels for suggestion' })
  @IsArray()
  @IsOptional()
  workspaceLabels?: LabelInfo[];
}
