import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import {
  CreatorsVideo,
  CreatorsVideoSchema,
} from '../../schemas/creatorsVideo.schema';
import { MediaModule } from '../media/media.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreatorsVideo.name, schema: CreatorsVideoSchema },
    ]),
    MediaModule,
    HistoryModule,
  ],
  controllers: [CreatorsController],
  providers: [CreatorsService],
  exports: [CreatorsService],
})
export class CreatorsModule {}
