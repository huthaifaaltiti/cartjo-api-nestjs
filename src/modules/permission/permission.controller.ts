import { Controller, UseGuards, Query, Get } from '@nestjs/common';
import { ApiPaths } from '../../common/constants/api-paths';
import { AuthGuard } from '@nestjs/passport';
import { PermissionService } from './permission.service';
import { GetRolesPermissionsQueryDto } from './dto/get-roles-permissions.dto';

@Controller(ApiPaths.Permission.Root)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Permission.GetRolesPermissions)
  async getRolesPermissions(@Query() dto: GetRolesPermissionsQueryDto) {
    return this.permissionService.getRolesPermissions(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Permission.GetAll)
  async getFullPermissions(@Query() dto: GetRolesPermissionsQueryDto) {
    return this.permissionService.getFullPermissionsObject(dto);
  }
}
