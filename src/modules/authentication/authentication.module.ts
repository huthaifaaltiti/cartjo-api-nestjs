import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { AuthController } from './authentication.controller';
import { AuthService } from './authentication.service';
import { MediaModule } from '../media/media.module';
import { EmailModule } from '../email/email.module';
import { AuthJwtService } from '../auth-jwt/auth-jwt.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { createMulterOptions } from '../../common/utils/multerConfig';
import { Modules } from '../../enums/appModules.enum';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_MAX_EXPIRATION_TIME },
    }),
    MulterModule.register(createMulterOptions(Modules.AUTHENTICATION)),
    MediaModule,
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtService],
})
export class AuthModule {}
