import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { GetAllUsersBodyDto } from './dto/get-all-users-body.dto';

@Controller('/api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  getUsers(@Body() body: GetAllUsersBodyDto) {
    const { lang, limit, lastId, search } = body;

    return this.userService.getUsers({ lang, limit, lastId, search });
  }
}
