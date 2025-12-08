import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as Handlebars from 'handlebars';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from 'src/schemas/email-template.schema';
import { Queues } from 'src/enums/queues.enum';
import { EmailService } from '../email.service';
import { Processors } from 'src/enums/processors.enum';

@Processor(Queues.EMAIL_QUEUE)
export class EmailProcessor {
  constructor(
    private emailService: EmailService,
    @InjectModel(EmailTemplate.name)
    private templateModel: Model<EmailTemplateDocument>,
  ) {}

  @Process(Processors.SEND_EMAIL)
  async handleEmail(job: Job) {
    const { to, subject, templateName, templateData } = job.data;

    const template = await this.templateModel.findOne({ name: templateName });
    if (!template) return console.error(`Template ${templateName} not found`);

    const html = Handlebars.compile(template.html)(templateData);
    await this.emailService.sendEmail(to, subject, html);
  }
}
