import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { MediaPreview } from './common.schema';
import { LogoType } from '../enums/logoType.enum';
import { TranslatedText } from '../types/common';

export type LogoDocument = Logo & Document;

@Schema({ collection: 'logo', timestamps: true })
export class Logo extends Document {
  @Prop({ type: Object, required: true })
  name?: TranslatedText;

  @Prop({ type: Object, required: true })
  altText?: TranslatedText;

  @Prop({
    type: String,
    enum: LogoType,
    default: LogoType.MAIN,
    required: true,
  })
  type: LogoType;

  @Prop({
    type: Object,
    required: true,
  })
  media?: {
    ar: MediaPreview;
    en: MediaPreview;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  deletedAt?: Date | null;

  unDeletedAt?: Date | null;

  updatedAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy: mongoose.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt?: Date | null;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy: mongoose.Types.ObjectId;
}

export const LogoSchema = SchemaFactory.createForClass(Logo);
