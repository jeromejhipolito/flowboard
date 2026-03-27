import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { ParseTaskDto } from './dto/parse-task.dto';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('parse-task')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Parse natural language into structured task data' })
  async parseTask(@Body() dto: ParseTaskDto) {
    const result = await this.aiService.parseTask(dto.input, dto.workspaceMembers, dto.workspaceLabels);
    if (!result) {
      return { success: false, fallback: true, data: null };
    }
    return { success: true, fallback: false, data: result };
  }
}
