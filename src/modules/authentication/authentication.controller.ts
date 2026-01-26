import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Request,
  Res,
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

@Controller(ApiPaths.Authentication.Root)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ApiPaths.Authentication.Register)
  @UseInterceptors(FileInterceptor('profilePic'))
  async register(
    @UploadedFile() profilePic: Express.Multer.File,
    @Body() dto: RegisterDto,
    @Request() req: any,
  ) {
    return this.authService.register(req, dto, profilePic);
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

  // Login with Google
  @Get(ApiPaths.Authentication.Google)
  async googleLogin(@Res() res) {
    return this.authService.googleLogin(res);
  }

  // Google callback uri
  @Get(ApiPaths.Authentication.GoogleCallback)
  async googleCallback(@Req() req, @Res() res) {
    return this.authService.handleGoogleCallback(req, res);
  }
}
