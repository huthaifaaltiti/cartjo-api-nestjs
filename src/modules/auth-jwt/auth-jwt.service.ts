import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class AuthJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  signAccessToken(user: any, rememberMe = false): string {
    const payload = {
      sub: user._id.toString(),
      role: user.role,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: rememberMe
        ? (process.env.JWT_MAX_EXPIRATION_TIME ?? '1d')
        : (process.env.JWT_MIN_EXPIRATION_TIME ?? '15m'),
    });
  }

  signRefreshToken(user: any): string {
    return this.jwtService.sign(
      {
        sub: user._id.toString(),
      },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME ?? '7d',
      },
    );
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
