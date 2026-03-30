import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;
    guard = new RolesGuard(reflector);
  });

  function createMockContext(membership: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ workspaceMembership: membership }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  }

  it('should return true when no @Roles() metadata is set', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(undefined);
    const ctx = createMockContext({ role: 'VIEWER' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return true when @Roles() is empty array', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue([]);
    const ctx = createMockContext({ role: 'VIEWER' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should return false when workspaceMembership is absent', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    const ctx = createMockContext(undefined);

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should allow OWNER to pass ADMIN check (hierarchy)', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    const ctx = createMockContext({ role: 'OWNER' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow ADMIN to pass MEMBER check', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['MEMBER']);
    const ctx = createMockContext({ role: 'ADMIN' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should reject VIEWER for MEMBER check', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['MEMBER']);
    const ctx = createMockContext({ role: 'VIEWER' });

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should reject MEMBER for ADMIN check', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN']);
    const ctx = createMockContext({ role: 'MEMBER' });

    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('should use minimum required level when multiple roles specified', () => {
    // @Roles('ADMIN', 'OWNER') — min required is ADMIN (level 3)
    // ADMIN (level 3) should pass since 3 >= 3
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(['ADMIN', 'OWNER']);
    const ctx = createMockContext({ role: 'ADMIN' });

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
