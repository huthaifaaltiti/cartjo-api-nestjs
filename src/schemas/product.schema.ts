import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

import { Currency } from 'src/enums/currency.enum';
<<<<<<< HEAD
=======
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

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

<<<<<<< HEAD
  @Prop({ isRequired: true, type: [String], default: [] })
=======
  @Prop({ isRequired: false, type: [String], default: [] })
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

<<<<<<< HEAD
  @Prop({ default: 0 })
  sellCount: number;

  @Prop({ default: 0 })
  favoriteCount: number;

=======
  @Prop({ default: 0, min: 0 })
  sellCount: number;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  weeklyViewCount: number;

  @Prop({ default: 0 })
  favoriteCount: number;

  @Prop({ default: 0 })
  weeklyFavoriteCount: number;

  @Prop({ default: 0 })
  weeklyScore: number;

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  @Prop({ default: false, required: false })
  isWishListed: boolean;

  @Prop({
    required: true,
<<<<<<< HEAD
  })
  typeHint: string;
=======
    type: [String],
    enum: Object.values(SystemTypeHints),
    default: [SystemTypeHints.STATIC],
  })
  typeHint: string[];
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

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

<<<<<<< HEAD
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }], default: [] })
=======
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Comment' }],
    default: [],
  })
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  comments: MongooseSchema.Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
