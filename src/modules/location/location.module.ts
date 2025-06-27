import { Module } from '@nestjs/common';

import { LocationService } from './location.service';
import { LocationController } from './location.controller';

import { MulterModule } from '@nestjs/platform-express';

import { MediaModule } from '../media/media.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationSchema, Location } from 'src/schemas/location.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';
import { Modules } from 'src/enums/appModules.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
    MulterModule.register(createMulterOptions(Modules.LOCATION)),
    MediaModule,
  ],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
