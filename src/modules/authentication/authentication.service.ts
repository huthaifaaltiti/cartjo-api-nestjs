import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { getMessage } from 'src/common/utils/translator';
import { generateUsername } from 'src/common/utils/generators';
import { RolePermissions } from 'src/common/constants/roles-permissions.constant';
import { UserRole } from 'src/enums/user-role.enum';
import { User, UserDocument } from 'src/schemas/user.schema';
import {
  ForgotPasswordBodyDto,
  RegisterDto,
  ResendVerificationEmailDto,
  ResetPasswordBodyDto,
  VerifyEmailQueryDto,
  VerifyResetPasswordCodeBodyDto,
} from './dto/register.dto';
import { Modules } from 'src/enums/appModules.enum';
import { MediaService } from '../media/media.service';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { EmailTemplates } from 'src/enums/emailTemplates.enum';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
import { BaseResponse } from 'src/types/service-response.type';
import { getAppUrl } from 'src/common/utils/getAppUrl';
import commonEmailTemplateData from 'src/common/utils/commonEmailTemplateData';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { MediaPreview } from 'src/schemas/common.schema';
import { OAuth2Client } from 'google-auth-library';
import { Response } from 'express';
import { AuthJwtService } from '../auth-jwt/auth-jwt.service';
import { buildGoogleOAuthConfig } from 'src/configs/google-oauth.config';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authJwtService: AuthJwtService,
    private mediaService: MediaService,
    private emailService: EmailService,
  ) {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const redirectUri = buildGoogleOAuthConfig(process.env)?.redirectUri;

    if (!clientId || !clientSecret) {
      console.error(
        '❌ CRITICAL: Google OAuth Client ID or Secret is missing from .env',
      );
    }

    this.googleClient = new OAuth2Client(clientId, clientSecret, redirectUri);
  }

  async register(
    req: any,
    dto: RegisterDto,
    profilePic: Express.Multer.File,
  ): Promise<{ isSuccess: boolean; msg: string; user: User; token: string }> {
    const {
      termsAccepted,
      lang,
      email,
      firstName,
      lastName,
      marketingEmails,
      password,
      phoneNumber,
      countryCode,
      preferredLang,
    } = dto;

    let newProfilePic: MediaPreview | undefined;

    if (profilePic && Object.keys(profilePic).length > 0) {
      const uploadedProfilePic = await this.mediaService.mediaProcessor({
        file: profilePic,
        reqMsg: 'user_shouldHasProfilePic',
        user: req?.user,
        maxSize: MEDIA_CONFIG.USER.PROFILE_IMAGE.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.USER.PROFILE_IMAGE.ALLOWED_TYPES,
        lang,
        key: Modules.USER,
        req,
      });

      if (uploadedProfilePic) {
        newProfilePic = uploadedProfilePic;
      }
    }

    if (!termsAccepted) {
      throw new BadRequestException(
        getMessage('authentication_termsAndConditionsRequired', lang),
        {
          cause: new Error(),
          description: 'Validation error',
        },
      );
    }

    const existingUserWithEmail = await this.userModel.findOne({ email });
    const existingUserWithPhoneNumber = await this.userModel.findOne({
      phoneNumber,
    });
    if (existingUserWithEmail) {
      throw new BadRequestException(
        getMessage('authentication_emailAlreadyInUse', lang),
        {
          cause: new Error(),
          description: 'Validation error',
        },
      );
    }

    if (existingUserWithPhoneNumber) {
      throw new BadRequestException(
        getMessage('authentication_phoneNumberAlreadyInUse', lang),
        {
          cause: new Error(),
          description: 'Validation error',
        },
      );
    }

    try {
      const defaultRole = UserRole.USER;
      const permissions = RolePermissions[defaultRole];

      const username =
        (await generateUsername(firstName, lastName, this.userModel)) ||
        `${firstName}.${lastName}_${Date.now()}`;

      const newUserData = {
        firstName,
        lastName,
        email,
        termsAccepted: Boolean(termsAccepted),
        marketingEmails: Boolean(marketingEmails),
        username,
        password,
        countryCode,
        phoneNumber,
        createdBy: process.env.DB_SYSTEM_OBJ_ID,
        role: defaultRole,
        permissions,
        profilePic: newProfilePic,
        preferredLang,
      };

      const emailVerificationToken = randomBytes(32).toString('hex');
      const emailVerificationTokenExpires = new Date(
        Date.now() +
          Number(process.env.EMAIL_VERIFICATION_EXPIRY_TIME || 48) *
            60 *
            60 *
            1000,
      );

      const user = await this.userModel.create({
        ...newUserData,
        emailVerificationToken,
        emailVerificationTokenExpires,
      });

      if (user.email) {
        this.emailService.sendTemplateEmail({
          to: user.email,
          templateName: EmailTemplates.USER_REGISTRATION_CONFIRMATION,
          templateData: {
            firstName: user.firstName,
            confirmationUrl: `${getAppUrl()}/verify-email?token=${emailVerificationToken}`,
            ...commonEmailTemplateData(),
          },
          prefLang: user?.preferredLang || PreferredLanguage.ARABIC,
        });
      }

      const token = this.authJwtService.generateAccessToken(user, false);

      return {
        isSuccess: true,
        msg: getMessage('users_userCreatedSuccessfully', lang),
        user,
        token,
      };
    } catch (err) {
      console.log({ err });
      if (err instanceof MongoError && err.code === 11000) {
        throw new BadRequestException(
          getMessage('users_userAlreadyExists', lang),
        );
      }

      throw new InternalServerErrorException(
        getMessage('users_errWhileCreatingUser', lang),
      );
    }
  }

  async verifyEmail(query: VerifyEmailQueryDto): Promise<BaseResponse> {
    const { token, lang } = query;

    if (!token) {
      throw new BadRequestException(getMessage('authentication_noToken', lang));
    }

    const user = await this.userModel.findOne({
      emailVerificationToken: token,
    });

    if (
      !user ||
      !user.emailVerificationTokenExpires ||
      user.emailVerificationTokenExpires < new Date()
    ) {
      throw new BadRequestException(
        getMessage('authentication_invalidOrExpiredToken', lang),
      );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;

    await user.save();

    return {
      isSuccess: true,
      message: getMessage('authentication_emailVerifiedSuccessfully', lang),
    };
  }

  async resendVerificationEmail(
    dto: ResendVerificationEmailDto,
  ): Promise<BaseResponse> {
    const { email, lang } = dto;

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException(
        getMessage('authentication_userNotFound', lang),
      );
    }

    if (user.isEmailVerified) {
      return {
        isSuccess: true,
        message: getMessage('authentication_emailAlreadyVerified', lang),
      };
    }

    const emailVerificationToken = randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date(
      Date.now() +
        Number(process.env.EMAIL_VERIFICATION_EXPIRY_TIME || 48) *
          60 *
          60 *
          1000,
    );

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;

    await user.save();

    this.emailService.sendTemplateEmail({
      to: user.email,
      templateName: EmailTemplates.RESEND_VERIFICATION_EMAIL,
      templateData: {
        firstName: user.firstName,
        confirmationUrl: `${getAppUrl()}/verify-email?token=${emailVerificationToken}`,
        ...commonEmailTemplateData(),
      },
      prefLang: user?.preferredLang || PreferredLanguage.ARABIC,
    });

    return {
      isSuccess: true,
      message: getMessage('authentication_verificationEmailSent', lang),
    };
  }

  async forgotPassword(dto: ForgotPasswordBodyDto): Promise<BaseResponse> {
    const { identifier, lang } = dto;

    const user = await this.userModel.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier },
        { username: identifier },
      ],
    });

    if (!user) {
      throw new BadRequestException(
        getMessage('authentication_userNotFound', lang),
      );
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();

    user.resetCode = resetCode;
    const passwordResetCodeExpiringTime = new Date(
      Date.now() +
        Number(process.env.PASSWORD_RESET_CODE_EXPIRY_TIME || 15) * 60 * 1000,
    ); // 15 min
    user.resetCodeExpires = passwordResetCodeExpiringTime;

    await user.save();

    if (user.email) {
      this.emailService.sendTemplateEmail({
        to: user.email,
        templateName: EmailTemplates.RESET_PASSWORD_CODE,
        templateData: {
          firstName: user.firstName,
          resetCode,
          ...commonEmailTemplateData(),
        },
        prefLang: user?.preferredLang || PreferredLanguage.ARABIC,
      });
    }

    return {
      isSuccess: true,
      message: getMessage('authentication_resetPasswordCodeSent', lang),
    };
  }

  async verifyResetPasswordCode(
    dto: VerifyResetPasswordCodeBodyDto,
  ): Promise<BaseResponse> {
    const { identifier, code, lang } = dto;

    if (!code) {
      throw new BadRequestException(
        getMessage('authentication_notValidCode', lang),
      );
    }

    const user = await this.userModel.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier },
        { username: identifier },
      ],
      resetCode: code,
    });

    if (!user) {
      throw new BadRequestException(
        getMessage('authentication_notValidCode', lang),
      );
    }

    if (user.resetCodeExpires < new Date()) {
      throw new BadRequestException(
        getMessage('authentication_expiredRestPasswordCode', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage('authentication_verifiedRestPasswordCode', lang),
    };
  }

  async resetPassword(dto: ResetPasswordBodyDto): Promise<BaseResponse> {
    const { identifier, code, newPassword, lang } = dto;

    if (!code) {
      throw new BadRequestException(
        getMessage('authentication_notValidCode', lang),
      );
    }

    if (!newPassword) {
      throw new BadRequestException(
        getMessage('authentication_invalidResetPassword', lang),
      );
    }

    const user = await this.userModel.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier },
        { username: identifier },
      ],
      resetCode: code,
    });

    if (!user) {
      throw new BadRequestException(
        getMessage('authentication_notValidCode', lang),
      );
    }

    if (user.resetCodeExpires < new Date()) {
      throw new BadRequestException(
        getMessage('authentication_expiredRestPasswordCode', lang),
      );
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException(
        getMessage('authentication_newPasswordSameAsOld', lang),
      );
    }

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;

    await user.save();

    if (user.email) {
      this.emailService.sendTemplateEmail({
        to: user.email,
        templateName: EmailTemplates.PASSWORD_RESET_SUCCESS,
        templateData: {
          firstName: user.firstName,
          loginUrl: `${getAppUrl()}/auth`,
          ...commonEmailTemplateData(),
        },
        prefLang: user?.preferredLang || PreferredLanguage.ARABIC,
      });
    }

    return {
      isSuccess: true,
      message: getMessage('authentication_passwordResetSuccessfully', lang),
    };
  }

  async googleLogin(res: Response) {
    const url = this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
      redirect_uri: buildGoogleOAuthConfig(process.env)?.redirectUri,
    });

    return res.redirect(url);
  }

  async handleGoogleCallback(req: any, res: Response) {
    const { code } = req.query;
    const clientUrl = getAppUrl();

    // 1. Validate Code
    if (!code) {
      return res.redirect(
        `${clientUrl}/auth/callback?authError=GOOGLE_NO_CODE`,
      );
    }

    try {
      // 2. Exchange code for tokens
      const { tokens } = await this.googleClient.getToken(code as string);
      this.googleClient.setCredentials(tokens);

      // 3. Verify the Google ID Token
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: buildGoogleOAuthConfig(process.env).clientId,
      });

      const payload = ticket.getPayload();
      if (!payload?.email) {
        return res.redirect(
          `${clientUrl}/auth/callback?authError=GOOGLE_EMAIL_MISSING`,
        );
      }

      const { email, given_name, family_name, picture, locale } = payload;

      // 4. Find or Create User
      let user = await this.userModel.findOne({ email });

      if (!user) {
        const username = await generateUsername(
          given_name,
          family_name,
          this.userModel,
        );

        user = await this.userModel.create({
          email,
          firstName: given_name,
          lastName: family_name || '',
          username: username || `${given_name}_${Date.now()}`,
          role: UserRole.USER,
          permissions: RolePermissions[UserRole.USER],
          isEmailVerified: true,
          preferredLang: locale?.startsWith('ar')
            ? PreferredLanguage.ARABIC
            : PreferredLanguage.ENGLISH,
          termsAccepted: true,
          marketingEmails: false,
          authProvider: 'google',
          createdBy: process.env.DB_SYSTEM_OBJ_ID,
          profilePic: picture ? { url: picture } : undefined,
        });
      }

      // 5. Generate JWT
      const token = this.authJwtService.generateAccessToken(user, false);

      // 6. Final Redirect to Frontend with Token
      return res.redirect(
        `${clientUrl}/auth/callback?authToken=${token}&provider=google`,
      );
    } catch (error) {
      console.error('Google Auth Error:', error);
      return res.redirect(
        `${clientUrl}/auth/callback?authError=GOOGLE_AUTH_FAILED`,
      );
    }
  }
}
