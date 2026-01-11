import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
<<<<<<< HEAD

=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { TranslatedText } from 'src/types/TranslatedText.type';

@Schema({ timestamps: true })
export class TypeHintConfig {
  @Prop({ type: String, unique: true, required: true })
  key: string;

  @Prop({ type: Object, required: true })
  label: TranslatedText;

<<<<<<< HEAD
  @Prop({ type: String, required: true })
  icon: string;

  @Prop({ type: String })
  colorFrom?: string;

  @Prop({ type: String })
  colorTo?: string;

  @Prop({ type: String })
  textColor?: string;

=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  @Prop({ type: Number, min: 1, max: 10, default: 10 })
  priority?: number;

  @Prop({ type: Date, default: null })
  startDate?: Date | undefined;

  @Prop({ type: Date, default: null })
  endDate?: Date | undefined;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

<<<<<<< HEAD
=======
  @Prop({ default: false })
  isSystem: boolean;

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

export type TypeHintConfigDocument = TypeHintConfig & Document;
export const TypeHintConfigSchema =
  SchemaFactory.createForClass(TypeHintConfig);
