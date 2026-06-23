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

@Injectable()
export class RolePermissionService implements OnModuleInit {
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

  async updateRole(role: UserRole, permissions: Permission[]) {
    await this.rolePermissionModel.updateOne(
      { role },
      { $set: { permissions } },
      { upsert: true },
    );

    await this.loadCache();
  }
}
