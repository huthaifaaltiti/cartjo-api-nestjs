import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../../schemas/user.schema';
import { getMessage } from 'src/common/utils/translator';
import { validateUserActiveStatus } from 'src/common/utils/validateUserActiveStatus';
import { Locale } from 'src/types/Locale';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userModel.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier },
        { username: identifier },
      ],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(
    identifier: string,
    password: string,
    rememberMe: boolean,
    lang: Locale = 'en',
  ): Promise<{ isSuccess?: boolean; message?: string; token?: string | null }> {
    const user = await this.validateUser(identifier, password);

    validateUserActiveStatus(user, lang);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        isSuccess: false,
        message: getMessage('authorization_InvalidCredentials', lang),
        token: null,
      });
    }

    if (rememberMe) {
      // Update rememberMe field in DB
      await this.userModel.findByIdAndUpdate(user._id, { rememberMe });
    }

    const payload = {
      userId: user._id,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      canManage: user.canManage,
    };

    const expiresIn = rememberMe
      ? process.env.JWT_MAX_EXPIRATION_TIME
      : process.env.JWT_MIN_EXPIRATION_TIME;

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn,
    });

    return { token };
  }
}
