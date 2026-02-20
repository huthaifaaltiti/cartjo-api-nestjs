import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
import { ProductVariant } from './sub-schemas/product-variant.schema';
import { MediaPreview, NameRef } from './common.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, type: NameRef })
  description: NameRef;

  @Prop({ required: true, type: NameRef })
  name: NameRef;

  @Prop({
    required: true,
    type: MediaPreview,
    default: {
      id: null,
      url: null,
    },
  })
  mainImage: MediaPreview;

  @Prop({
    required: true,
    type: [String],
    default: [SystemTypeHints.STATIC],
  })
  typeHints: string[];

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

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }],
    default: [],
  })
  comments: MongooseSchema.Types.ObjectId[];

  @Prop({
    required: true,
    type: [ProductVariant],
    default: [],
  })
  variants: ProductVariant[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: Number,
    min: 0,
    max: 1,
    index: true,
    default: Math.random,
  })
  random: number;

  @Prop({ default: 1, min: 1, max: 5 })
  ratings: number;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @Prop({ default: 0, min: 0 })
  totalSellCount: number;

  @Prop({ default: 0 })
  weeklyViewCount: number;

  @Prop({ default: 0 })
  favoriteCount: number;

  @Prop({ default: 0 })
  weeklyFavoriteCount: number;

  @Prop({ default: 0 })
  weeklyScore: number;

  @Prop({ default: false, required: false })
  isWishListed: boolean;

  @Prop({ unique: true })
  slug: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  isAvailable: boolean;

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

export const ProductSchema = SchemaFactory.createForClass(Product);
