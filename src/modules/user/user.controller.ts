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
import {
  UpdateDefaultAddressDto,
  UpdateUserDto,
  UpdateUserParamsDto,
} from './dto/update.dto';
import { ApiPaths } from '../../common/constants/api-paths';
import { ALLOWED_AUTHENTICATED_ROLES } from '../../common/constants/roles.constants';
import { GetMeQueryDto } from './dto/get-me.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../enums/permission.enum';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Controller(ApiPaths.User.Root)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequirePermissions(Permission.USERS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.User.GetAll)
  async getUsers(@Request() req: any, @Query() query: GetAllUsersQueryDto) {
    const { lang, limit, lastId, search, isActive, isDeleted, canManage } =
      query;
    const { user } = req;

    return this.userService.getUsers(user, {
      lang,
      limit,
      lastId,
      search,
      isActive,
      isDeleted,
      canManage,
    });
  }

  @RequirePermissions(Permission.USERS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.User.GetStats)
  async getStats(@Query() query: GetUsersStatsQueryDto) {
    const { lang } = query;

    return this.userService.getUsersStats(lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.User.Me)
  async getMe(@Request() req: any, @Query() query: GetMeQueryDto) {
    return this.userService.getMe(req.user, query.lang);
  }

  @RequirePermissions(Permission.USERS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
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

  @RequirePermissions(Permission.USERS_DELETE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
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

  @RequirePermissions(Permission.USERS_RESTORE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
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

  @RequirePermissions(Permission.USERS_ACTIVATE, Permission.USERS_DEACTIVATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
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

  @RequirePermissions(Permission.USERS_CREATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post(ApiPaths.User.CreateAdmin)
  @UseInterceptors(FileInterceptor('profilePic'))
  async createAdminUser(
    @UploadedFile() profilePic: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateAdminBodyDto,
  ) {
    return this.userService.createAdminUser(body, req, profilePic);
  }

  @RequirePermissions(Permission.USERS_UPDATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
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
