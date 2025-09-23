import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './role/role.decorator';
import { SessionService } from 'src/session/session.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class Guard implements CanActivate {
  constructor(private reflector: Reflector,
              private jwtService: JwtService, 
              private sessionService: SessionService,
              private configService: ConfigService
  ){}
  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    try{
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );


    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('Missing token');
    const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET')
      });
    if(!payload){
      throw new UnauthorizedException('Invalid or expire token');
    }
    const filter: any = { accessToken: token };
    console.log("value of payload is; ", payload);
    const session = await this.sessionService.findSessionByAccessToken(filter);
    if(!session) throw new UnauthorizedException("Session not found");

    // session expiry handling
    const currentTime = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (expiresAt < currentTime) {
      throw new UnauthorizedException('Session expired');
    }
    request.user = payload;

    if (requiredRoles && !requiredRoles.map((role) => role).includes(payload.role)) {
      throw new ForbiddenException('Access denied');
    }
      return true;
    }catch(error){
      throw new UnauthorizedException(error.message || 'Authentication failed')
   }
  }
    private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
