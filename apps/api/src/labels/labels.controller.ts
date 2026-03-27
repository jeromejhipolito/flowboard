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
import { LabelsService } from './labels.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { WorkspaceMemberGuard } from '../common/guards/workspace-member.guard';

@ApiTags('Labels')
@ApiBearerAuth()
@Controller()
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Post('workspaces/:workspaceId/labels')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'Create a new label in workspace' })
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateLabelDto,
  ) {
    return this.labelsService.create(workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/labels')
  @UseGuards(WorkspaceMemberGuard)
  @ApiOperation({ summary: 'List all labels in workspace' })
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.labelsService.findAllByWorkspace(workspaceId);
  }

  @Patch('labels/:id')
  @ApiOperation({ summary: 'Update label name or color' })
  update(@Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return this.labelsService.update(id, dto);
  }

  @Delete('labels/:id')
  @ApiOperation({ summary: 'Delete a label' })
  remove(@Param('id') id: string) {
    return this.labelsService.delete(id);
  }
}
