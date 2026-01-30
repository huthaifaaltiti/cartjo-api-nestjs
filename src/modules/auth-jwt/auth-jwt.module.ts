import { Module } from '@nestjs/common';
import { JwtModule as JwtCoreModule } from '@nestjs/jwt';
import { AuthJwtService } from './auth-jwt.service';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';

@Module({
  imports: [
    JwtCoreModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_MIN_EXPIRATION_TIME },
    }),
    RefreshTokenModule
  ],
  providers: [AuthJwtService],
  exports: [AuthJwtService],
})
export class AuthJwtModule {}
