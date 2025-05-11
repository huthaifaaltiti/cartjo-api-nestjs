import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Location extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Location', default: null })
  parent: Types.ObjectId | null; // null means it's a main town
}

export const LocationSchema = SchemaFactory.createForClass(Location);
