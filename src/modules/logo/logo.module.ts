import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaModule } from '../media/media.module';
import { LogoService } from './logo.service';
import { LogoController } from './logo.controller';
import { HistoryModule } from '../history/history.module';
import { AppConfigModule } from '../appConfig/appConfig.module';
import { Logo, LogoSchema } from '../../schemas/logo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Logo.name, schema: LogoSchema }]),
    MediaModule,
    HistoryModule,
    AppConfigModule,
  ],
  providers: [LogoService],
  controllers: [LogoController],
  exports: [LogoService],
})
export class LogoModule {}
