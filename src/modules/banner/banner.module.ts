import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Banner, BannerSchema } from 'src/schemas/banner.schema';

import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banner.name, schema: BannerSchema }]),
    MediaModule,
    JwtModule,
  ],
  providers: [BannerService],
  controllers: [BannerController],
  exports: [BannerService],
})
export class BannerModule {}
