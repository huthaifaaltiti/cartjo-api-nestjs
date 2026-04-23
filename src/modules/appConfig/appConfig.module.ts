import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigController } from './appConfig.controller';
import { AppConfigService } from './appConfig.service';
import { AppConfig, AppConfigSchema } from '../../schemas/appConfig.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppConfig.name, schema: AppConfigSchema },
    ]),
  ],
  controllers: [AppConfigController],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
