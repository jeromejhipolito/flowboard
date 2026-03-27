import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Sets the required roles for a route.
 * Used in conjunction with a RolesGuard.
 *
 * Usage:
 *   @Roles('ADMIN', 'OWNER')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
