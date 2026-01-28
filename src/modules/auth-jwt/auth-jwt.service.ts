import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class AuthJwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateToken(user: any, rememberMe: boolean = false): string {
    const payload = {
      userId: user._id.toString(),
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      canManage: user.canManage,
      countryCode: user.countryCode || '',
      createdBy: user.createdBy?.toString(),
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: rememberMe
        ? process.env.JWT_MAX_EXPIRATION_TIME
        : process.env.JWT_MIN_EXPIRATION_TIME,
    });
  }
}
