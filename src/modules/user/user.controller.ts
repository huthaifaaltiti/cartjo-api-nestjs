import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import {
  UpdateUserStatusBodyDto,
  UpdateUserStatusParamsDto,
} from './dto/update-user-status.dto';
import {
  UnDeleteUserBodyDto,
  UnDeleteUserParamDto,
} from './dto/un-delete-user.dto';
import { GetUserParamDto, GetUserQueryDto } from './dto/get-user.dto';
import { ALLOWED_AUTHENTICATED_ROLES } from 'src/common/constants/roles.constants';
import { CreateAdminBodyDto } from './dto/create-admin.dto';

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
  @Get('/:id')
  async getUser(
    @Request() req: any,
    @Param() param: GetUserParamDto,
    @Query() query: GetUserQueryDto,
  ) {
    const { user } = req;
    const { id } = param;
    const { lang } = query;

    return ALLOWED_AUTHENTICATED_ROLES.includes(user.role)
      ? this.userService.getUserByAdmin(id, user, lang)
      : this.userService.getUserData(id, user, lang);
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
    @Param() param: UnDeleteUserParamDto,
    @Body() body: UnDeleteUserBodyDto,
  ) {
    const { user } = req;
    const { lang } = body;
    const { id } = param;

    return this.userService.softDeleteUser(id, lang, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('un-delete/:id')
  async unDeleteUser(
    @Request() req: any,
    @Param() param: DeleteUserParamDto,
    @Body() body: DeleteUserBodyDto,
  ) {
    const { user } = req;
    const { lang } = body;
    const { id } = param;

    return this.userService.softUnDeleteUser(id, lang, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('status/:id')
  async updateUserStatus(
    @Param() param: UpdateUserStatusParamsDto,
    @Body() body: UpdateUserStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.userService.updateUserStatus(id, isActive, lang, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-admin')
  async createAdminUser(@Request() req: any, @Body() body: CreateAdminBodyDto) {
    const { user } = req;

    return this.userService.createAdminUser(body, user);
  }
}
