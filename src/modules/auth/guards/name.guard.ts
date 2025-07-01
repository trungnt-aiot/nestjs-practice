import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { PayloadAuthDto } from '../dto/auth-payload.dto';

@Injectable()
export class NameAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: AuthenticatedRequest = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    const userInfor: PayloadAuthDto = request.user;
    const username: string = userInfor.username;

    if (!username.includes('Trung')) {
      throw new ForbiddenException(
        "You cannot access this site because you're not Trung",
      );
    }
    return true;
  }
}
