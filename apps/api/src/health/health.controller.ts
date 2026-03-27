import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Application health check' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.redis.ping();
          return { redis: { status: 'up' } };
        } catch {
          return { redis: { status: 'down' } };
        }
      },
    ]);
  }
}
