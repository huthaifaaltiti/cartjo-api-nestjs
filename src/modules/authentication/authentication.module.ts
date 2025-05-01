import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './authentication.controller';
import { AuthService } from './authentication.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { JwtService } from '../jwt/jwt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_MAX_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
})
export class AuthModule {}
