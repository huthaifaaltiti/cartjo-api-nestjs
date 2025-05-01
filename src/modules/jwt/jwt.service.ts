import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateToken(
    userId: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    email: string,
    username: string,
    role: string,
    permissions: string[],
    countryCode: string,
    createdBy: string,
  ): string {
    const payload = {
      userId,
      phoneNumber,
      role,
      permissions,
      firstName,
      lastName,
      email,
      username,
      countryCode,
      createdBy,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_MIN_EXPIRATION_TIME,
    });
  }
}
