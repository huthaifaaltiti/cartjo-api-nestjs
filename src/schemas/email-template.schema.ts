import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NameRef } from './common.schema';

export type EmailTemplateDocument = EmailTemplate & Document;

@Schema({ timestamps: true })
export class EmailTemplate {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  html: NameRef;

  @Prop({ default: '' })
  subject: NameRef;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);
