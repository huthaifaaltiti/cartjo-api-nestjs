import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from 'src/schemas/email-template.schema';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
import { Queues } from 'src/enums/queues.enum';
import { Processors } from 'src/enums/processors.enum';
import { AppEnvironments } from 'src/enums/appEnvs.enum';
import { EmailLogService } from './EmailLogService.service';
import { EmailSendingStatus } from 'src/enums/emailSendingStatus.enum';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly isDev: boolean;
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplateDocument>,
    @InjectQueue(Queues.EMAIL_QUEUE)
    private readonly emailQueue: Queue,
    private readonly emailLogService: EmailLogService,
  ) {
    this.isDev = process.env.NODE_ENV === AppEnvironments.DEVELOPMENT;
  }

  async onModuleInit() {
    if (this.isDev) {
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST_DIV_ENV,
        port: Number(process.env.SMTP_PORT_DIV_ENV),
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      Logger.log(`✅ Ethereal account created: ${testAccount.user}`);
    } else {
      if (!process.env.SENDGRID_API_KEY) {
        Logger.error('❌ SENDGRID_API_KEY is missing');
        return;
      }

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      Logger.log('✅ SendGrid API initialized');
    }
  }

  private renderTemplate(html: string, data: Record<string, any>): string {
    return html.replace(/{{(.*?)}}/g, (_, key) => {
      const value = data[key.trim()];
      return value !== undefined ? value : `{{${key}}}`;
    });
  }

  private async getTemplate(
    templateName: string,
  ): Promise<EmailTemplate | null> {
    return this.templateModel.findOne({ name: templateName }).lean();
  }

  async sendTemplateEmail({
    to,
    templateName,
    templateData,
    prefLang,
  }: {
    to: string;
    templateName: string;
    templateData: Record<string, any>;
    prefLang: PreferredLanguage;
  }) {
    const template = await this.getTemplate(templateName);

    if (!template) {
      Logger.error(`❌ Template "${templateName}" not found`);
      return;
    }

    const subject = this.renderTemplate(
      template.subject?.[prefLang],
      templateData,
    );

    const html = this.renderTemplate(template.html?.[prefLang], templateData);

    const log = await this.emailLogService.create({
      to,
      template: templateName,
      subject,
      status: EmailSendingStatus.QUEUED,
    });

    await this.sendEmail(to, subject, html, log?._id?.toString());
  }

  async sendEmail(to: string, subject: string, html: string, logId: string) {
    try {
      if (this.isDev) {
        if (!this.transporter) {
          Logger.error('❌ Dev transporter not initialized');
          return;
        }

        const info = await this.transporter.sendMail({
          from: 'CartJO <dev@cartjo.com>',
          to,
          subject,
          html,
        });

        Logger.log(`📨 DEV email sent to ${to}`);
        Logger.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        const [response] = await sgMail.send({
          to,
          from: process.env.EMAIL_FROM_PROD_ENV || 'support@cartjo.com',
          subject,
          html,
        });

        /*
        response: Response {
          statusCode: 202,
          body: '',
          headers: Object [AxiosHeaders] {
          date: 'Tue, 16 Dec 2025 06:37:51 GMT',
          'content-length': '0',
          connection: 'keep-alive',
          server: 'nginx',
          'x-message-id': 'vxHisR_1TwyLYt2wVcNlfw',
          'access-control-allow-origin': 'https://sendgrid.    api-docs.io',
          'access-control-allow-methods': 'POST',
          'access-control-allow-headers': 'Authorization,     Content-Type, On-behalf-of, x-sg-elas-acl',
          'access-control-max-age': '600',
          'x-no-cors-reason': 'https://sendgrid.com/docs/    Classroom/Basics/API/cors.html',
          'strict-transport-security': 'max-age=31536000;     includeSubDomains',
          'content-security-policy': "frame-ancestors 'none'",
          'cache-control': 'no-cache',
          'x-content-type-options': 'no-sniff',
          'referrer-policy': 'strict-origin-when-cross-origin'
         }
        }
        */

        if (response.statusCode === 202) {
          await this.emailLogService.markSent(
            logId,
            response.headers['x-message-id'],
          );

          Logger.log(`📧 PROD email sent via SendGrid → ${to}`);
        }
      }
    } catch (error) {
      await this.emailLogService.markFailed(logId, error.message);

      Logger.error(`❌ Failed to send email to ${to}`, error);
    }
  }

  async enqueueTemplateEmail({ to, templateName, templateData, prefLang }) {
    if (this.isDev) {
      return this.sendTemplateEmail({
        to,
        templateName,
        templateData,
        prefLang,
      });
    }

    await this.emailQueue.add(Processors.SEND_EMAIL, {
      to,
      templateName,
      templateData,
      prefLang,
    });

    Logger.log(`📬 Template email enqueued for ${to}`);
  }
}
