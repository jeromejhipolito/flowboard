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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(ProjectMemberGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Create a new task in a project' })
  create(
    @Param('projectId') projectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, userId, dto);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'List tasks in a project with filters and pagination' })
  findAll(
    @Param('projectId') projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.findAllByProject(projectId, query);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get task details with subtasks, labels, and comments count' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task fields' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Patch('tasks/:id/move')
  @ApiOperation({ summary: 'Move task to a different status/position' })
  move(@Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.tasksService.moveTask(id, dto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Soft delete a task' })
  remove(@Param('id') id: string) {
    return this.tasksService.softDelete(id);
  }

  @Post('tasks/:id/labels/:labelId')
  @ApiOperation({ summary: 'Add a label to a task' })
  addLabel(
    @Param('id') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.tasksService.addLabel(taskId, labelId);
  }

  @Delete('tasks/:id/labels/:labelId')
  @ApiOperation({ summary: 'Remove a label from a task' })
  removeLabel(
    @Param('id') taskId: string,
    @Param('labelId') labelId: string,
  ) {
    return this.tasksService.removeLabel(taskId, labelId);
  }
}
