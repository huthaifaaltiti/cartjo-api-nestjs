import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserService } from './user.service';
import { GetUsersStatsBodyDto } from './dto/get-users-stats-body.dto';
import { GetAllUsersQueryDto } from './dto/get-all-users-query.dto';
import { DeleteUserBodyDto } from './dto/delete-user-body.dto';
import { DeleteUserParamDto } from './dto/delete-user-param.dto';

@Controller('/api/v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getUsers(@Query() query: GetAllUsersQueryDto) {
    const { lang, limit, lastId, search } = query;

    return this.userService.getUsers({ lang, limit, lastId, search });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats(@Body() body: GetUsersStatsBodyDto) {
    const { lang } = body;

    return this.userService.getUsersStats(lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async deleteUser(
    @Request() req: any,
    @Param() param: DeleteUserParamDto,
    @Body() body: DeleteUserBodyDto,
  ) {
    const { user } = req;
    const { lang } = body;
    const { id } = param;

    return this.userService.softDeleteUser(id, lang, user);
  }
}
