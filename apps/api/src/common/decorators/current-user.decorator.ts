import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the current authenticated user (or a specific property)
 * from the request object.
 *
 * Usage:
 *   @CurrentUser() user: User
 *   @CurrentUser('id') userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
