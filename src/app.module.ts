import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/authentication/authentication.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
// import { LocationModule } from './modules/locations/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    AuthModule,
    JwtModule,
    AuthorizationModule,
    // LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
