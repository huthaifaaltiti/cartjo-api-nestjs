import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';
import { Permission } from '../enums/permission.enum';

@Schema({ timestamps: true })
export class RolePermission {
  @Prop({ type: String, enum: UserRole, unique: true })
  role: UserRole;

  @Prop({ type: [String], enum: Permission, default: [] })
  permissions: Permission[];
}

export type RolePermissionDocument = RolePermission & Document;
export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);
