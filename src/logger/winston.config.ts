import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = 'logs';

const getVNTime = () =>
  new Date().toLocaleString('vi-VN', {
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  });

export const winstonConfig: winston.LoggerOptions = {
  transports: [
    new DailyRotateFile({
      dirname: `${logDir}/%DATE%`,
      filename: 'app.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: getVNTime }),
        winston.format.json(),
      ),
    }),
    new DailyRotateFile({
      dirname: `${logDir}/%DATE%`,
      filename: 'error.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp({ format: getVNTime }),
        winston.format.json(),
      ),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: getVNTime }),
        nestWinstonModuleUtilities.format.nestLike('App', {
          prettyPrint: true,
        }),
      ),
    }),
  ],
};
