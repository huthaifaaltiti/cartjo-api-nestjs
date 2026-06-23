import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RolePermission,
  RolePermissionSchema,
} from '../../schemas/role-permission.schema';
import { RolePermissionService } from './role-permission.service';
import { RolePermissionsSeeder } from '../../database/seeders/role-permissions.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
  ],
  providers: [RolePermissionService, RolePermissionsSeeder],
  controllers: [],
  exports: [RolePermissionService],
})
export class RolePermissionModule {}
