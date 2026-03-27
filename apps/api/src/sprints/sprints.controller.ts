import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SprintsService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { CompleteSprintDto } from './dto/complete-sprint.dto';
import { SprintQueryDto } from './dto/sprint-query.dto';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';

@ApiTags('Sprints')
@ApiBearerAuth()
@UseGuards(ProjectMemberGuard)
@Controller()
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post('projects/:projectId/sprints')
  @ApiOperation({ summary: 'Create a new sprint in a project' })
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintsService.create(projectId, dto);
  }

  @Get('projects/:projectId/sprints')
  @ApiOperation({ summary: 'List sprints in a project with optional status filter' })
  findAll(
    @Param('projectId') projectId: string,
    @Query() query: SprintQueryDto,
  ) {
    return this.sprintsService.findAllByProject(projectId, query);
  }

  @Get('projects/:projectId/sprints/active')
  @ApiOperation({ summary: 'Get the active sprint for a project' })
  findActive(@Param('projectId') projectId: string) {
    return this.sprintsService.findActive(projectId);
  }

  @Get('sprints/:sprintId')
  @ApiOperation({ summary: 'Get sprint details with task summary stats' })
  findOne(@Param('sprintId') sprintId: string) {
    return this.sprintsService.findById(sprintId);
  }

  @Patch('sprints/:sprintId')
  @ApiOperation({ summary: 'Update sprint name, goal, or dates' })
  update(
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintsService.update(sprintId, dto);
  }

  @Post('sprints/:sprintId/start')
  @ApiOperation({ summary: 'Start a sprint (must be in PLANNING status)' })
  start(@Param('sprintId') sprintId: string) {
    return this.sprintsService.start(sprintId);
  }

  @Post('sprints/:sprintId/complete')
  @ApiOperation({ summary: 'Complete a sprint and optionally carry over tasks' })
  complete(
    @Param('sprintId') sprintId: string,
    @Body() dto: CompleteSprintDto,
  ) {
    return this.sprintsService.complete(sprintId, dto);
  }

  @Delete('sprints/:sprintId')
  @ApiOperation({ summary: 'Delete a planning sprint with no assigned tasks' })
  remove(@Param('sprintId') sprintId: string) {
    return this.sprintsService.delete(sprintId);
  }
}
