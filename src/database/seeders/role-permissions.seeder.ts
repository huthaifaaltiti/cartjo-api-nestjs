import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolePermission } from '../../schemas/role-permission.schema';
import { ROLES_PERMISSIONS_SEEDS } from '../seeds/roles-permissions.seed';

@Injectable()
export class RolePermissionsSeeder {
  constructor(
    @InjectModel(RolePermission.name)
    private readonly rolePermissionModel: Model<RolePermission>,
  ) {}

  async seed() {
    await this.seedSystemRolePermissions();
  }

  private async seedSystemRolePermissions() {
    console.log('🚀 Seeding role permissions...');

    for (const seed of ROLES_PERMISSIONS_SEEDS) {
      await this.rolePermissionModel.updateOne(
        { role: seed.role },
        {
          $setOnInsert: seed,
        },
        {
          upsert: true,
        },
      );
    }

    console.log('✅ Role permissions seeded');
  }
}
