import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true, collection: 'comments' })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: Number, min: 1, max: 5, default: null, required: false })
  rating: number | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ default: null })
  deletedAt?: Date | null;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isUpdated: boolean;

  @Prop({ default: false })
  isPurchasedProduct: boolean;

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

export const CommentSchema = SchemaFactory.createForClass(Comment);
