import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let redis: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock.jwt.token') } },
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
  });

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'ghost@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
