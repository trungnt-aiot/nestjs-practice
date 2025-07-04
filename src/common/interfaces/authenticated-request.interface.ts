import { Request } from 'express';
import { PayloadAuthDto } from 'src/modules/auth/dto/auth-payload.dto';

export interface AuthenticatedRequest extends Request {
  user: PayloadAuthDto;
  accessToken: string;
}
