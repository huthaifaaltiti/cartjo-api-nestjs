import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './authentication.service';
import {
  ForgotPasswordBodyDto,
  RegisterDto,
  ResendVerificationEmailDto,
  ResetPasswordBodyDto,
  VerifyEmailQueryDto,
  VerifyResetPasswordCodeBodyDto,
} from './dto/register.dto';
import { ApiPaths } from 'src/common/constants/api-paths';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';

@Controller(ApiPaths.Authentication.Root)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  @Post(ApiPaths.Authentication.Register)
  @UseInterceptors(FileInterceptor('profilePic'))
  async register(
    @UploadedFile() profilePic: Express.Multer.File,
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto, profilePic);
  }

  @Get(ApiPaths.Authentication.VerifyEmail)
  async verifyEmail(@Query() query: VerifyEmailQueryDto) {
    return this.authService.verifyEmail(query);
  }

  @Post(ApiPaths.Authentication.ResendVerificationEmail)
  async resendVerificationEmail(@Body() dto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(dto);
  }

  // Forgot Password (1- Identifier)
  @Post(
    `${ApiPaths.Authentication.ForgotPassword.Root}/${ApiPaths.Authentication.ForgotPassword.SendIdentifier}`,
  )
  async forgotPassword(@Body() dto: ForgotPasswordBodyDto) {
    return this.authService.forgotPassword(dto);
  } 

  // Forgot Password (2- Verify Code)
  @Post(
    `${ApiPaths.Authentication.ForgotPassword.Root}/${ApiPaths.Authentication.ForgotPassword.VerifyResetPasswordCode}`,
  )
  async verifyResetPasswordCode(@Body() dto: VerifyResetPasswordCodeBodyDto) {
    return this.authService.verifyResetPasswordCode(dto);
  }

  // Forgot Password (3- Reset Password)
  @Post(
    `${ApiPaths.Authentication.ForgotPassword.Root}/${ApiPaths.Authentication.ForgotPassword.ResetPassword}`,
  )
  async resetPassword(@Body() dto: ResetPasswordBodyDto) {
    return this.authService.resetPassword(dto);
  }
}
