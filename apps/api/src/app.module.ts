import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from 'nestjs-pino';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { GatewayModule } from './gateway/gateway.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { LabelsModule } from './labels/labels.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { AiModule } from './ai/ai.module';
import { SprintsModule } from './sprints/sprints.module';

@Module({
  imports: [
    // Global configuration with validation
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        JWT_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        API_PORT: Joi.number().default(3001),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        ANTHROPIC_API_KEY: Joi.string().allow('').optional(),
      }),
    }),

    // Event emitter for domain events
    EventEmitterModule.forRoot(),

    // Bull queue (Redis-backed)
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),

    // Structured logging (pino)
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Global Prisma module
    PrismaModule,

    // Global Redis module
    RedisModule,

    // --- Feature modules ---
    AuthModule,
    UsersModule,
    WorkspacesModule,
    GatewayModule,
    ProjectsModule,
    TasksModule,
    LabelsModule,
    AuditModule,
    NotificationsModule,
    CommentsModule,
    AnalyticsModule,
    HealthModule,
    AiModule,
    SprintsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
