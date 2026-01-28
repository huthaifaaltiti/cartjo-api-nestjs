import { Module } from '@nestjs/common';
import { JwtModule as JwtCoreModule } from '@nestjs/jwt';
import { AuthJwtService } from './auth-jwt.service';

@Module({
  imports: [
    JwtCoreModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_MIN_EXPIRATION_TIME },
    }),
  ],
  providers: [AuthJwtService],
  exports: [AuthJwtService],
})
export class AuthJwtModule {}
