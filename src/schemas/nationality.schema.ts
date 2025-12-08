import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { NameRef } from './common.schema';

export type NationalityDocument = Nationality & Document;

@Schema({ collection: 'nationalities', timestamps: true })
export class Nationality {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: false, unique: true })
  flag?: string;

  @Prop({ required: false })
  name: NameRef;

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

export const NationalitySchema = SchemaFactory.createForClass(Nationality);
