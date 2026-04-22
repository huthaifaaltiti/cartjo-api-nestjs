import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
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

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private authJwtService: AuthJwtService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<User | null> {
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

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(
    body: LoginDto,
  ): Promise<{ isSuccess?: boolean; message?: string; token?: string | null }> {
    const { identifier, password, rememberMe, lang } = body;

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

    if (rememberMe)
      await this.userModel.findByIdAndUpdate(user._id, { rememberMe });

    const token = this.authJwtService.generateToken(user, false);

    return {
      token,
      message: getMessage('authorization_loginSuccessful', lang),
    };
  }
}
