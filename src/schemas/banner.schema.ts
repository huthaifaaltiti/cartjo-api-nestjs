import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

import { TranslatedText } from 'src/types/TranslatedText.type';

export type BannerDocument = Banner & Document;

class MediaPreview {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Media', required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  url: string;
}

class CtaButton {
  @Prop({ required: true }) label: TranslatedText;
  @Prop({ required: true }) link: string;
  @Prop({ required: true }) labelClr: string;
  @Prop({ required: true }) bgClr: string;
}

@Schema({ collection: 'banners', timestamps: true }) // auto adds createdAt & updatedAt
export class Banner {
  @Prop({ required: true })
  title: TranslatedText;

  @Prop({ required: true })
  withAction: boolean;

  @Prop({ type: CtaButton, required: false })
  ctaBtn: CtaButton | null;

  @Prop({ type: MediaPreview, required: true })
  media?: MediaPreview;

  @Prop({ type: Date, default: null })
  startDate?: Date;

  @Prop({ type: Date, default: null })
  endDate?: Date;

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

export const BannerSchema = SchemaFactory.createForClass(Banner);
