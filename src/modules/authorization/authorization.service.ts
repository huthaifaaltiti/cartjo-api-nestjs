import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../schemas/user.schema';
import { getMessage } from 'src/common/utils/translator';
import { validateUserActiveStatus } from 'src/common/utils/validateUserActiveStatus';
import { LoginDto } from './dto/login.dto';
import { AuthJwtService } from '../auth-jwt/auth-jwt.service';

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
    const user = await this.userModel.findOne({
      $or: [
        { email: identifier },
        { phoneNumber: identifier },
        { username: identifier },
      ],
    });

    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);

    return passwordMatch ? user : null;
  }

  async login(body: LoginDto) {
    const { identifier, password, rememberMe, lang } = body;

    const user = await this.validateUser(identifier, password);

    validateUserActiveStatus(user, lang);

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        isSuccess: false,
        message: getMessage('authorization_InvalidCredentials', lang),
      });
    }

    if (rememberMe) {
      await this.userModel.findByIdAndUpdate(user._id, {
        rememberMe,
      });
    }

    const tokens = await this.authJwtService.issueTokens(user, rememberMe);

    return {
      isSuccess: true,
      message: getMessage('authorization_loginSuccessful', lang),
      ...tokens,
    };
  }
}
