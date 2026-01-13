import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { UserContextService } from './userContext.service';

@Controller(ApiPaths.UserContext.Root)
export class UserContextController {
  constructor(private readonly userContextService: UserContextService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.UserContext.Get)
  async getUsers(@Request() req: any) {
    return this.userContextService.getUserContext({
      user: req.user,
    });
  }
}
