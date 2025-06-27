import { diskStorage } from 'multer';
import * as fs from 'fs';
import { getMessage } from './translator';

export function createMulterOptions(key: string) {
  return {
    fileFilter: (req, file, cb) => {
      if (!file) {
        return cb(new Error(getMessage('media_noMediaFound', 'en')), false);
      }
      return cb(null, true);
    },
    storage: diskStorage({
      destination: (req, file, cb) => {
        let uploadPath = `./uploads/${key}`;

        if (file.mimetype.startsWith('image/')) {
          uploadPath = `./uploads/${key}/image`;
        } else if (file.mimetype.startsWith('audio/')) {
          uploadPath = `./uploads/${key}/audio`;
        } else if (file.mimetype.startsWith('video/')) {
          uploadPath = `./uploads/${key}/video`;
        } else if (
          file?.mimetype?.startsWith('application/') &&
          file?.mimetype?.includes('excel')
        ) {
          uploadPath = `./uploads/${key}/doc/sheet`;
        } else if (file.mimetype.startsWith('application/')) {
          uploadPath = `./uploads/${key}/doc`;
        } else {
          uploadPath = `./uploads/${key}/others`;
        }

        try {
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        } catch (error) {
          cb(new Error(getMessage('media_mediaUploadFailed', 'en')), null);
        }
      },
      filename: (req, file, cb) => {
        try {
          const filename = `${key}-${Date.now()}-${file.originalname.trim()}`;
          cb(null, filename);
        } catch (error) {
          cb(new Error(getMessage('media_mediaUploadFailed', 'en')), null);
        }
      },
    }),
  };
}
