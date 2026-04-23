import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { AppConfigModule } from '../appConfig/appConfig.module';
import { HistoryModule } from '../history/history.module';
import { Banner, BannerSchema } from '../../schemas/banner.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    MediaModule,
    AppConfigModule,
    HistoryModule,
  ],
  providers: [BannerService],
  controllers: [BannerController],
  exports: [BannerService],
})
export class BannerModule {}
