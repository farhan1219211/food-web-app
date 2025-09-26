import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: 'id' | 'email' | 'role' | 'token' | undefined, ctx: ExecutionContext) => {
        try {
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

            if (!user) {
                throw new UnauthorizedException('User not found in request');
            }

            return data ? user[data] : user;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    },
);
