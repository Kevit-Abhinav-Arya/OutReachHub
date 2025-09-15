import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

const ALLOWED_IMAGE_TYPES = /jpeg|jpg|png|gif|webp/;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join(process.cwd(), 'uploads', 'message-templates');
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Check file type
    const isValidType = ALLOWED_IMAGE_TYPES.test(
      extname(file.originalname).toLowerCase(),
    );
    const isValidMimeType = ALLOWED_IMAGE_TYPES.test(file.mimetype);

    if (isValidType && isValidMimeType) {
      cb(null, true);
    } else {
      cb(
        new BadRequestException(
          'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
        ),
        false,
      );
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, 
  },
};

export const imageFileFilter = (req, file, callback) => {
  const isValidType = ALLOWED_IMAGE_TYPES.test(
    extname(file.originalname).toLowerCase(),
  );
  const isValidMimeType = ALLOWED_IMAGE_TYPES.test(file.mimetype);

  if (isValidType && isValidMimeType) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
      ),
      false,
    );
  }
};