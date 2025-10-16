import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';

import { User, UserSchema } from 'src/schemas/user.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';
import { AuthController } from './authentication.controller';
import { AuthService } from './authentication.service';
import { JwtService } from '../jwt/jwt.service';
import { MediaModule } from '../media/media.module';
import { Modules } from 'src/enums/appModules.enum';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_MAX_EXPIRATION_TIME },
    }),
    MulterModule.register(createMulterOptions(Modules.AUTHENTICATION)),
    MediaModule,
    EmailModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
