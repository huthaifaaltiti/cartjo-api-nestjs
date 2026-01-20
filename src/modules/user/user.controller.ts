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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { ALLOWED_AUTHENTICATED_ROLES } from 'src/common/constants/roles.constants';
import { GetUsersStatsQueryDto } from './dto/get-users-stats.dto';
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
import { CreateAdminBodyDto } from './dto/create-admin.dto';
import { UpdateAdminUserParamsDto } from './dto/update-admin.dto';
import { ApiPaths } from 'src/common/constants/api-paths';
import {
  UpdateDefaultAddressDto,
  UpdateUserDto,
  UpdateUserParamsDto,
} from './dto/update.dto';

@Controller(ApiPaths.User.Root)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.User.GetAll)
  async getUsers(@Query() query: GetAllUsersQueryDto) {
    const { lang, limit, lastId, search, isActive, isDeleted, canManage } =
      query;

    return this.userService.getUsers({
      lang,
      limit,
      lastId,
      search,
      isActive,
      isDeleted,
      canManage,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.User.GetStats)
  async getStats(@Query() query: GetUsersStatsQueryDto) {
    const { lang } = query;

    return this.userService.getUsersStats(lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.User.GetOne)
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
  @Delete(ApiPaths.User.Delete)
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
  @Delete(ApiPaths.User.UnDelete)
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
  @Put(ApiPaths.User.UpdateStatus)
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
  @Post(ApiPaths.User.CreateAdmin)
  @UseInterceptors(FileInterceptor('profilePic'))
  async createAdminUser(
    @UploadedFile() profilePic: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateAdminBodyDto,
  ) {
    return this.userService.createAdminUser(body, req, profilePic);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.User.UpdateAdmin)
  @UseInterceptors(FileInterceptor('profilePic'))
  async updateAdminUser(
    @Param() param: UpdateAdminUserParamsDto,
    @UploadedFile() profilePic: Express.Multer.File,
    @Request() req: any,
    @Body() body: Partial<CreateAdminBodyDto>,
  ) {
    const { id } = param;

    return this.userService.updateAdminUser(id, body, req, profilePic);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.User.Update)
  @UseInterceptors(FileInterceptor('profilePic'))
  async updateUser(
    @Param() param: UpdateUserParamsDto,
    @UploadedFile() profilePic: Express.Multer.File,
    @Request() req: any,
    @Body() body: UpdateUserDto,
  ) {
    const { id } = param;

    return this.userService.updateUser(id, body, req, profilePic);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.User.UpdateDefaultAddress)
  async updateDefaultShippingAddress(
    @Request() req: any,
    @Body() dto: UpdateDefaultAddressDto,
  ) {
    const { user } = req;

    return this.userService.updateDefaultShippingAddress(user, dto);
  }
}
