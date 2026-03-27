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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectMemberGuard } from '../common/guards/project-member.guard';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(ProjectMemberGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('tasks/:taskId/comments')
  @ApiOperation({ summary: 'Create a comment on a task' })
  create(
    @Param('taskId') taskId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(taskId, userId, dto);
  }

  @Get('tasks/:taskId/comments')
  @ApiOperation({ summary: 'List threaded comments for a task' })
  findAll(@Param('taskId') taskId: string) {
    return this.commentsService.findAllByTask(taskId);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Edit your own comment' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(id, userId, dto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Soft delete your own comment' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.commentsService.softDelete(id, userId);
  }
}
