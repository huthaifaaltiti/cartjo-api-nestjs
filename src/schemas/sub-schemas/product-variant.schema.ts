import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { MediaPreview, NameRef } from '../common.schema';
import { Currency } from 'src/enums/currency.enum';
import { ProductVariantAttributeKey } from 'src/enums/productVariantAttributeKey.enum';

class VariantAttribute {
  @Prop({ required: true, enum: ProductVariantAttributeKey })
  key: ProductVariantAttributeKey;

  @Prop({ required: true })
  value: string;
}

export class ProductVariant {
  @Prop({ type: String, required: true, unique: true })
  variantId: string;

  @Prop({ type: [VariantAttribute], required: true })
  attributes: VariantAttribute[];

  @Prop({ required: true, type: NameRef })
  description: NameRef;

  @Prop({ unique: true, sparse: true })
  sku?: string; /* SKU = Stock Keeping Unit => What sparse: true means => MongoDB will: Enforce uniqueness only when sku exists & Allow multiple Without sparse:
❌ Only ONE document could have sku = null

With sparse:
✅ You can gradually add SKUs laterdocuments with sku = null / undefined
*/

  @Prop({
    type: MediaPreview,
    default: null,
  })
  mainImage?: MediaPreview;

  @Prop({
    isRequired: false,
    type: [MediaPreview],
    default: [],
  })
  images: MediaPreview[];

  @Prop({ required: true, default: 1 })
  price: number;

  @Prop({ default: 0, min: 0, max: 100 })
  discountRate: number;

  @Prop({ default: 0 })
  totalAmountCount: number;

  @Prop({ default: 0 })
  availableCount: number;

  @Prop({ default: 0, min: 0 })
  sellCount: number;

  @Prop({ required: true, enum: Currency, default: Currency.JOD })
  currency: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: null })
  unDeletedAt?: Date | null;

  @Prop({ default: null })
  createdAt?: Date | null;

  @Prop({ default: null })
  updatedAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy: MongooseSchema.Types.ObjectId;
}

export const ProductVariantSchema =
  SchemaFactory.createForClass(ProductVariant);
