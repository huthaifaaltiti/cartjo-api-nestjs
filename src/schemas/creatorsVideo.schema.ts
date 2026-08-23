import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { TranslatedText } from '../types/TranslatedText.type';
import { MediaPreview } from './common.schema';
import { CreatorsVideoType } from '../enums/creatorsVideoType.enum';

export type CreatorsVideoDocument = CreatorsVideo & Document;

@Schema({ collection: 'creators_videos', timestamps: true })
export class CreatorsVideo {
  @Prop({ type: Object, required: true })
  title: TranslatedText;

  @Prop({
    type: String,
    enum: CreatorsVideoType,
    default: CreatorsVideoType.HERO,
    required: true,
  })
  type: CreatorsVideoType;

  @Prop({ type: MediaPreview, required: true })
  media: MediaPreview;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Date, default: null })
  unDeletedAt?: Date;

  @Prop({ type: Date, default: null })
  updatedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  deletedBy?: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  unDeletedBy?: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: mongoose.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: mongoose.Types.ObjectId;
}

export const CreatorsVideoSchema = SchemaFactory.createForClass(CreatorsVideo);
