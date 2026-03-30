import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  const mockRes = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  });

  const mockReq = (cookies: Record<string, string> = {}) => ({
    cookies,
  });

  // ── register ────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'test@test.com',
      password: 'Password1!',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should call authService.register with dto', async () => {
      const res = mockRes();
      authService.register.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1', email: dto.email },
      });

      await controller.register(dto, res as any);

      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should set refresh_token cookie via res.cookie', async () => {
      const res = mockRes();
      authService.register.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt-value',
        user: { id: 'u1' },
      });

      await controller.register(dto, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt-value',
        expect.objectContaining({
          httpOnly: true,
          path: '/auth',
        }),
      );
    });

    it('should return accessToken and user without refreshToken in body', async () => {
      const res = mockRes();
      authService.register.mockResolvedValue({
        accessToken: 'access-token-val',
        refreshToken: 'refresh-token-val',
        user: { id: 'u1', email: dto.email },
      });

      const result = await controller.register(dto, res as any);

      expect(result).toEqual({
        accessToken: 'access-token-val',
        user: { id: 'u1', email: dto.email },
      });
      expect(result).not.toHaveProperty('refreshToken');
    });

    it('should set cookie with maxAge of 7 days', async () => {
      const res = mockRes();
      authService.register.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1' },
      });

      await controller.register(dto, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt',
        expect.objectContaining({
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }),
      );
    });
  });

  // ── login ───────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'test@test.com', password: 'Password1!' };

    it('should call authService.login with dto', async () => {
      const res = mockRes();
      authService.login.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1' },
      });

      await controller.login(dto, res as any);

      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should return accessToken and user', async () => {
      const res = mockRes();
      authService.login.mockResolvedValue({
        accessToken: 'access-tok',
        refreshToken: 'refresh-tok',
        user: { id: 'u1', email: dto.email },
      });

      const result = await controller.login(dto, res as any);

      expect(result).toEqual({
        accessToken: 'access-tok',
        user: { id: 'u1', email: dto.email },
      });
    });

    it('should set cookie with httpOnly: true', async () => {
      const res = mockRes();
      authService.login.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
        user: { id: 'u1' },
      });

      await controller.login(dto, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'rt',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  // ── refresh ─────────────────────────────────────────────────────────────

  describe('refresh', () => {
    it('should read token from req.cookies.refresh_token', async () => {
      const req = mockReq({ refresh_token: 'my-refresh-token' });
      const res = mockRes();
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });

      await controller.refresh(req as any, res as any);

      expect(authService.refreshTokens).toHaveBeenCalledWith('my-refresh-token');
    });

    it('should throw UnauthorizedException when no cookie', async () => {
      const req = mockReq({});
      const res = mockRes();

      await expect(
        controller.refresh(req as any, res as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when cookies undefined', async () => {
      const req = { cookies: undefined };
      const res = mockRes();

      await expect(
        controller.refresh(req as any, res as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate cookie on success', async () => {
      const req = mockReq({ refresh_token: 'old-rt' });
      const res = mockRes();
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });

      await controller.refresh(req as any, res as any);

      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new-rt',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should return only accessToken in response body', async () => {
      const req = mockReq({ refresh_token: 'old-rt' });
      const res = mockRes();
      authService.refreshTokens.mockResolvedValue({
        accessToken: 'new-at',
        refreshToken: 'new-rt',
      });

      const result = await controller.refresh(req as any, res as any);

      expect(result).toEqual({ accessToken: 'new-at' });
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should call authService.logout with userId and refreshToken', async () => {
      const req = mockReq({ refresh_token: 'rt-to-invalidate' });
      const res = mockRes();

      await controller.logout('user-1', req as any, res as any);

      expect(authService.logout).toHaveBeenCalledWith('user-1', 'rt-to-invalidate');
    });

    it('should clear refresh_token cookie', async () => {
      const req = mockReq({ refresh_token: 'rt' });
      const res = mockRes();

      await controller.logout('user-1', req as any, res as any);

      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/auth' });
    });

    it('should return logged out message', async () => {
      const req = mockReq({});
      const res = mockRes();

      const result = await controller.logout('user-1', req as any, res as any);

      expect(result).toEqual({ message: 'Logged out' });
    });
  });

  // ── me ──────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('should return user from @CurrentUser()', async () => {
      const user = { id: 'user-1', email: 'test@test.com', firstName: 'John' };

      const result = await controller.me(user);

      expect(result).toEqual(user);
    });
  });
});
