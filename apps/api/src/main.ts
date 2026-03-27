import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use pino as the application logger
  const logger = app.get(Logger);
  app.useLogger(logger);

  const configService = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  // Cookie parser
  app.use(cookieParser());

  // CORS
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global exception filters
  app.useGlobalFilters(new AllExceptionsFilter(), new PrismaExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FlowBoard API')
    .setDescription('Real-Time Collaborative Task Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  // Start server
  const port = configService.get<number>('API_PORT', 3001);
  await app.listen(port);

  logger.log(`FlowBoard API is running on http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
