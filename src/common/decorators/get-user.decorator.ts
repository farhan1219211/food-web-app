import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (
    data: 'sub' | 'email' | 'role' | 'token' | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data === 'token') {
      const authHeader = request.headers['authorization'];
      if (!authHeader) {
        throw new UnauthorizedException('Authorization header missing');
      }

      const [, token] = authHeader.split(' ');
      if (!token) {
        throw new UnauthorizedException('Access token missing');
      }
      return token;
    }

    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
