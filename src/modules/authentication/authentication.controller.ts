import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './authentication.service';
import { RegisterDto } from './dto/register.dto';

@Controller('api/v1/authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    console.log('hi!');
    return this.authService.register(dto);
  }
}
