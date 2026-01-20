import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationSchema, Location } from 'src/schemas/location.schema';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { MediaModule } from '../media/media.module';

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
