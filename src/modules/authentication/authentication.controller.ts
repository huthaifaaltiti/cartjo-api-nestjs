import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';
import { ApiPaths } from 'src/common/constants/api-paths';
@Controller(ApiPaths.Authentication.Root)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ApiPaths.Authentication.Register)
  @UseInterceptors(FileInterceptor('profilePic'))
  async register(
    @UploadedFile() profilePic: Express.Multer.File,
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(dto, profilePic);
  }
}
