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
import { RegisterDto } from './dto/register.dto';
import { Modules } from 'src/enums/appModules.enum';

import { JwtService } from '../jwt/jwt.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mediaService: MediaService,
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
      };

      const user = await this.userModel.create({ ...newUserData });

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
}
