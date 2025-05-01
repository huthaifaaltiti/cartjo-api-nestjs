import { Module } from '@nestjs/common';
import { JwtModule as JwtCoreModule } from '@nestjs/jwt';

import { JwtService } from './jwt.service';

@Module({
  imports: [
    JwtCoreModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_MIN_EXPIRATION_TIME },
    }),
  ],
  providers: [JwtService],
  exports: [JwtService],
})
export class JwtModule {}
