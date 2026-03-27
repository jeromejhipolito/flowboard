import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('projects/:id/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('task-distribution')
  @ApiOperation({ summary: 'Get task distribution by status for a project' })
  @ApiQuery({ name: 'sprintId', required: false })
  getTaskDistribution(
    @Param('id') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.analyticsService.getTaskDistribution(projectId, sprintId);
  }

  @Get('priority-breakdown')
  @ApiOperation({ summary: 'Get task breakdown by priority for a project' })
  @ApiQuery({ name: 'sprintId', required: false })
  getPriorityBreakdown(
    @Param('id') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.analyticsService.getPriorityBreakdown(projectId, sprintId);
  }

  @Get('member-workload')
  @ApiOperation({ summary: 'Get task workload per member for a project' })
  @ApiQuery({ name: 'sprintId', required: false })
  getMemberWorkload(
    @Param('id') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.analyticsService.getMemberWorkload(projectId, sprintId);
  }

  @Get('velocity')
  @ApiOperation({ summary: 'Get task completion velocity over last 8 weeks' })
  @ApiQuery({ name: 'sprintId', required: false })
  getVelocity(
    @Param('id') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.analyticsService.getVelocity(projectId, sprintId);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks count and top 5 overdue tasks' })
  @ApiQuery({ name: 'sprintId', required: false })
  getOverdueTasks(
    @Param('id') projectId: string,
    @Query('sprintId') sprintId?: string,
  ) {
    return this.analyticsService.getOverdueTasks(projectId, sprintId);
  }

  @Get('burndown')
  @ApiOperation({ summary: 'Get sprint burndown data (ideal vs actual remaining tasks)' })
  @ApiQuery({ name: 'sprintId', required: true })
  getBurndown(
    @Param('id') projectId: string,
    @Query('sprintId') sprintId: string,
  ) {
    return this.analyticsService.getBurndown(projectId, sprintId);
  }

  @Get('sprint-velocity')
  @ApiOperation({ summary: 'Get velocity across all closed sprints for the project' })
  getSprintVelocity(@Param('id') projectId: string) {
    return this.analyticsService.getSprintVelocity(projectId);
  }
}
