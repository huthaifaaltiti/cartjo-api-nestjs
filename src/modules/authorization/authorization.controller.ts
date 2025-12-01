import { Controller, Post, Body } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { LoginDto } from './dto/login.dto';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Authorization.Root)
export class AuthorizationController {
  constructor(private readonly authService: AuthorizationService) {}

  @Post(ApiPaths.Authorization.Login)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
