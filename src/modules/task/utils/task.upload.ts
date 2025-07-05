import { FileFilterCallback } from 'multer';
import * as multer from 'multer';

export const fileUploadMemoryOptions = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    cb(null, true);
  },
};
