import { diskStorage } from 'multer';
import * as fs from 'fs';
import { getMessage } from './translator';

export function createMulterOptions(key: string) {
  return {
<<<<<<< HEAD
    fileFilter: (req, file, cb) => {
=======
    fileFilter: (_req, file, cb) => {
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
      if (!file) {
        return cb(new Error(getMessage('media_noMediaFound', 'en')), false);
      }
      return cb(null, true);
    },
    storage: diskStorage({
<<<<<<< HEAD
      destination: (req, file, cb) => {
=======
      destination: (_req, file, cb) => {
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
<<<<<<< HEAD
      filename: (req, file, cb) => {
=======
      filename: (_req, file, cb) => {
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
