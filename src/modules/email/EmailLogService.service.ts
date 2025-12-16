import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailSendingStatus } from 'src/enums/emailSendingStatus.enum';
import { EmailLog, EmailLogDocument } from 'src/schemas/email-log.schema';

@Injectable()
export class EmailLogService {
  constructor(
    @InjectModel(EmailLog.name)
    private readonly model: Model<EmailLogDocument>,
  ) {}

  create(data: Partial<EmailLog>) {
    return this.model.create(data);
  }

  markSent(id: string, messageId?: string) {
    return this.model.findByIdAndUpdate(id, {
      status: EmailSendingStatus.SENT,
      messageId,
      sentAt: new Date(),
    });
  }

  markFailed(id: string, error: string) {
    return this.model.findByIdAndUpdate(id, {
      status: EmailSendingStatus.FAILED,
      error,
      $inc: { retries: 1 },
    });
  }
}
