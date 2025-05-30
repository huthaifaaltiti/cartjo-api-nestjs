import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/authentication/authentication.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { MediaModule } from './modules/media/media.module';
import { LocationModule } from './modules/location/location.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', './uploads'),
      serveRoot: '/uploads',
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    JwtModule,
    AuthorizationModule,
    MediaModule,
    LocationModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
