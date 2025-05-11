import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../../schemas/user.schema';
import { getMessage } from 'src/common/utils/translator';

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
    lang: 'ar' | 'en' = 'en',
  ): Promise<{ success?: boolean; message?: string; token?: string }> {
    const user = await this.validateUser(identifier, password);

    if (!user) {
      // throw new UnauthorizedException(
      //   getMessage('authorization_InvalidCredentials', lang),
      //   {
      //     cause: new Error(),
      //     description: 'Credentials error',
      //   },
      // );
      // throw new NotFoundException({
      //   statusCode: 401,
      //   message: getMessage('authorization_InvalidCredentials', lang),
      //   description: 'Credentials error',
      // });

      throw new UnauthorizedException(
        getMessage('authorization_InvalidCredentials', lang),
      );
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
