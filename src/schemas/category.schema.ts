import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

class Name {
  @Prop({ required: true })
  ar: string;

  @Prop({ required: true })
  en: string;
}

class Media {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true, default: null })
  url: string;
}

@Schema({ collection: 'categories', timestamps: true })
export class Category extends Document {
  @Prop({ required: false })
  name?: Name;

  @Prop({ required: false, default: {} })
  media?: Media;

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
