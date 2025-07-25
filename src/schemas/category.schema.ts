import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

import { MediaPreview, NameRef} from './common.schema';

export type CategoryDocument = Category & Document;

@Schema({ collection: 'categories', timestamps: true })
export class Category extends Document {
  @Prop({ required: false })
  name?: NameRef;

  @Prop({ required: false, default: {} })
  media?: MediaPreview;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SubCategory',
    default: [],
  })
  subCategories: mongoose.Types.ObjectId[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop()
  deletedAt?: Date | null;

  @Prop()
  unDeletedAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy: mongoose.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy: mongoose.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
