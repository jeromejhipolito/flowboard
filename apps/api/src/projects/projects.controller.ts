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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkspaceMemberGuard } from '../common/guards/workspace-member.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard, RolesGuard)
  @Roles('MEMBER')
  @ApiOperation({ summary: 'Create a new project in workspace' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/projects')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'List all projects in workspace' })
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectsService.findAllByWorkspace(workspaceId);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Get project details with task stats' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch('projects/:id')
  @ApiOperation({ summary: 'Update project name, description, or status' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Soft delete a project (ADMIN+)' })
  remove(@Param('id') id: string) {
    return this.projectsService.softDelete(id);
  }
}
