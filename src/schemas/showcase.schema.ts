import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

import { NameRef } from './common.schema';

export type showCaseDocument = ShowCase & Document;

@Schema()
export class ShowCase {
  @Prop({ required: true, type: Object })
  title: NameRef;

  @Prop({ required: true, type: Object })
  description: NameRef;

  @Prop({
    required: true,
    type: Object,
    default: {
      ar: 'عرض الكل',
      en: 'View All',
    },
  })
  showAllButtonText: NameRef;

  @Prop({
    required: true,
    type: String,
  })
  showAllButtonLink: string;

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

export const ShowCaseSchema = SchemaFactory.createForClass(ShowCase);
