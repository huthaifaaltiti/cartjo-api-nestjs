import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { TranslatedText } from '../../types/TranslatedText.type';
import { PayoutMethod } from '../../enums/payoutMethod.enum';
import { Currency } from '../../enums/currency.enum';

/**
 * Sub-documents that make up a {@link CreatorStore}.
 * Kept in a single file to mirror `product-variant.schema.ts`.
 */

/* -------------------------------------------------------------------------- */
/*                               Social links                                */
/* -------------------------------------------------------------------------- */

export class StoreSocialLinks {
  @Prop({ type: String, default: null })
  instagram?: string;

  @Prop({ type: String, default: null })
  facebook?: string;

  @Prop({ type: String, default: null })
  tiktok?: string;

  @Prop({ type: String, default: null })
  youtube?: string;

  /** X / Twitter profile URL. */
  @Prop({ type: String, default: null })
  x?: string;

  @Prop({ type: String, default: null })
  snapchat?: string;

  @Prop({ type: String, default: null })
  whatsapp?: string;

  @Prop({ type: String, default: null })
  telegram?: string;

  @Prop({ type: String, default: null })
  website?: string;
}

export const StoreSocialLinksSchema =
  SchemaFactory.createForClass(StoreSocialLinks);

/* -------------------------------------------------------------------------- */
/*                             Previous handles                              */
/* -------------------------------------------------------------------------- */

/**
 * A handle the store used before it was changed. Kept so the old public URL
 * (`/@oldHandle`) can 301-redirect to the current one, and so nobody else can
 * immediately grab a just-released handle (squatting / impersonation guard).
 */
export class StorePreviousHandle {
  @Prop({ type: String, required: true, lowercase: true, trim: true })
  handle: string;

  @Prop({ type: Date, required: true, default: () => new Date() })
  changedAt: Date;
}

export const StorePreviousHandleSchema =
  SchemaFactory.createForClass(StorePreviousHandle);

/* -------------------------------------------------------------------------- */
/*                                Payout info                                */
/* -------------------------------------------------------------------------- */

/**
 * Banking / wallet details the platform uses to settle the creator's earnings.
 * Marked `select: false` on the parent schema so it is never leaked publicly.
 */
export class StorePayoutInfo {
  @Prop({
    type: String,
    enum: Object.values(PayoutMethod),
    default: PayoutMethod.BANK_TRANSFER,
  })
  method: PayoutMethod;

  // --- Bank transfer ---
  @Prop({ type: String, default: null })
  bankName?: string;

  @Prop({ type: String, default: null })
  accountHolderName?: string;

  @Prop({ type: String, default: null })
  iban?: string;

  @Prop({ type: String, default: null })
  accountNumber?: string;

  @Prop({ type: String, default: null })
  swiftCode?: string;

  // --- CliQ ---
  @Prop({ type: String, default: null })
  cliqAlias?: string;

  /**
   * Currency the creator is settled in. `null` means "use the store's own
   * {@link CreatorStore.currency}".
   */
  @Prop({ type: String, enum: Object.values(Currency), default: null })
  currency?: Currency;

  // --- Wallet ---
  @Prop({ type: String, default: null })
  walletProvider?: string;

  @Prop({ type: String, default: null })
  walletNumber?: string;

  /** Set by an admin once the details have been checked against a real payout. */
  @Prop({ type: Boolean, default: false })
  isConfirmed: boolean;

  @Prop({ type: Date, default: null })
  confirmedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  confirmedBy?: MongooseSchema.Types.ObjectId;
}

export const StorePayoutInfoSchema =
  SchemaFactory.createForClass(StorePayoutInfo);

/* -------------------------------------------------------------------------- */
/*                              Pickup address                               */
/* -------------------------------------------------------------------------- */

export class StoreGeoPoint {
  @Prop({ type: Number, default: null })
  lat?: number;

  @Prop({ type: Number, default: null })
  lng?: number;

  @Prop({ type: String, default: null })
  name?: string;
}

