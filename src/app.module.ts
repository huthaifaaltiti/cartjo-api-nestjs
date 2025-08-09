import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/authentication/authentication.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { MediaModule } from './modules/media/media.module';
import { LocationModule } from './modules/location/location.module';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { SubCategoryModule } from './modules/subCategory/subCategory.module';
import { ProductModule } from './modules/product/product.module';
import { LogoModule } from './modules/logo/logo.module';
import { BannerModule } from './modules/banner/banner.module';
import { ShowcaseModule } from './modules/showcase/showcase.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', './uploads'),
      serveRoot: '/uploads',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    JwtModule,
    AuthorizationModule,
    MediaModule,
    LocationModule,
    UserModule,
    CategoryModule,
    SubCategoryModule,
    ProductModule,
    LogoModule,
    BannerModule,
    ShowcaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
