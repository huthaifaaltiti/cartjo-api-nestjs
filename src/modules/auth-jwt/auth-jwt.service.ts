import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RefreshTokenRepository } from '../refresh-token/refresh-token.repository';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthJwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  // ACCESS TOKEN (JWT)
  generateAccessToken(user: any, rememberMe = false): string {
    console.log({user})
    const expiresIn = rememberMe
      ? (process.env.JWT_MAX_EXPIRATION_TIME ?? '1m')
      : (process.env.JWT_MIN_EXPIRATION_TIME ?? '1m');

    return this.jwtService.sign(
      {
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
      },
      {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn,
      },
    );
  }

  // REFRESH TOKEN (RANDOM)
  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // LOGIN / ISSUE TOKENS
  async issueTokens(user: any, rememberMe = false) {
    const accessToken = this.generateAccessToken(user, rememberMe);
    const refreshToken = this.generateRefreshToken();

    const refreshTokenExpirationDays = Number(
      process.env.REFRESH_TOKEN_EXPIRATION_TIME?.replace('d', '') ?? 7,
    );

    await this.refreshTokenRepo.create({
      userId: user._id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTokenExpirationDays * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME) * 60,
    };
  }

  // REFRESH (ROTATION)
  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const tokenHash = this.hashToken(refreshToken);
    const storedToken = await this.refreshTokenRepo.findValid(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = storedToken.userId as User;

    // ROTATE TOKEN
    await this.refreshTokenRepo.delete(storedToken._id.toString());

    const newRefreshToken = this.generateRefreshToken();
     const refreshTokenExpirationDays = Number(
      process.env.REFRESH_TOKEN_EXPIRATION_TIME?.replace('d', '') ?? 7,
    );
    await this.refreshTokenRepo.create({
      userId: user._id,
      tokenHash: this.hashToken(newRefreshToken),
      // expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7d
      expiresAt: new Date(Date.now() + refreshTokenExpirationDays * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: newRefreshToken,
      expiresIn:
        Number(process.env.ACCESS_TOKEN_EXPIRATION_TIME) * 60 * 60 || 900, // seconds
    };
  }

  // LOGOUT
  async revoke(refreshToken: string) {
    await this.refreshTokenRepo.deleteByHash(this.hashToken(refreshToken));
  }
}
