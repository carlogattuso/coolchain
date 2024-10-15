import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { ErrorCodes } from '../utils/errors';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authSecret: string;

  constructor(
    private readonly _configService: ConfigService,
    private readonly _jwtService: JwtService,
  ) {
    this.authSecret = this._configService.get<string>('AUTH_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      request['auditor'] = await this._jwtService.verifyAsync(token, {
        secret: this.authSecret,
      });
    } catch {
      throw new UnauthorizedException(ErrorCodes.UNAUTHORIZED.message);
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
