import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AccessLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const date = new Date().toISOString().split('T')[0];
    const dirPath = path.join(__dirname, '../../logs', date);
    const filePath = path.join(dirPath, 'access.log');
    const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}\n`;

    fs.mkdirSync(dirPath, { recursive: true });
    fs.appendFile(filePath, log, (err) => {
      if (err) console.error('Access log error:', err);
    });

    next();
  }
}
