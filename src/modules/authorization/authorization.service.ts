import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../../schemas/refresh-token.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { AuthJwtService } from '../auth-jwt/auth-jwt.service';
import {
  isPhoneNumberLike,
  normalizePhoneNumber,
} from '../../common/utils/normalizePhoneNumber';
import { COUNTRY_CONFIGS } from '../../configs/countryPhone.config';
import { validateUserActiveStatus } from '../../common/utils/validateUserActiveStatus';
import { getMessage } from '../../common/utils/translator';
import { AuthResponseDto } from '../../types/auth-response.type';
import { Locale } from '../../enums/locale.enum';
import { LogoutDto } from './dto/logout.dto';
import { BaseResponse } from '../../types/service-response.type';

const maxLoginAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS) ?? 5;
const lockDurationMinutes = Number(process.env.LOCK_DURATION_MINUTES) ?? 15;

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,

    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,

    private authJwtService: AuthJwtService,
  ) {}

  private async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { userId, revoked: false },
      { revoked: true, revokedAt: new Date() },
    );
  }

  private async handleFailedAttempt(user: UserDocument): Promise<void> {
    const attempts = (user.loginAttempts ?? 0) + 1;
    const update: Partial<User> = { loginAttempts: attempts };

    if (attempts >= maxLoginAttempts) {
      update.lockUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
      update.loginAttempts = 0;
    }

    await this.userModel.findByIdAndUpdate(user._id, update);
  }

  async createRefreshToken(
    user: UserDocument,
    meta?: { ipAddress?: string; userAgent?: string },
  ) {
    const raw = this.authJwtService.signRefreshToken(user);

    const tokenHash = this.authJwtService.hashToken(raw);

    const refreshExp = process.env.JWT_REFRESH_EXPIRATION_TIME ?? '7d';
    const ms = require('ms'); // Convert to milliseconds for the Date object
    // const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const expiresAt = new Date(Date.now() + ms(refreshExp));

    const entity = await this.refreshTokenModel.create({
      tokenHash,
      userId: user._id,
      expiresAt,
      ipAddress: meta?.ipAddress,
      userAgent: meta?.userAgent,
    });

    return { raw, entity };
  }

  private async generateAuthResponse(
    user: UserDocument,
    rememberMe = false,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const accessToken = this.authJwtService.signAccessToken(user, rememberMe);
    const { raw: refreshToken } = await this.createRefreshToken(user, meta);

    return {
      accessToken,
      refreshToken,
      user: {
        id: (user._id as object).toString(),
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
      },
    };
  }

  async login(
    body: LoginDto,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const { identifier, password, rememberMe, lang } = body;

    const normalizedIdentifier = isPhoneNumberLike(
      identifier,
      COUNTRY_CONFIGS.JO,
    )
      ? normalizePhoneNumber(identifier, COUNTRY_CONFIGS.JO)
      : identifier;

    const user = await this.userModel.findOne({
      $or: [
        { email: normalizedIdentifier },
        { phoneNumber: normalizedIdentifier },
        { username: normalizedIdentifier },
      ],
    });

    // ✅ Null check BEFORE validateUserActiveStatus — it expects a non-null user
    if (!user) {
      await bcrypt.hash(password, 12); // timing-safe: prevent user enumeration
      throw new UnauthorizedException({
        statusCode: 401,
        isSuccess: false,
        message: getMessage('authorization_InvalidCredentials', lang),
      });
    }

    // ✅ Now safe to call — user is guaranteed non-null here
    validateUserActiveStatus(user, lang);

    // Check account lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remaining = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 1000 / 60,
      );

      throw new ForbiddenException({
        statusCode: 403,
        isSuccess: false,
        message: getMessage('authorization_accountLocked', lang).replace(
          '{remaining}',
          String(remaining),
        ),
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedAttempt(user);
      throw new UnauthorizedException({
        statusCode: 401,
        isSuccess: false,
        message: getMessage('authorization_InvalidCredentials', lang),
      });
    }

    // Success — reset lock state, persist rememberMe + lastLogin
    await this.userModel.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lockUntil: null,
      rememberMe,
      lastLogin: new Date(),
    });

    return this.generateAuthResponse(user, rememberMe, meta);
  }

  async refreshToken(
    refreshToken: string,
    meta?: { ipAddress?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    let payload: any;

    try {
      payload = this.authJwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException(
        getMessage('authentication_invalidOrExpiredRefreshToken', Locale.EN),
      );
    }

    const tokenHash = this.authJwtService.hashToken(refreshToken);

    const storedToken = await this.refreshTokenModel.findOne({
      tokenHash,
      userId: payload.sub,
    });

    if (!storedToken) {
      throw new UnauthorizedException(
        getMessage('authentication_invalidRefreshToken', Locale.EN),
      );
    }

    // Token reuse detected — revoke everything for this user
    if (storedToken.revoked) {
      await this.revokeAllUserTokens(payload.sub);

      throw new UnauthorizedException(
        getMessage('authentication_reusedRefreshToken', Locale.EN),
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(
        getMessage('authentication_expiredRefreshToken', Locale.EN),
      );
    }

    // Rotate: mark old token as revoked
    storedToken.revoked = true;
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await this.userModel.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        getMessage('authentication_noUserExists', Locale.EN),
      );
    }

    return this.generateAuthResponse(user, user.rememberMe, meta);
  }

  // LOGOUT — revoke single refresh token
  async logout(body: LogoutDto): Promise<BaseResponse> {
    const tokenHash = this.authJwtService.hashToken(body.refreshToken);

    await this.refreshTokenModel.findOneAndUpdate(
      { tokenHash },
      { revoked: true, revokedAt: new Date() },
    );

    return {
      isSuccess: true,
      message: getMessage('authorization_logout', body.lang ?? 'en'),
    };
  }

  // LOGOUT ALL — revoke all sessions for a user
  async logoutAll(userId: string): Promise<{ isSuccess: Boolean }> {
    await this.revokeAllUserTokens(userId);

    return {
      isSuccess: true,
    };
  }
}
