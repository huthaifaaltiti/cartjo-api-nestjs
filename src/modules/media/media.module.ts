import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MongooseModule } from '@nestjs/mongoose';
import * as fs from 'fs';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { getMessage } from 'src/common/utils/translator';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MulterModule.register({
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(new Error(getMessage('media_noMediaFound', 'en')), false);
        }
        return cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          let uploadPath = './uploads';

          if (file.mimetype.startsWith('image/')) {
            uploadPath = './uploads/image';
          } else if (file.mimetype.startsWith('audio/')) {
            uploadPath = './uploads/audio';
          } else if (file.mimetype.startsWith('video/')) {
            uploadPath = './uploads/video';
          } else if (file.mimetype.startsWith('application/')) {
            uploadPath = './uploads/doc';
          } else {
            uploadPath = './uploads/others';
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
            const filename = `${Date.now()}-${file.originalname}`;
            cb(null, filename);
          } catch (error) {
            cb(new Error(getMessage('media_mediaUploadFailed', 'en')), null);
          }
        },
      }),
    }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
})
export class MediaModule {}
