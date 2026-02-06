import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MigrationDocument = Migration & Document;

@Schema({ collection: 'migrations', timestamps: true })
export class Migration {
  @Prop({ required: true, unique: true, type: String })
  name: string;

  @Prop({ required: true, type: Date })
  ranAt: Date;
}

export const MigrationSchema = SchemaFactory.createForClass(Migration);
