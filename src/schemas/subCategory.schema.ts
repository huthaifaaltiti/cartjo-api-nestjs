import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

import { MediaPreview, NameRef } from './common.schema';

export type SubCategoryDocument = SubCategory & Document;

@Schema({ collection: 'subCategories', timestamps: true })
export class SubCategory extends Document {
  @Prop({ required: true, default: {} })
  name: NameRef;

  @Prop({ type: Object, required: false, default: {} })
  media?: {
    ar: MediaPreview;
    en: MediaPreview;
  };

  @Prop({ unique: true })
  slug: string | undefined;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Media', default: null })
  mediaId?: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: mongoose.Types.ObjectId;

  @Prop()
  deletedAt?: Date | null;

  @Prop()
  unDeletedAt?: Date | null;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  createdBy: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  deletedBy: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy: mongoose.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
