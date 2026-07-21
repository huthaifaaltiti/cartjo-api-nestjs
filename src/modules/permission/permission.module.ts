import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RolePermission,
  RolePermissionSchema,
} from '../../schemas/role-permission.schema';
import { PermissionService } from './permission.service';
import { RolePermissionsSeeder } from '../../database/seeders/role-permissions.seeder';
import { PermissionController } from './permission.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RolePermission.name, schema: RolePermissionSchema },
    ]),
  ],
  providers: [PermissionService, RolePermissionsSeeder],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class PermissionModule {}
