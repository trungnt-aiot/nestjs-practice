import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { AuthService } from './../auth.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();
    const authHeader: string | undefined = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }
    const token: string = authHeader.split(' ')[1];

    if (await this.authService.isInBlackList(token)) {
      throw new ForbiddenException('This token is in black list');
    }

    try {
      const decode = await this.authService.verifyToken(token);
      request.user = decode;
      request.accessToken = token;
      console.log(request.accessToken);
      return true;
    } catch (err) {
      console.error('Verify token failed:', err);
      throw new ForbiddenException('Invalid token');
    }
  }
}
