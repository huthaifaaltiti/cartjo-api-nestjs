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
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../schemas/refresh-token.schema';
import { AuthorizationModule } from '../authorization/authorization.module';
import { RolePermissionModule } from '../role-permission/role-permission.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_MAX_EXPIRATION_TIME },
    }),
    MulterModule.register(createMulterOptions(Modules.AUTHENTICATION)),
    MediaModule,
    EmailModule,
    AuthorizationModule,
    RolePermissionModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthJwtService],
})
export class AuthModule {}
