import { Module } from '@nestjs/common';

import { LocationService } from './location.service';
import { LocationController } from './location.controller';

import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';

import { getMessage } from 'src/common/utils/translator';
import { MediaModule } from '../media/media.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationSchema, Location } from 'src/schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
    MediaModule,
    MulterModule.register({
      fileFilter: (req, file, cb) => {
        if (!file) {
          return cb(new Error(getMessage('media_noMediaFound', 'en')), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (req, file, cb) => {
          let uploadPath = './uploads/doc/sheet';

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
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
