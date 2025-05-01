import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoError } from 'mongodb';

import { getMessage } from 'src/common/utils/translator';
import { RegisterDto } from './dto/register.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { generateUsername } from 'src/common/utils/generators';
import { JwtService } from '../jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
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
      const username =
        (await generateUsername(firstName, lastName, this.userModel)) ||
        `${firstName}.${lastName}_${Date.now()}`;

      const newUserData = {
        firstName,
        lastName,
        email,
        termsAccepted,
        marketingEmails,
        username,
        password,
        countryCode,
        phoneNumber,
        createdBy: 'System',
      };

      const user = await this.userModel.create({ ...newUserData });

      const token = this.jwtService.generateToken(
        user?._id?.toString(),
        user.phoneNumber,
        user.role,
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
