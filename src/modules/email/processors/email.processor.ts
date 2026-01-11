import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
<<<<<<< HEAD
import * as Handlebars from 'handlebars';
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import {
  EmailTemplate,
  EmailTemplateDocument,
} from 'src/schemas/email-template.schema';
import { Queues } from 'src/enums/queues.enum';
import { EmailService } from '../email.service';
import { Processors } from 'src/enums/processors.enum';
<<<<<<< HEAD
=======
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Processor(Queues.EMAIL_QUEUE)
export class EmailProcessor {
  constructor(
    private emailService: EmailService,
    @InjectModel(EmailTemplate.name)
    private templateModel: Model<EmailTemplateDocument>,
  ) {}

  @Process(Processors.SEND_EMAIL)
  async handleEmail(job: Job) {
<<<<<<< HEAD
    const { to, subject, templateName, templateData } = job.data;
=======
    const { to, templateName, templateData, prefLang } = job.data;
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

    const template = await this.templateModel.findOne({ name: templateName });
    if (!template) return console.error(`Template ${templateName} not found`);

<<<<<<< HEAD
    const html = Handlebars.compile(template.html)(templateData);
    await this.emailService.sendEmail(to, subject, html);
=======
    await this.emailService.sendTemplateEmail({
      to,
      templateName,
      templateData,
      prefLang: prefLang || PreferredLanguage.ARABIC,
    });
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  }
}
