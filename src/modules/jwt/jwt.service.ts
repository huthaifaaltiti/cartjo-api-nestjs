import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: NestJwtService) {}

  generateToken(userId: string, phoneNumber: string, role: string): string {
    const payload = { userId, phoneNumber, role };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: process.env.JWT_MIN_EXPIRATION_TIME,
    });
  }
}
