import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly refreshTtlSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {
    this.refreshTtlSeconds = this.parseTtl(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Public methods
  // ──────────────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: userWithoutPassword,
    };
  }

  async refreshTokens(refreshToken: string) {
    const userId = await this.validateRefreshToken(refreshToken);

    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Delete old refresh token (keyed by token value)
    await this.redis.del(`refresh:${refreshToken}`);

    // Generate new token pair
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.redis.del(`refresh:${refreshToken}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
    });

    const refreshToken = randomUUID();

    await this.storeRefreshToken(userId, refreshToken);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    // Store as refresh:{token} → userId for O(1) lookup by token
    await this.redis.set(
      `refresh:${token}`,
      userId,
      'EX',
      this.refreshTtlSeconds,
    );
  }

  private async validateRefreshToken(
    token: string,
  ): Promise<string | null> {
    // O(1) lookup: refresh:{token} → userId
    const userId = await this.redis.get(`refresh:${token}`);
    return userId || null;
  }

  /**
   * Parse a human-readable TTL string (e.g. '7d', '15m', '1h') into seconds.
   */
  private parseTtl(ttl: string): number {
    const match = ttl.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      this.logger.warn(`Invalid TTL format "${ttl}", defaulting to 7 days`);
      return 7 * 24 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 7 * 24 * 60 * 60;
    }
  }
}
