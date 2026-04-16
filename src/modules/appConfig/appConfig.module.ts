import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfig, AppConfigSchema } from 'src/schemas/appConfig.schema';
import { AppConfigController } from './appConfig.controller';
import { AppConfigService } from './appConfig.service';

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
