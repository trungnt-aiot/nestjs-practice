import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { UploadInterface } from 'src/common/interfaces/upload-request.interface';

@Injectable()
export class FileVerifyInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<unknown> {
    const req: UploadInterface = context
      .switchToHttp()
      .getRequest<UploadInterface>();
    const file = req.file;

    const start = Date.now();

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedTypes = ['image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB');
    }

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        console.log(
          `[FileVerify] Verified ${file.originalname} in ${elapsed}ms`,
        );
      }),
    );
  }
}
