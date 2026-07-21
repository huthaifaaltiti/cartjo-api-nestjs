import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserRole } from '../../enums/user-role.enum';
import { Permission } from '../../enums/permission.enum';
import {
  RolePermission,
  RolePermissionDocument,
} from '../../schemas/role-permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolePermissions } from '../../common/constants/roles-permissions.constant';
import { GetRolesPermissionsQueryDto } from './dto/get-roles-permissions.dto';
import { DataResponse } from '../../types/service-response.type';
import { getMessage } from '../../common/utils/translator';

@Injectable()
export class PermissionService implements OnModuleInit {
  private cache = new Map<UserRole, Permission[]>();

  constructor(
    @InjectModel(RolePermission.name)
    private rolePermissionModel: Model<RolePermissionDocument>,
  ) {}

  async onModuleInit() {
    await this.loadCache();
  }

  async loadCache() {
    const rows = await this.rolePermissionModel.find().lean();

    this.cache.clear();

    for (const row of rows) {
      this.cache.set(row.role, row.permissions);
    }
  }

  async getPermissionsByRole(role: UserRole): Promise<Permission[]> {
    const fromDb = this.cache.get(role);

    if (fromDb?.length) return fromDb;

    // fallback to code
    return RolePermissions[role] || [];
  }

  async getRolesPermissions(
    dto: GetRolesPermissionsQueryDto,
  ): Promise<DataResponse<RolePermission[]>> {
    const { lang } = dto;

    const roles = Object.values(UserRole);

    const result: RolePermission[] = await Promise.all(
      roles.map(async role => ({
        role,
        permissions: await this.getPermissionsByRole(role),
      })),
    );

    return {
      isSuccess: true,
      message: getMessage(
        'rolePermission_rolesPermissionsRetrievedSuccessfully',
        lang,
      ),
      data: result,
    };
  }

  getFullPermissionsObject(
    dto: GetRolesPermissionsQueryDto,
  ): DataResponse<typeof Permission> {
    const { lang } = dto;

    return {
      isSuccess: true,
      message: getMessage('permission_permissionsRetrievedSuccessfully', lang),
      data: Permission,
    };
  }
}
