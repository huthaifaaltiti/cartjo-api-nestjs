import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';
import { getMessage } from 'src/common/utils/translator';
import { generateUsername } from 'src/common/utils/generators';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
import { RolePermissions } from 'src/common/constants/roles-permissions.constant';
import { UserRole } from 'src/enums/user-role.enum';
import { User, UserDocument } from 'src/schemas/user.schema';
import {
  RegisterDto,
  ResendVerificationEmailDto,
  VerifyEmailQueryDto,
} from './dto/register.dto';
import { Modules } from 'src/enums/appModules.enum';
import { JwtService } from '../jwt/jwt.service';
import { MediaService } from '../media/media.service';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';
import { EmailTemplates } from 'src/enums/emailTemplates.enum';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mediaService: MediaService,
    private emailService: EmailService,
  ) {}

  async register(
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

    let profilePicUrl: string | undefined = undefined;

    if (profilePic && Object.keys(profilePic).length > 0) {
      fileSizeValidator(profilePic, MAX_FILE_SIZES.USER_PROFILE_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        profilePic,
        { userId: process.env.DB_SYSTEM_OBJ_ID }, // fake user since user is not registered yet
        lang,
        Modules.AUTHENTICATION,
      );

      if (result?.isSuccess) {
        profilePicUrl = result.fileUrl;
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
        profilePic: profilePicUrl,
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
        await this.emailService.sendTemplateEmail({
          to: user.email,
          templateName: EmailTemplates.USER_REGISTRATION_CONFIRMATION,
          templateData: {
            firstName: user.firstName,
            confirmationUrl: `http://localhost:3002/verify-email?token=${emailVerificationToken}`,
          },
          prefLang: user?.preferredLang || PreferredLanguage.ARABIC,
        });
      }

      const token = this.jwtService.generateToken(
        user?._id?.toString(),
        user.firstName,
        user.lastName,
        user.phoneNumber,
        user.email,
        user.username,
        user.role,
        user.permissions,
        user.countryCode,
        user.createdBy.toString(),
      );

      return {
        isSuccess: true,
        msg: getMessage('users_userCreatedSuccessfully', lang),
        user,
        token,
      };
    } catch (err) {
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

  async verifyEmail(
    query: VerifyEmailQueryDto,
  ): Promise<{ isSuccess: boolean; message: string }> {
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
  ): Promise<{ isSuccess: boolean; message: string }> {
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

    await this.emailService.sendTemplateEmail({
      to: user.email,
      templateName: EmailTemplates.RESEND_VERIFICATION_EMAIL,
      templateData: {
        firstName: user.firstName,
        confirmationUrl: `http://localhost:3002/verify-email?token=${emailVerificationToken}`,
      },
      prefLang: user?.preferredLang || PreferredLanguage.ARABIC,
    });

    return {
      isSuccess: true,
      message: getMessage('authentication_verificationEmailSent', lang),
    };
  }
}
