import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { TypeHint } from 'src/enums/typeHint.enums';
import { Currency } from 'src/types/Currency.type';

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

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: false })
  mainImage?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  currency: Currency;

  @Prop({ default: 0 })
  discountRate: number;

  @Prop({ default: 0 })
  totalAmountCount: number;

  @Prop({ default: 0 })
  availableCount: number;

  @Prop({ default: 0 })
  sellCount: number;

  @Prop({ default: 0 })
  favoriteCount: number;

  @Prop({
    // enum: ['organic', 'cold_sale', 'imported', 'bundle'],
    enum: TypeHint,
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
}

export const ProductSchema = SchemaFactory.createForClass(Product);
