import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { EmailSendingProvider } from 'src/enums/emailSendingProvider.enum';
import { EmailSendingStatus } from 'src/enums/emailSendingStatus.enum';

export type EmailLogDocument = EmailLog & Document;

@Schema({ timestamps: true, collection: 'emailLogs' })
export class EmailLog {
  @Prop({ required: true })
  to: string;

  @Prop({ required: true })
  template: string;

  @Prop()
  subject: string;

  @Prop({
    enum: EmailSendingStatus,
    default: EmailSendingStatus.QUEUED,
  })
  status: EmailSendingStatus;

  @Prop({ enum: EmailSendingProvider, default: EmailSendingProvider.SENDGRID })
  provider: EmailSendingProvider;

  @Prop()
  messageId?: string;

  @Prop()
  error?: string;

  @Prop({ default: 0 })
  retries: number;

  @Prop()
  sentAt?: Date;
}

export const EmailLogSchema = SchemaFactory.createForClass(EmailLog);
