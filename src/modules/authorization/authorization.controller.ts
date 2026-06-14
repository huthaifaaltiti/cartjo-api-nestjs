import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthorizationService } from './authorization.service';
import { LoginDto } from './dto/login.dto';
import { ApiPaths } from '../../common/constants/api-paths';
import { LoginRateLimitGuard } from '../../common/guards/login-rate-limit.guard';
import { LogoutDto } from './dto/logout.dto';

@Controller(ApiPaths.Authorization.Root)
export class AuthorizationController {
  constructor(private readonly authService: AuthorizationService) {}

  @Post(ApiPaths.Authorization.Login)
  @UseGuards(LoginRateLimitGuard)
  async login(@Body() body: LoginDto, @Req() req: Request) {
    const meta = {
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    return this.authService.login(body, meta);
  }

  @Post(ApiPaths.Authorization.Refresh)
  async refresh(@Body() body: { refreshToken: string }, @Req() req: Request) {
    const meta = {
      ipAddress:
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    return this.authService.refreshToken(body.refreshToken, meta);
  }

  @Post(ApiPaths.Authorization.Logout)
  async logout(@Body() body: LogoutDto) {
    return this.authService.logout(body);
  }

  @Post(ApiPaths.Authorization.LogoutAll)
  async logoutAll(@Req() req: any) {
    return this.authService.logoutAll(req.user.sub);
  }
}
