import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkspaceMemberGuard } from '../common/guards/workspace-member.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List current user's workspaces" })
  findAll(@CurrentUser('id') userId: string) {
    return this.workspacesService.findAllForUser(userId);
  }

  @Get(':id')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Get workspace details' })
  findOne(@Param('id') id: string) {
    return this.workspacesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update workspace (OWNER/ADMIN)' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkspaceDto) {
    return this.workspacesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Soft delete workspace (OWNER only)' })
  remove(@Param('id') id: string) {
    return this.workspacesService.softDelete(id);
  }

  @Post(':id/members')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Invite a member to workspace (OWNER/ADMIN)' })
  inviteMember(
    @Param('id') workspaceId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.workspacesService.inviteMember(workspaceId, dto, userId);
  }

  @Get(':id/members')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'List workspace members' })
  getMembers(@Param('id') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Patch(':id/members/:userId')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Update member role (OWNER only)' })
  updateMemberRole(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.workspacesService.updateMemberRole(
      workspaceId,
      userId,
      dto.role,
      currentUserId,
    );
  }

  @Delete(':id/members/:userId')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remove a member from workspace (OWNER/ADMIN)' })
  removeMember(
    @Param('id') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return this.workspacesService.removeMember(workspaceId, userId);
  }
}
