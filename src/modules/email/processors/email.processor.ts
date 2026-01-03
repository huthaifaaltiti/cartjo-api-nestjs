import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from 'src/schemas/email-template.schema';
import { Queues } from 'src/enums/queues.enum';
import { EmailService } from '../email.service';
import { Processors } from 'src/enums/processors.enum';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';

@Processor(Queues.EMAIL_QUEUE)
export class EmailProcessor {
  constructor(
    private emailService: EmailService,
    @InjectModel(EmailTemplate.name)
    private templateModel: Model<EmailTemplateDocument>,
  ) {}

  @Process(Processors.SEND_EMAIL)
  async handleEmail(job: Job) {
    const { to, templateName, templateData, prefLang } = job.data;

    const template = await this.templateModel.findOne({ name: templateName });
    if (!template) return console.error(`Template ${templateName} not found`);

    await this.emailService.sendTemplateEmail({
      to,
      templateName,
      templateData,
      prefLang: prefLang || PreferredLanguage.ARABIC,
    });
  }
}
