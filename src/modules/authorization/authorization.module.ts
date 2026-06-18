import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { User, UserSchema } from '../../schemas/user.schema';
import { JwtStrategy } from './jwt.strategy';
import { AuthJwtModule } from '../auth-jwt/auth-jwt.module';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../schemas/refresh-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_MIN_EXPIRATION_TIME },
    }),
    PassportModule,
    JwtModule,
    AuthJwtModule,
  ],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, JwtStrategy],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
