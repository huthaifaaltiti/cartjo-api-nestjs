import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserContextService } from './userContext.service';
import { GetUserContextQuery } from './dto/get-user-context.dto';
import { ApiPaths } from '../../common/constants/api-paths';

@Controller(ApiPaths.UserContext.Root)
export class UserContextController {
  constructor(private readonly userContextService: UserContextService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.UserContext.Get)
  async getUsers(@Request() req: any, @Query() query: GetUserContextQuery) {
    return this.userContextService.getUserContext({
      user: req.user,
      query,
    });
  }
}
