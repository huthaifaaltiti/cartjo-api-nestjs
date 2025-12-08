import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Model } from 'mongoose';
import {
  EmailTemplate,
  EmailTemplateDocument,
} from 'src/schemas/email-template.schema';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
import { Queues } from 'src/enums/queues.enum';
import { Processors } from 'src/enums/processors.enum';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly isDev: boolean;

  constructor(
    @InjectModel(EmailTemplate.name)
    private readonly templateModel: Model<EmailTemplateDocument>,
    @InjectQueue(Queues.EMAIL_QUEUE)
    private readonly emailQueue: Queue,
  ) {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      if (this.isDev) {
        const testAccount = await nodemailer.createTestAccount();

        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST_DIV_ENV,
          port: process.env.SMTP_PORT_DIV_ENV,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        Logger.log(`✅ Ethereal account created: ${testAccount.user}`);
      } else {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        Logger.log(`✅ SMTP transporter ready`);
      }
    } catch (error) {
      Logger.error('❌ Failed to initialize transporter', error);
    }
  }

  // Helper function to replace variables in {{ }}
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

    await this.sendEmail(to, subject, html);
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!this.transporter) {
      Logger.warn('⚠️ Transporter not ready. Reinitializing...');
      await this.initializeTransporter();
    }

    if (!this.transporter) {
      Logger.error('🚨 Unable to send email — transporter not initialized');
      return;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@cartjo.com',
        to,
        subject,
        html,
      });

      if (this.isDev) {
        Logger.log(`📨 Email sent to ${to}`);
        Logger.log(`🔗 Preview: ${nodemailer.getTestMessageUrl(info)}`);
      } else {
        Logger.log(`📧 Email sent to ${to}`);
      }
    } catch (err) {
      Logger.error(`❌ Failed to send email to ${to}`, err);
    }
  }

  // enqueue template email in production
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
    });

    Logger.log(`📬 Template email enqueued for ${to}`);
  }
}
