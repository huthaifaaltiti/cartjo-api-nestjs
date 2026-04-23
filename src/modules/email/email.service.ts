import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from '../../schemas/email-template.schema';
import { Queues } from '../../enums/queues.enum';
import { EmailLogService } from './EmailLogService.service';
import { AppEnvironments } from '../../enums/appEnvs.enum';
import { EmailTemplates } from '../../enums/emailTemplates.enum';
import { getEmailFromMapping } from '../../common/utils/getEmailFromMapping';
import { PreferredLanguage } from '../../enums/preferredLanguage.enum';
import { EmailSendingStatus } from '../../enums/emailSendingStatus.enum';
import { EmailSendingProvider } from '../../enums/emailSendingProvider.enum';
import { Processors } from '../../enums/processors.enum';

type DevEmailProvider = 'ethereal' | 'ses';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly isDev: boolean;
  private readonly devEmailProvider: DevEmailProvider;
  private transporter: nodemailer.Transporter | null = null;
  private ses: SESv2Client;

  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplateDocument>,
    @InjectQueue(Queues.EMAIL_QUEUE)
    private readonly emailQueue: Queue,
    private readonly emailLogService: EmailLogService,
  ) {
    this.isDev = process.env.NODE_ENV === AppEnvironments.DEVELOPMENT;
    this.devEmailProvider =
      (process.env.DEV_EMAIL_PROVIDER as DevEmailProvider) || 'ses';
  }

  async onModuleInit() {
    if (this.isDev && this.devEmailProvider === 'ethereal') {
      // const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST_DIV_ENV,
        port: Number(process.env.SMTP_PORT_DIV_ENV),
        secure: false,
        auth: {
          // user: testAccount.user,
          user: process.env.SMTP_USER_DIV_ENV,
          // pass: testAccount.pass,
          pass: process.env.SMTP_PASS_DIV_ENV,
        },
      });

      Logger.log(
        `✅ Ethereal transporter initialized (dev): ${process.env.SMTP_USER_DIV_ENV}`,
      );
      return;
    }

    // SES
    this.ses = new SESv2Client({
      region: process.env.AWS_SES_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY!,
      },
    });

    this.transporter = nodemailer.createTransport({
      SES: {
        sesClient: this.ses,
        SendEmailCommand,
      },
    });

    Logger.log(
      this.isDev
        ? '✅ SES transporter initialized (dev)'
        : '✅ SES transporter initialized (prod)',
    );
  }

  private getEmailFrom(templateName: EmailTemplates): string {
    const mapping = getEmailFromMapping();
    let baseEmail = mapping[templateName];

    if (!baseEmail) baseEmail = process.env.EMAIL_FROM_NO_REPLY!;
    if (baseEmail.includes('@')) return baseEmail;

    return `CartJO <${baseEmail}@cartjo.com>`;
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
    templateName: EmailTemplates;
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
      provider: EmailSendingProvider.SES,
    });

    await this.sendEmail(to, subject, html, log?._id?.toString(), templateName);
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    logId: string,
    templateName: EmailTemplates,
  ) {
    if (!this.transporter) {
      Logger.error('❌ Transporter not initialized');
      return;
    }

    const emailFrom =
      this.isDev && this.devEmailProvider === 'ethereal'
        ? 'CartJO <dev@cartjo.com>'
        : this.getEmailFrom(templateName);

    try {
      const info = await this.transporter.sendMail({
        from: emailFrom,
        to,
        subject,
        html,
      });

      if (info.messageId) {
        await this.emailLogService.markSent(logId, info.messageId);
      }

      if (this.isDev && this.devEmailProvider === 'ethereal') {
        Logger.log(`📨 DEV email sent to ${to}`);
        Logger.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        Logger.log(`📧 Email sent via SES → ${to}`);
      }
    } catch (error) {
      await this.emailLogService.markFailed(logId, (error as Error)?.message);
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
