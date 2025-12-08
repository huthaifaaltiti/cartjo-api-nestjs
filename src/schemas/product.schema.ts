import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Currency } from 'src/enums/currency.enum';

export type ProductDocument = Product & Document;

class TranslatedText {
  @Prop({ required: true })
  ar: string;

  @Prop({ required: true })
  en: string;
}

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, type: TranslatedText })
  name: TranslatedText;

  @Prop({ required: true, type: TranslatedText })
  description: TranslatedText;

  @Prop({ isRequired: true, type: [String], default: [] })
  images: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Media', default: null })
  mediaListIds?: string[];

  @Prop({ required: true, type: String, default: null })
  mainImage?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Media', default: null })
  mainMediaId?: string;

  @Prop({ required: true, default: 1 })
  price: number;

  @Prop({ required: true, enum: Currency, default: Currency.JOD })
  currency: string;

  @Prop({ default: 0, min: 0, max: 100 })
  discountRate: number;

  @Prop({ default: 1, min: 1, max: 5 })
  ratings: number;

  @Prop({ default: 0 })
  totalAmountCount: number;

  @Prop({ default: 0 })
  availableCount: number;

  @Prop({ default: 0 })
  sellCount: number;

  @Prop({ default: 0 })
  favoriteCount: number;

  @Prop({ default: false, required: false })
  isWishListed: boolean;

  @Prop({
    required: true,
  })
  typeHint: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ unique: true })
  slug: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SubCategory',
    required: true,
  })
  subCategoryId: MongooseSchema.Types.ObjectId;

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

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }], default: [] })
  comments: MongooseSchema.Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
