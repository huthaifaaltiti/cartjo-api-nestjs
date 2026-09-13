import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { NameRef } from './common.schema';
import { TranslatedText } from '../types/TranslatedText.type';
import {
  StorePayoutInfo,
  StorePayoutSummary,
  StorePickupAddress,
  StorePolicies,
  StorePreviousHandle,
  StorePreviousHandleSchema,
  StoreSocialLinks,
  StoreStats,
} from './sub-schemas/creator-store.parts';
import { CreatorStoreStatus } from '../enums/creatorStoreStatus.enum';
import { CreatorStoreBusinessType } from '../enums/creatorStoreBusinessType.enum';
import { Currency } from '../enums/currency.enum';

export type CreatorStoreDocument = CreatorStore & Document;

@Schema({ collection: 'creator_stores', timestamps: true })
export class CreatorStore {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  ownerId: mongoose.Types.ObjectId;

  @Prop({ type: NameRef, required: true })
  name: NameRef;

  @Prop({ type: String, unique: true, index: true })
  slug: string;

  @Prop({
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  handle: string;

  @Prop({ type: Date, default: null })
  handleChangedAt?: Date;

  // How many times the creator has changed the handle (DRAFT renames excluded).
  @Prop({ type: Number, default: 0, min: 0 })
  handleChangeCount: number;

  @Prop({ type: [StorePreviousHandleSchema], default: [] })
  previousHandles: StorePreviousHandle[];

  @Prop({ type: Object, default: null })
  bio?: TranslatedText;

  @Prop({ type: Object, default: null })
  tagline?: TranslatedText;

  @Prop({ type: Object, default: () => ({ id: null, url: null }) })
  logo: { id: string | null; url: string | null };

  @Prop({ type: Object, default: () => ({ id: null, url: null }) })
  banner: { id: string | null; url: string | null };

  @Prop({ type: String, default: null })
  themeColor?: string;

  @Prop({ type: String, default: null })
  countryCode?: string;

  @Prop({ type: String, default: null })
  phone?: string;

  @Prop({ type: String, default: null, lowercase: true, trim: true })
  email?: string;

  @Prop({ type: StoreSocialLinks, default: () => ({}) })
  socialLinks: StoreSocialLinks;

  @Prop({
    type: String,
    enum: Object.values(Currency),
    default: Currency.JOD,
  })
  currency: Currency;

  // Percentage of every sale kept by CartJO. Managed by admins only
  @Prop({ type: Number, default: 10, min: 0, max: 100 })
  commissionRate: number;

  // Minimum basket value (in {@link currency}) required to check out.
  @Prop({ type: Number, default: 0, min: 0 })
  minOrderAmount: number;

  @Prop({
    type: String,
    enum: Object.values(CreatorStoreBusinessType),
    default: CreatorStoreBusinessType.INDIVIDUAL,
  })
  businessType: CreatorStoreBusinessType;

  // Commercial registration / tax number. Hidden from public responses.
  @Prop({ type: String, default: null, select: false })
  registrationNumber?: string;

  @Prop({ type: String, default: null, select: false })
  taxId?: string;

  @Prop({ type: StorePayoutInfo, default: () => ({}), select: false })
  payoutInfo: StorePayoutInfo;

  @Prop({ type: StorePickupAddress, default: () => ({}) })
  pickupAddress: StorePickupAddress;

  @Prop({ type: StorePolicies, default: () => ({}) })
  policies: StorePolicies;

  @Prop({
    type: String,
    enum: Object.values(CreatorStoreStatus),
    default: CreatorStoreStatus.DRAFT,
    index: true,
  })
  status: CreatorStoreStatus;

  // Human-readable reason for the current REJECTED / SUSPENDED status.
  @Prop({ type: String, default: null })
  statusReason?: string;

  // Verified badge — set by an admin after KYC / document checks.
  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop({ type: Date, default: null })
  verifiedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  verifiedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  submittedForReviewAt?: Date;

  @Prop({ type: Date, default: null })
  reviewedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  reviewedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  suspendedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  suspendedBy?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  closedAt?: Date;

  // Temporary "away" mode — store stays ACTIVE but stops accepting orders.
  @Prop({ type: Boolean, default: false })
  vacationMode: boolean;

  @Prop({ type: Object, default: null })
  vacationMessage?: TranslatedText;

  @Prop({ type: Date, default: null })
  vacationUntil?: Date;

  @Prop({ type: StoreStats, default: () => ({}) })
  stats: StoreStats;

  @Prop({ type: StorePayoutSummary, default: () => ({}) })
  payoutSummary: StorePayoutSummary;

  // Editorial flag to feature the store on the marketplace home.
  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  // Private notes visible to admins only.
  @Prop({ type: String, default: null, select: false })
  internalNotes?: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Date, default: null })
  unDeletedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy?: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy?: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: mongoose.Types.ObjectId;
}

export const CreatorStoreSchema = SchemaFactory.createForClass(CreatorStore);

// Text index to back the storefront / admin search box.
CreatorStoreSchema.index({
  'name.en': 'text',
  'name.ar': 'text',
  handle: 'text',
});
