import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { MediaModule } from '../media/media.module';
import { Location, LocationSchema } from '../../schemas/location.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema },
    ]),
    MediaModule,
  ],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
