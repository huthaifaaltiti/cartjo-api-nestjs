import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';

import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { User, UserSchema } from 'src/schemas/user.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MulterModule.register(createMulterOptions()),
  ],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