/**
 * Where the courier collects the goods from — the shipping origin for every
 * order that contains one of this store's products.
 */
export class StorePickupAddress {
  @Prop({ type: String, default: null })
  contactName?: string;

  @Prop({ type: String, default: null })
  phone?: string;

  @Prop({ type: String, default: null })
  countryCode?: string;

  @Prop({ type: String, default: null })
  country?: string;

  @Prop({ type: String, default: null })
  city?: string;

  @Prop({ type: String, default: null })
  town?: string;

  @Prop({ type: String, default: null })
  street?: string;

  @Prop({ type: String, default: null })
  building?: string;

  @Prop({ type: String, default: null })
  additionalInfo?: string;

  @Prop({ type: StoreGeoPoint, default: null })
  location?: StoreGeoPoint;
}

export const StorePickupAddressSchema =
  SchemaFactory.createForClass(StorePickupAddress);

/* -------------------------------------------------------------------------- */
/*                                 Policies                                  */
/* -------------------------------------------------------------------------- */

export class StorePolicies {
  @Prop({ type: Object, default: null })
  returnPolicy?: TranslatedText;

  @Prop({ type: Object, default: null })
  shippingPolicy?: TranslatedText;

  @Prop({ type: Object, default: null })
  exchangePolicy?: TranslatedText;

  /** Number of days the buyer has to request a return. */
  @Prop({ type: Number, default: 0, min: 0 })
  returnWindowDays: number;

  /** Days the store needs to hand a paid order to the courier. */
  @Prop({ type: Number, default: 1, min: 0 })
  processingTimeDays: number;
}

export const StorePoliciesSchema = SchemaFactory.createForClass(StorePolicies);

/* -------------------------------------------------------------------------- */
/*                            Denormalised stats                             */
/* -------------------------------------------------------------------------- */

/**
 * Roll-up counters kept on the store document so the storefront and the
 * creator dashboard never have to aggregate on every read. Refreshed by
 * {@link CreatorStoreSharedService.recalculateStats} and by incremental `$inc`s.
 */
export class StoreStats {
  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  ratingAverage: number;

  @Prop({ type: Number, default: 0, min: 0 })
  ratingsCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  productsCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  activeProductsCount: number;

  /** Distinct products that have been sold at least once. */
  @Prop({ type: Number, default: 0, min: 0 })
  soldProductsCount: number;

  /** Total individual units sold across all products. */
  @Prop({ type: Number, default: 0, min: 0 })
  totalUnitsSold: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalOrders: number;

  /** Gross merchandise value attributed to this store (before commission). */
  @Prop({ type: Number, default: 0, min: 0 })
  totalSalesAmount: number;

  /** Platform commission deducted from this store's sales so far. */
  @Prop({ type: Number, default: 0, min: 0 })
  totalCommissionAmount: number;

  /** Store earnings after commission (what is owed / already paid to creator). */
  @Prop({ type: Number, default: 0, min: 0 })
  netEarnings: number;

  @Prop({ type: Number, default: 0, min: 0 })
  followersCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  viewCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  weeklyViewCount: number;

  @Prop({ type: Date, default: null })
  lastOrderAt?: Date;

  @Prop({ type: Date, default: null })
  statsRefreshedAt?: Date;
}

export const StoreStatsSchema = SchemaFactory.createForClass(StoreStats);

/* -------------------------------------------------------------------------- */
/*                             Payout summary                                */
/* -------------------------------------------------------------------------- */

export class StorePayoutSummary {
  /** Amount already settled to the creator. */
  @Prop({ type: Number, default: 0, min: 0 })
  totalPaidOut: number;

  /** Net earnings accrued but not yet settled. */
  @Prop({ type: Number, default: 0, min: 0 })
  pendingAmount: number;

  @Prop({ type: Date, default: null })
  lastPayoutAt?: Date;
}

export const StorePayoutSummarySchema =
  SchemaFactory.createForClass(StorePayoutSummary);
