import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let redis: any;
  let jwtSign: jest.Mock;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    redis = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };
    jwtSign = jest.fn().mockReturnValue('mock.jwt.token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jwtSign } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('7d') } },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should throw ConflictException when email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' });
      await expect(
        service.register({ email: 'test@test.com', password: 'Password1!', firstName: 'A', lastName: 'B' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return tokens and user without password on success', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id', email: 'new@test.com', firstName: 'A', lastName: 'B',
        password: 'hashed', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.register({
        email: 'new@test.com', password: 'Password1!', firstName: 'A', lastName: 'B',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
    });

    it('should store refresh token in Redis with key refresh:{token}', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id', email: 'new@test.com', firstName: 'A', lastName: 'B',
        password: 'hashed', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.register({
        email: 'new@test.com', password: 'Password1!', firstName: 'A', lastName: 'B',
      });

      expect(redis.set).toHaveBeenCalledWith(
        `refresh:${result.refreshToken}`,
        'new-id',
        'EX',
        expect.any(Number),
      );
    });

    it('should store refresh token with correct TTL (7 days = 604800s)', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-id', email: 'new@test.com', firstName: 'A', lastName: 'B',
        password: 'hashed', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await service.register({
        email: 'new@test.com', password: 'Password1!', firstName: 'A', lastName: 'B',
      });

      expect(redis.set).toHaveBeenCalledWith(
        expect.stringMatching(/^refresh:/),
        'new-id',
        'EX',
        604800,
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'ghost@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword1!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', password: hashedPassword,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPassword1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and user without password on correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('CorrectPassword1!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', firstName: 'A', lastName: 'B',
        password: hashedPassword, avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.login({ email: 'test@test.com', password: 'CorrectPassword1!' });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException when redis.get returns null', async () => {
      redis.get.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user no longer exists', async () => {
      redis.get.mockResolvedValue('deleted-user-id');
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should delete old refresh key before issuing new one (rotation)', async () => {
      redis.get.mockResolvedValue('user-1');
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', firstName: 'A', lastName: 'B',
      });

      await service.refreshTokens('old-token');

      expect(redis.del).toHaveBeenCalledWith('refresh:old-token');
    });

    it('should return new accessToken and refreshToken', async () => {
      redis.get.mockResolvedValue('user-1');
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', firstName: 'A', lastName: 'B',
      });

      const result = await service.refreshTokens('old-token');

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      // New refresh token should be stored in Redis
      expect(redis.set).toHaveBeenCalledWith(
        `refresh:${result.refreshToken}`,
        'user-1',
        'EX',
        expect.any(Number),
      );
    });
  });

  describe('logout', () => {
    it('should call redis.del with correct key when refreshToken provided', async () => {
      await service.logout('user-1', 'my-refresh-token');

      expect(redis.del).toHaveBeenCalledWith('refresh:my-refresh-token');
    });

    it('should NOT call redis.del when no refreshToken', async () => {
      await service.logout('user-1');

      expect(redis.del).not.toHaveBeenCalled();
    });
  });

  describe('parseTtl (via constructor)', () => {
    // parseTtl is private, but we can test it indirectly by checking the TTL passed to redis.set
    // The default ConfigService mock returns '7d', so refreshTtlSeconds = 604800

    it('should parse 7d as 604800 seconds (verified via redis.set TTL)', async () => {
      // The beforeEach sets ConfigService.get to return '7d'
      // Register triggers storeRefreshToken which calls redis.set with the TTL
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1', email: 'test@test.com', firstName: 'A', lastName: 'B',
        password: 'hashed', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await service.register({
        email: 'test@test.com', password: 'Password1!', firstName: 'A', lastName: 'B',
      });

      // 7d = 7 * 24 * 60 * 60 = 604800
      expect(redis.set).toHaveBeenCalledWith(
        expect.any(String),
        'user-1',
        'EX',
        604800,
      );
    });

    async function createServiceWithTtl(ttlValue: string): Promise<AuthService> {
      const mod = await Test.createTestingModule({
        providers: [
          AuthService,
          { provide: PrismaService, useValue: prisma },
          { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('tok') } },
          { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(ttlValue) } },
          { provide: REDIS_CLIENT, useValue: redis },
        ],
      }).compile();
      return mod.get<AuthService>(AuthService);
    }

    it('should parse 15m as 900 seconds', async () => {
      const svc = await createServiceWithTtl('15m');
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 't@t.com', firstName: 'A', lastName: 'B',
        password: 'h', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await svc.register({ email: 't@t.com', password: 'Password1!', firstName: 'A', lastName: 'B' });

      expect(redis.set).toHaveBeenCalledWith(expect.any(String), 'u1', 'EX', 900);
    });

    it('should parse 1h as 3600 seconds', async () => {
      const svc = await createServiceWithTtl('1h');
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 't@t.com', firstName: 'A', lastName: 'B',
        password: 'h', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await svc.register({ email: 't@t.com', password: 'Password1!', firstName: 'A', lastName: 'B' });

      expect(redis.set).toHaveBeenCalledWith(expect.any(String), 'u1', 'EX', 3600);
    });

    it('should default to 604800 (7 days) for invalid format', async () => {
      const svc = await createServiceWithTtl('invalid');
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'u1', email: 't@t.com', firstName: 'A', lastName: 'B',
        password: 'h', avatarUrl: null, createdAt: new Date(), updatedAt: new Date(),
      });

      await svc.register({ email: 't@t.com', password: 'Password1!', firstName: 'A', lastName: 'B' });

      expect(redis.set).toHaveBeenCalledWith(expect.any(String), 'u1', 'EX', 604800);
    });
  });
});
