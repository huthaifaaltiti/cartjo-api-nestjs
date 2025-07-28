import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

export type LogoDocument = Logo & Document;

@Schema({ collection: 'logo', timestamps: true })
export class Logo extends Document {
  @Prop({ required: true })
  name?: string;

  @Prop({ required: true })
  altText?: string;

  @Prop({
    type: {
      id: { type: MongooseSchema.Types.ObjectId, ref: 'Media' },
      url: { type: String },
    },
    required: false,
  })
  media?: {
    id: mongoose.Types.ObjectId;
    url: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  deletedAt?: Date | null;

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

export const LogoSchema = SchemaFactory.createForClass(Logo);
