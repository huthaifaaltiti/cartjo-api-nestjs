import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { UserContextService } from './userContext.service';
import { GetUserContextQuery } from './dto/get-user-context.dto';

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
