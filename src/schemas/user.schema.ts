import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { hashSync } from 'bcrypt';

import { UserRole } from 'src/enums/user-role.enum';

export type UserDocument = User & Document;

class MapLocation {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: false })
  username?: string;

  @Prop({ required: false, default: null })
  usernameUpdatedAt?: Date;

  @Prop({ required: false })
  address?: string;

  @Prop({ type: Object })
  mapLocation?: MapLocation;

  @Prop()
  profilePic?: string;

  @Prop({ required: false, unique: true })
  email?: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop({ required: false })
  birthDate?: Date;

  @Prop({ required: false, set: (value: string) => hashSync(value, 12) })
  password?: string;

  @Prop({ default: false })
  rememberMe: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop()
  deletedAt?: Date | null;

  @Prop({ default: Date.now })
  dateJoined: Date;

  @Prop({ type: String, default: 'System' })
  createdBy: string;

  @Prop()
  termsAccepted: boolean;

  @Prop()
  marketingEmails: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
