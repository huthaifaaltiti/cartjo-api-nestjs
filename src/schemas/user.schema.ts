import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { hashSync, compareSync } from 'bcrypt';
import { UserRole } from 'src/enums/user-role.enum';
import { Gender } from 'src/enums/gender.enum';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
import { NATIONALITY_CODES } from 'src/common/constants/nationalities';
import { MediaPreview } from './common.schema';

export type UserDocument = User &
  Document & {
    comparePassword(password: string): boolean;
  };

class MapLocation {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

export class DefaultShippingAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  town: string;
  street: string;
  building?: string;
  additionalInfo?: string;
  location?: { lat: number; lng: number; name: string };
}

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: false })
  username?: string;

  @Prop({ type: String, required: false, enum: NATIONALITY_CODES })
  nationality?: string;

  @Prop({ required: false, default: null })
  usernameUpdatedAt?: Date;

  @Prop({ required: false })
  address?: string;

  @Prop({ type: Object })
  mapLocation?: MapLocation;

  @Prop({ required: false, default: null })
  profilePic?: MediaPreview;

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

  @Prop({
    required: false,
    set: (value: string) => hashSync(value, 12),
  })
  password: string;

  @Prop({
    required: false,
    default: 0,
  })
  passwordChangeAttempts?: number;

  @Prop({
    type: Date,
    required: false,
    default: null,
  })
  lockUntil?: Date | null;

  @Prop({
    type: {
      oldPassword: { type: String },
      currentPassword: { type: String },
      changedAt: { type: Date, default: null },
      device: { type: String, default: null },
      ipAddress: { type: String, default: null },
      changedBy: {
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      location: { type: String, default: null },
    },
    _id: false, // Prevents creating a sub-document ID for this object
    required: false,
  })
  passwordMetadata: {
    oldPassword: string;
    currentPassword: string;
    changedAt: Date;
    device: string;
    ipAddress: string;
    changedBy: mongoose.Types.ObjectId;
    location?: string;
  };

  @Prop({
    type: [
      {
        oldPassword: { type: String },
        currentPassword: { type: String },
        changedAt: { type: Date },
        device: { type: String },
        ipAddress: { type: String },
        changedBy: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
      },
    ],
    default: [],
    _id: false,
  })
  passwordHistory: Array<{
    oldPassword: string;
    currentPassword: string;
    changedAt: Date;
    device: string;
    ipAddress: string;
    changedBy: mongoose.Types.ObjectId;
  }>;

  @Prop({ default: undefined })
  resetCode?: string | undefined;

  @Prop({ default: undefined })
  resetCodeExpires?: Date | undefined;

  @Prop({ default: false })
  rememberMe: boolean;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: String,
    enum: Object.values(Gender),
    required: false,
    default: null,
  })
  gender?: Gender | null;

  @Prop({
    type: String,
    enum: Object.values(PreferredLanguage),
    required: false,
    default: PreferredLanguage.ARABIC,
  })
  preferredLang: PreferredLanguage;

  @Prop({ default: false })
  canManage: boolean;

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

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy: mongoose.Types.ObjectId;

  @Prop({ default: Date.now })
  dateJoined: Date;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    default: process.env.DB_SYSTEM_OBJ_ID,
  })
  createdBy: mongoose.Types.ObjectId;

  @Prop()
  termsAccepted: boolean;

  @Prop()
  marketingEmails: boolean;

  @Prop({ default: null })
  emailVerificationToken?: string;

  @Prop({ type: Date, nullable: true })
  emailVerificationTokenExpires?: Date;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ type: Object })
  defaultShippingAddress?: DefaultShippingAddress;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.comparePassword = function (password: string): boolean {
  if (!this.password) return false;
  return compareSync(password, this.password);
};

UserSchema.pre<UserDocument>('save', function (next) {
  if (this.role === UserRole.ADMINISTRATOR || this.role === UserRole.OWNER) {
    this.canManage = true;
  }
  next();
});
