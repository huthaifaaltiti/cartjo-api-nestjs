import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

import { MultiLangText } from './common.schema';

export type BannerDocument = Banner & Document;

class MediaPreview {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Media', required: true })
  id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  url: string;
}

class CtaButton {
  @Prop({ required: true }) link: string;
  @Prop({ required: true }) text: string;
}

class OfferDetails {
  @Prop({ required: true }) preSalePrice: number;
  @Prop({ required: true }) afterSalePrice: number;
  @Prop({ required: true }) desc: string;
}

@Schema({ collection: 'banners', timestamps: true }) // auto adds createdAt & updatedAt
export class Banner {
  @Prop({ type: MultiLangText, required: true })
  label: MultiLangText;

  @Prop({ type: MultiLangText, required: true })
  title: MultiLangText;

  @Prop({ type: MultiLangText, required: true })
  subTitle: MultiLangText;

  @Prop({ type: CtaButton, required: true })
  ctaBtn: CtaButton;

  @Prop({ type: OfferDetails, required: true })
  offerDetails: OfferDetails;

  @Prop({ type: MediaPreview, required: false })
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
