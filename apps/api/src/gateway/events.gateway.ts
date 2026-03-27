import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { TaskEvent, SprintEvent, NotificationEvent } from './types';
import { REDIS_CLIENT } from '../redis/redis.module';

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }, namespace: '/' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(EventsGateway.name);

  /** userId -> Set of socketIds — O(1) lookup replacing the O(N) scan */
  private readonly userSockets = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  // ----------------------------------------------------------------
  // Adapter initialization (Redis pub/sub for horizontal scaling)
  // ----------------------------------------------------------------

  afterInit(): void {
    try {
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);

      const pubClient = new Redis({ host: redisHost, port: redisPort });
      const subClient = pubClient.duplicate();

      this.server.adapter(createAdapter(pubClient, subClient) as any);
      this.logger.log('Socket.io Redis adapter initialized');
    } catch (error) {
      this.logger.warn(`Socket.io Redis adapter failed to initialize: ${error.message}. Running in single-server mode.`);
    }
  }

  // ----------------------------------------------------------------
  // Connection lifecycle
  // ----------------------------------------------------------------

  handleConnection(client: Socket): void {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(
          `Client ${client.id} connected without a token — disconnecting`,
        );
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>('JWT_SECRET')!;
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;

      const userId = payload.sub as string;
      client.data.userId = userId;

      // Track socket in the userId -> socketIds map
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      // Auto-join personal notification room
      client.join(`user:${userId}`);

      this.logger.log(
        `Client ${client.id} connected — userId: ${userId}`,
      );
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} failed JWT verification — disconnecting: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId ?? 'unknown';

    // Remove socket from the userId -> socketIds map
    if (userId !== 'unknown') {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    this.logger.log(`Client ${client.id} disconnected — userId: ${userId}`);
  }

  // ----------------------------------------------------------------
  // Room management
  // ----------------------------------------------------------------

  @SubscribeMessage('joinBoard')
  async joinBoard(client: Socket, data: { projectId: string }): Promise<void> {
    const { projectId } = data;
    const userId = client.data.userId;

    // Verify the project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { workspaceId: true },
    });

    if (!project) {
      client.emit('error', {
        code: 'NOT_FOUND',
        message: 'Project not found',
      });
      return;
    }

    // Verify the user is a member of the project's workspace
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: project.workspaceId,
        },
      },
    });

    if (!membership) {
      this.logger.warn(
        `Unauthorized joinBoard attempt — user ${userId} (client ${client.id}) tried to join board:${projectId} without workspace membership`,
      );
      client.emit('error', {
        code: 'FORBIDDEN',
        message: 'Not a member of this workspace',
      });
      return;
    }

    const room = `board:${projectId}`;
    client.join(room);
    this.logger.log(
      `Client ${client.id} (user: ${userId}) joined room ${room}`,
    );
  }

  @SubscribeMessage('leaveBoard')
  leaveBoard(client: Socket, data: { projectId: string }): void {
    const room = `board:${data.projectId}`;
    client.leave(room);
    this.logger.log(
      `Client ${client.id} (user: ${client.data.userId}) left room ${room}`,
    );
  }

  // ----------------------------------------------------------------
  // Task domain-event listeners  (emitted by TasksService)
  // ----------------------------------------------------------------

  @OnEvent('task.created')
  handleTaskCreated(payload: TaskEvent): void {
    const room = `board:${payload.projectId}`;
    const excludedSockets = this.getSocketIdsForUser(payload.userId);
    this.server
      .to(room)
      .except(excludedSockets)
      .emit('task:created', payload);
    this.logger.debug(`Emitted task:created to ${room}`);
  }

  @OnEvent('task.updated')
  handleTaskUpdated(payload: TaskEvent): void {
    const room = `board:${payload.projectId}`;
    const excludedSockets = this.getSocketIdsForUser(payload.userId);
    this.server
      .to(room)
      .except(excludedSockets)
      .emit('task:updated', payload);
    this.logger.debug(`Emitted task:updated to ${room}`);
  }

  @OnEvent('task.moved')
  handleTaskMoved(payload: TaskEvent): void {
    const room = `board:${payload.projectId}`;
    const excludedSockets = this.getSocketIdsForUser(payload.userId);
    this.server.to(room).except(excludedSockets).emit('task:moved', payload);
    this.logger.debug(`Emitted task:moved to ${room}`);
  }

  @OnEvent('task.deleted')
  handleTaskDeleted(payload: TaskEvent): void {
    const room = `board:${payload.projectId}`;
    const excludedSockets = this.getSocketIdsForUser(payload.userId);
    this.server
      .to(room)
      .except(excludedSockets)
      .emit('task:deleted', payload);
    this.logger.debug(`Emitted task:deleted to ${room}`);
  }

  // ----------------------------------------------------------------
  // Sprint domain-event listeners  (emitted by SprintsService)
  // ----------------------------------------------------------------

  @OnEvent('sprint.completed')
  handleSprintCompleted(payload: SprintEvent): void {
    const room = `board:${payload.projectId}`;
    this.server.to(room).emit('sprint:completed', payload);
    this.logger.debug(`Emitted sprint:completed to ${room}`);
  }

  // ----------------------------------------------------------------
  // Notification event listener  (Phase 3)
  // ----------------------------------------------------------------

  @OnEvent('notification.created')
  handleNotificationCreated(payload: NotificationEvent): void {
    const room = `user:${payload.recipientId}`;
    this.server.to(room).emit('notification:new', payload);
    this.logger.debug(`Emitted notification:new to ${room}`);
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------

  /**
   * Returns an array of socket IDs belonging to a given userId.
   * Uses a Map<string, Set<string>> for O(1) lookup instead of O(N) scan.
   */
  private getSocketIdsForUser(userId: string): string[] {
    const sockets = this.userSockets.get(userId);
    return sockets ? Array.from(sockets) : [];
  }
}
